// src/lib/wallet.ts
import { addDoc, collection, doc, getDoc, increment, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where, } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";
/* ===================== Utils ===================== */
export const formatIDR = (n) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
}).format(Math.round(n || 0));
const toDate = (v) => v instanceof Timestamp ? v.toDate() : v ? new Date(v) : new Date(0);
const emptyBreakdown = {
    PLA: { White: 0, Black: 0, Gray: 0 },
    TPU: { White: 0, Black: 0, Gray: 0 },
};
/* ===================== Wallet doc resolution ===================== */
/** We support any of these wallet documents to be backward-compatible. */
const WALLET_DOC_CANDIDATES = ["summary", "snapshot", "balances", "default"];
async function resolveWalletDocId(uid) {
    for (const id of WALLET_DOC_CANDIDATES) {
        const r = doc(db, "users", uid, "wallet", id);
        const s = await getDoc(r);
        if (s.exists())
            return id;
    }
    // If nothing exists, we'll initialise "summary"
    return "summary";
}
async function ensureWallet(uid) {
    const chosen = await resolveWalletDocId(uid);
    const ref = doc(db, "users", uid, "wallet", chosen);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            hours: 0,
            filament: emptyBreakdown,
            createdAt: serverTimestamp(),
        });
    }
    else {
        const d = snap.data();
        const upd = {};
        if (typeof d.hours !== "number")
            upd.hours = 0;
        if (!d.filament)
            upd.filament = emptyBreakdown;
        if (Object.keys(upd).length)
            await updateDoc(ref, upd);
    }
    return ref.id;
}
/* ===================== User bootstrap ===================== */
export async function ensureUserDoc(uid, extra) {
    const userRef = doc(db, "users", uid);
    const u = await getDoc(userRef);
    if (!u.exists()) {
        await setDoc(userRef, {
            email: extra?.email ?? auth.currentUser?.email ?? null,
            providerIds: extra?.providerIds ?? [],
            createdAt: serverTimestamp(),
        });
    }
    await ensureWallet(uid);
}
/* ===================== Create top-up (ONE document) ===================== */
export async function createTopUpRequest(uid, payload) {
    await ensureUserDoc(uid);
    const normalized = {
        userId: uid,
        userEmail: payload.userEmail ?? null,
        userName: payload.userName ?? null,
        hours: Number(payload.hours || 0),
        items: (payload.items || []).map((i) => ({
            material: i.material,
            grams: Number(i.grams || 0),
            color: i.color,
        })),
        amountIDR: Number(payload.amountIDR || 0),
        note: payload.note ?? "",
        status: "pending",
        createdAt: serverTimestamp(),
    };
    if (!normalized.hours && normalized.items.length === 0) {
        throw new Error("Nothing to top-up.");
    }
    await addDoc(collection(db, "topups"), normalized);
}
/* ===================== Queries / listeners ===================== */
const mapTopup = (s) => {
    const d = s.data();
    // Back-compat: legacy single filament fields -> array
    const items = d.items && Array.isArray(d.items)
        ? d.items
        : d.material && d.grams
            ? [
                {
                    material: d.material,
                    grams: Number(d.grams || 0),
                    color: (d.color ?? "White"),
                },
            ]
            : [];
    return {
        id: s.id,
        userId: d.userId,
        userEmail: d.userEmail ?? null,
        userName: d.userName ?? null,
        hours: Number(d.hours || 0),
        items,
        amountIDR: Number(d.amountIDR || 0),
        note: d.note ?? "",
        status: (d.status ?? "pending"),
        createdAt: toDate(d.createdAt),
        approvedAt: d.approvedAt ? toDate(d.approvedAt) : undefined,
        approvedBy: d.approvedBy,
        rejectedAt: d.rejectedAt ? toDate(d.rejectedAt) : undefined,
        rejectedBy: d.rejectedBy,
    };
};
export function onPendingTopUps(cb, max = 100) {
    const qy = query(collection(db, "topups"), where("status", "==", "pending"), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}
export function onUserTopUps(uid, cb, max = 100) {
    const qy = query(collection(db, "topups"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}
export function onAllTopUpsHistory(cb, max = 200) {
    const qy = query(collection(db, "topups"), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}
/* ===================== Admin approve / reject ===================== */
export async function adminApproveTopUp(topupId, approver) {
    const topRef = doc(db, "topups", topupId);
    await runTransaction(db, async (trx) => {
        const topSnap = await trx.get(topRef);
        if (!topSnap.exists())
            throw new Error("Top-up not found");
        const t = topSnap.data();
        if (t.status === "approved")
            return; // idempotent
        const uid = t.userId;
        const walletId = await ensureWallet(uid);
        const walletRef = doc(db, "users", uid, "wallet", walletId);
        // Normalize to array for multi-line topups
        const items = t.items && Array.isArray(t.items)
            ? t.items
            : t.material && t.grams
                ? [{ material: t.material, grams: Number(t.grams || 0), color: t.color }]
                : [];
        // Prepare a single update with all increments
        const updates = {};
        const hoursInc = Number(t.hours || 0);
        if (hoursInc)
            updates["hours"] = increment(hoursInc);
        // Merge filament increments
        for (const it of items) {
            if (!it || !it.material || !it.color || !it.grams)
                continue;
            const key = `filament.${it.material}.${it.color}`;
            // accumulate numeric sums; convert to increment at the end
            updates[key] = (updates[key] ?? 0) + Number(it.grams || 0);
        }
        // Convert numeric sums -> increment()
        for (const k of Object.keys(updates)) {
            const v = updates[k];
            if (typeof v === "number")
                updates[k] = increment(v);
        }
        if (Object.keys(updates).length)
            trx.update(walletRef, updates);
        trx.update(topRef, {
            status: "approved",
            approvedAt: serverTimestamp(),
            approvedBy: approver,
        });
    });
}
export async function adminRejectTopUp(topupId, approver, note) {
    const topRef = doc(db, "topups", topupId);
    await updateDoc(topRef, {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: approver,
        rejectNote: note ?? "",
    });
}
/* ===================== Wallet listeners ===================== */
export function onWalletSnapshot(uid, cb) {
    let unsub = null;
    let stopped = false;
    (async () => {
        const id = await resolveWalletDocId(uid);
        if (stopped)
            return;
        const ref = doc(db, "users", uid, "wallet", id);
        unsub = onSnapshot(ref, (snap) => cb(snap.data() || null));
    })();
    return () => {
        stopped = true;
        if (unsub)
            unsub();
    };
}
/** Live per-color/material breakdown derived from topups (fallback to wallet doc). */
export function onFilamentBreakdown(uid, cb) {
    let fallbackUsed = false;
    const stopWallet = onWalletSnapshot(uid, (w) => {
        if (fallbackUsed || !w)
            return;
        if (w.filament)
            cb({
                PLA: {
                    White: w.filament.PLA?.White || 0,
                    Black: w.filament.PLA?.Black || 0,
                    Gray: w.filament.PLA?.Gray || 0,
                },
                TPU: {
                    White: w.filament.TPU?.White || 0,
                    Black: w.filament.TPU?.Black || 0,
                    Gray: w.filament.TPU?.Gray || 0,
                },
            });
    });
    const qy = query(collection(db, "topups"), where("userId", "==", uid), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(500));
    const stopTopups = onSnapshot(qy, (snap) => {
        const acc = JSON.parse(JSON.stringify(emptyBreakdown));
        snap.forEach((d) => {
            const v = d.data();
            const arr = v.items && Array.isArray(v.items)
                ? v.items
                : v.material && v.grams
                    ? [{ material: v.material, grams: v.grams, color: v.color }]
                    : [];
            for (const it of arr) {
                if (it?.material && it?.color && it?.grams)
                    acc[it.material][it.color] += Number(it.grams || 0);
            }
        });
        fallbackUsed = true;
        cb(acc);
    }, () => { });
    return () => {
        stopTopups();
        stopWallet();
    };
}
/* ===================== Orders (stub for now) ===================== */
export async function listRecentOrders(_uid, _take = 5) {
    return [];
}
/* ===================== Compatibility shim ===================== */
/**
 * Some older parts of the app import `walletLedgerRef(uid)`.
 * Keep this tiny helper so those imports continue to work.
 * It points to: users/{uid}/wallet/default/ledger
 */
export function walletLedgerRef(uid) {
    const defaultWallet = doc(db, "users", uid, "wallet", "default");
    return collection(defaultWallet, "ledger");
}
