// src/lib/printJobs.ts
import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, serverTimestamp, updateDoc, where, } from "firebase/firestore";
import { db } from "./firebase";
/* ===================== Helpers ===================== */
const JOBS = "printJobs";
/** Remove all undefined values so Firestore never sees them */
function pruneUndefined(value) {
    if (Array.isArray(value)) {
        return value.map(pruneUndefined);
    }
    if (value !== null && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (v === undefined)
                continue;
            out[k] = pruneUndefined(v);
        }
        return out;
    }
    return value;
}
/** Compute next queue position = (# of approved + processing) + 1 */
async function computeNextQueuePosition() {
    const qy = query(collection(db, JOBS), where("status", "in", ["approved", "processing"]));
    const snap = await getDocs(qy);
    return snap.size + 1;
}
/** Normalise materials/colors to the keys you store in wallet/summary */
const normMaterial = (x) => {
    const s = (x || "").trim().toUpperCase();
    if (s.startsWith("TPU"))
        return "TPU";
    if (s.startsWith("PLA"))
        return "PLA";
    return "OTHER"; // not deducted today, but keeps shape stable
};
const normColor = (x) => {
    const s = (x || "").trim().toLowerCase();
    if (s.startsWith("wh"))
        return "White";
    if (s.startsWith("bl"))
        return "Black";
    return "Gray"; // treat gray/grey as Gray
};
/* ===================== Admin: set quote ===================== */
export async function adminSetQuote(jobId, adminUid, slicing, quote) {
    // auto queue if not provided
    let queuePosition = quote.queuePosition;
    if (queuePosition === undefined) {
        try {
            queuePosition = await computeNextQueuePosition();
        }
        catch {
            queuePosition = 1;
        }
    }
    const cleanSlicing = pruneUndefined({
        ...slicing,
        by: adminUid,
        at: serverTimestamp(),
    });
    const cleanQuote = pruneUndefined({
        ...quote,
        queuePosition,
    });
    const ref = doc(db, JOBS, jobId);
    await updateDoc(ref, {
        status: "quoted",
        slicing: cleanSlicing,
        quote: cleanQuote,
    });
}
/* ===================== User: decision ===================== */
export async function userSetDecision(jobId, uid, state, message) {
    const ref = doc(db, JOBS, jobId);
    const snap = await getDoc(ref);
    if (!snap.exists())
        throw new Error("Job not found");
    const job = snap.data();
    if (job.userId !== uid)
        throw new Error("You can only act on your own job");
    if (job.status !== "quoted")
        throw new Error("Job is not in quoted state");
    await updateDoc(ref, pruneUndefined({
        userDecision: {
            state,
            at: serverTimestamp(),
            ...(message ? { message } : {}),
        },
    }));
}
/* ===================== USER: Approve + Charge (wallet/summary) ===================== */
/**
 * Deducts from users/{uid}/wallet/summary:
 *   - hours (number)
 *   - filament.<Material>.<Color> (dot-path update)
 * Creates a ledger under wallet/summary/ledger and advances job to "approved".
 */
export async function approveJobAndCharge(jobId, uid) {
    const jobRef = doc(db, JOBS, jobId);
    const walletSummaryRef = doc(db, "users", uid, "wallet", "summary");
    await runTransaction(db, async (tx) => {
        // 1) Load job
        const jobSnap = await tx.get(jobRef);
        if (!jobSnap.exists())
            throw new Error("Job not found");
        const job = jobSnap.data();
        if (job.userId !== uid)
            throw new Error("Not your job");
        if (job.status !== "quoted")
            throw new Error("Job is not quoted");
        if (job.userDecision?.state !== "approved") {
            throw new Error("User has not approved");
        }
        // 2) Amounts to charge
        const qHours = Number(job.quote?.hours ?? 0);
        const qGrams = Number(job.quote?.grams ?? 0);
        const qAmount = Number(job.quote?.amountIDR ?? 0);
        const mat = normMaterial(job.settings?.filamentType);
        const col = normColor(job.settings?.color);
        // 3) Read wallet/summary
        const wSnap = await tx.get(walletSummaryRef);
        if (!wSnap.exists())
            throw new Error("INSUFFICIENT_HOURS"); // no wallet => not funded
        const w = wSnap.data();
        const hoursAvail = Number(w?.hours ?? 0);
        const gramsAvail = Number(w?.filament?.[mat]?.[col] ?? 0);
        if (hoursAvail < qHours)
            throw new Error("INSUFFICIENT_HOURS");
        if (gramsAvail < qGrams)
            throw new Error("INSUFFICIENT_FILAMENT");
        // 4) Deduct with dot-path update to the exact bucket
        const filamentPath = `filament.${mat}.${col}`;
        tx.update(walletSummaryRef, {
            hours: hoursAvail - qHours,
            [filamentPath]: gramsAvail - qGrams,
            updatedAt: serverTimestamp(),
        });
        // 5) Ledger entry users/{uid}/wallet/summary/ledger/{autoId}
        const ledgerCol = collection(walletSummaryRef, "ledger");
        const newEntry = doc(ledgerCol);
        tx.set(newEntry, {
            kind: "print",
            jobId,
            delta: { hours: -qHours, grams: -qGrams, amountIDR: -qAmount },
            material: mat,
            color: col,
            createdAt: serverTimestamp(),
            note: "Charge on job approval",
        });
        // 6) Lock & advance job
        tx.update(jobRef, {
            status: "approved",
            walletCharge: pruneUndefined({
                hours: qHours,
                grams: qGrams,
                amountIDR: qAmount,
                at: serverTimestamp(),
            }),
            locked: pruneUndefined({
                hours: qHours,
                grams: qGrams,
                amountIDR: qAmount,
            }),
        });
    });
}
/* ===================== User: Cancel ===================== */
export async function userCancelJob(jobId, uid) {
    const jobRef = doc(db, JOBS, jobId);
    const snap = await getDoc(jobRef);
    if (!snap.exists())
        throw new Error("Job not found");
    const job = snap.data();
    if (job.userId !== uid)
        throw new Error("Not your job");
    if (job.status !== "submitted" && job.status !== "quoted") {
        throw new Error("Only submitted or quoted jobs can be cancelled.");
    }
    await updateDoc(jobRef, {
        status: "cancelled",
        userDecision: { state: "cancelled", at: serverTimestamp() },
    });
}
/* ===================== Admin ops ===================== */
export async function adminStartPrint(jobId, printerId, printerName) {
    const jobRef = doc(db, JOBS, jobId);
    await updateDoc(jobRef, pruneUndefined({
        status: "processing",
        printer: { id: printerId, ...(printerName ? { name: printerName } : {}) },
        startedAt: serverTimestamp(),
    }));
}
export async function adminCompletePrint(jobId, actuals, photos) {
    const jobRef = doc(db, JOBS, jobId);
    await updateDoc(jobRef, pruneUndefined({
        status: "completed",
        actuals,
        photos: photos ?? [],
        completedAt: serverTimestamp(),
    }));
}
export async function adminCancelPrint(jobId, reason) {
    const jobRef = doc(db, JOBS, jobId);
    await updateDoc(jobRef, pruneUndefined({
        status: "cancelled",
        adminError: reason ? { message: reason, at: serverTimestamp() } : null,
    }));
}
export async function adminMarkError(jobId, message) {
    const jobRef = doc(db, JOBS, jobId);
    await updateDoc(jobRef, {
        status: "error",
        adminError: { message, at: serverTimestamp() },
    });
}
/* ===================== Queries ===================== */
export async function listJobsByStatus(status, _limit = 50) {
    const qy = query(collection(db, JOBS), where("status", "==", status), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function listMyJobsByStatus(uid, status, _limit = 50) {
    const qy = query(collection(db, JOBS), where("userId", "==", uid), where("status", "==", status), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function listJobsByStatuses(statuses, _limit = 50) {
    const qy = query(collection(db, JOBS), where("status", "in", statuses), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function listMyJobsByStatuses(uid, statuses, _limit = 50) {
    const qy = query(collection(db, JOBS), where("userId", "==", uid), where("status", "in", statuses), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
