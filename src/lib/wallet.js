// src/lib/wallet.ts
import { doc, getDoc, setDoc, updateDoc, runTransaction, serverTimestamp, Timestamp, collection, addDoc, query, where, orderBy, limit, onSnapshot, increment, } from "firebase/firestore";
import { db } from "./firebase";
/* =========================
   Utils
   ========================= */
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
const WALLET_DOC_CANDIDATES = ["summary", "snapshot", "balances", "default"];
async function resolveWalletDocId(uid) {
    for (const id of WALLET_DOC_CANDIDATES) {
        const r = doc(db, "users", uid, "wallet", id);
        const s = await getDoc(r);
        if (s.exists())
            return id;
    }
    return "summary";
}
async function ensureWallet(uid) {
    const chosen = await resolveWalletDocId(uid);
    const ref = doc(db, "users", uid, "wallet", chosen);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            userId: uid,
            hours: 0,
            hoursBalance: 0, // legacy mirror
            filament: emptyBreakdown,
            plaGrams: 0, // legacy totals
            tpuGrams: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    else {
        const d = snap.data();
        const upd = {};
        if (typeof d.hours !== "number")
            upd.hours = 0;
        if (typeof d.hoursBalance !== "number")
            upd.hoursBalance = d.hours ?? 0;
        if (!d.filament)
            upd.filament = emptyBreakdown;
        if (typeof d.plaGrams !== "number" || typeof d.tpuGrams !== "number") {
            // compute totals from new breakdown if present
            const f = d.filament ?? emptyBreakdown;
            upd.plaGrams = (f.PLA?.White ?? 0) + (f.PLA?.Black ?? 0) + (f.PLA?.Gray ?? 0);
            upd.tpuGrams = (f.TPU?.White ?? 0) + (f.TPU?.Black ?? 0) + (f.TPU?.Gray ?? 0);
        }
        if (Object.keys(upd).length) {
            upd.updatedAt = serverTimestamp();
            await updateDoc(ref, upd);
        }
    }
    return ref.id;
}
/* =========================
   User bootstrap
   ========================= */
export async function ensureUserDoc(uid, extra) {
    const userRef = doc(db, "users", uid);
    const u = await getDoc(userRef);
    if (!u.exists()) {
        await setDoc(userRef, {
            email: extra?.email ?? null,
            providerIds: extra?.providerIds ?? [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    else {
        await updateDoc(userRef, { updatedAt: serverTimestamp() });
    }
    await ensureWallet(uid);
}
/* =========================
   CREATE top-up (user)
   Accepts BOTH shapes:
   - { hours, amountIDR, items: FilamentItem[], note? }
   - { hours, amountIDR, material, grams, color, note? } (legacy)
   ========================= */
export async function createTopUpRequest(uid, payload) {
    await ensureUserDoc(uid);
    // normalize to stored doc
    const common = {
        userId: uid,
        userEmail: payload.userEmail ?? null,
        userName: payload.userName ?? null,
        hours: Number(payload.hours || 0),
        amountIDR: Number(payload.amountIDR || 0),
        note: payload.note ?? "",
        status: "pending",
        createdAt: serverTimestamp(),
    };
    // save in a way both UIs can read:
    // - keep legacy single fields if provided
    // - and also keep items[] if provided
    const body = { ...common };
    if ("items" in payload && Array.isArray(payload.items)) {
        body.items = payload.items.map((x) => ({
            material: x.material,
            grams: Number(x.grams || 0),
            color: x.color,
        }));
    }
    if ("grams" in payload && payload.grams) {
        body.material = payload.material ?? "PLA";
        body.grams = Number(payload.grams || 0);
        body.color = payload.color ?? "White";
        // also mirror to items[] so new UIs see it
        body.items = [
            { material: body.material, grams: body.grams, color: body.color },
        ];
    }
    await addDoc(collection(db, "topups"), body);
}
/* =========================
   Query helpers
   ========================= */
const topUpFromDoc = (s) => {
    const d = s.data();
    const items = Array.isArray(d.items)
        ? d.items.map((it) => ({
            material: it.material,
            grams: Number(it.grams || 0),
            color: it.color,
        }))
        : undefined;
    const legacySingle = d.material && d.grams
        ? {
            material: d.material,
            grams: Number(d.grams || 0),
            color: d.color ?? "White",
        }
        : undefined;
    return {
        id: s.id,
        userId: d.userId,
        userEmail: d.userEmail ?? null,
        userName: d.userName ?? null,
        hours: Number(d.hours || 0),
        amountIDR: Number(d.amountIDR || 0),
        note: d.note ?? "",
        items,
        filament: legacySingle, // compatibility for UIs reading r.filament
        material: d.material,
        grams: d.grams ? Number(d.grams) : undefined,
        color: d.color,
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
    return onSnapshot(qy, (snap) => cb(snap.docs.map(topUpFromDoc)));
}
export function onUserTopUps(uid, cb, max = 100) {
    const qy = query(collection(db, "topups"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(qy, (snap) => cb(snap.docs.map(topUpFromDoc)));
}
export function onAllTopUpsHistory(cb, max = 400) {
    const qy = query(collection(db, "topups"), orderBy("createdAt", "desc"), limit(max));
    return onSnapshot(qy, (snap) => cb(snap.docs.map(topUpFromDoc)));
}
/** Back-compat name expected by some files */
export const onAllTopUps = onAllTopUpsHistory;
/* =========================
   Approve / Reject (admin)
   ========================= */
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
        // 1) Prepare increments
        const inc = {};
        const hoursInc = Number(t.hours || 0);
        if (hoursInc) {
            inc["hours"] = increment(hoursInc);
            inc["hoursBalance"] = increment(hoursInc); // legacy mirror
        }
        // Items (preferred)
        const items = Array.isArray(t.items) ? t.items : undefined;
        if (items?.length) {
            items.forEach((it) => {
                if (it.material && it.grams && it.color) {
                    inc[`filament.${it.material}.${it.color}`] = increment(Number(it.grams || 0));
                }
            });
        }
        // Legacy single
        if (t.material && t.grams && t.color) {
            inc[`filament.${t.material}.${t.color}`] = increment(Number(t.grams || 0));
        }
        if (Object.keys(inc).length) {
            inc["updatedAt"] = serverTimestamp();
            trx.update(walletRef, inc);
        }
        // 2) Update legacy totals plaGrams/tpuGrams (keep for UI that reads totals)
        const wSnap = await trx.get(walletRef);
        const w = wSnap.data() ?? {};
        const f = w.filament ?? emptyBreakdown;
        const nextPLA = (f.PLA?.White ?? 0) + (f.PLA?.Black ?? 0) + (f.PLA?.Gray ?? 0);
        const nextTPU = (f.TPU?.White ?? 0) + (f.TPU?.Black ?? 0) + (f.TPU?.Gray ?? 0);
        trx.update(walletRef, {
            plaGrams: nextPLA,
            tpuGrams: nextTPU,
        });
        // 3) Mark approved (also keep normalized fields)
        const normalizedSingle = t.material && t.grams && t.color
            ? { material: t.material, grams: Number(t.grams || 0), color: t.color }
            : {};
        trx.update(topRef, {
            status: "approved",
            approvedAt: serverTimestamp(),
            approvedBy: approver,
            ...normalizedSingle,
            // ensure items[] exists for new UIs
            items: items && items.length
                ? items.map((it) => ({
                    material: it.material,
                    grams: Number(it.grams || 0),
                    color: it.color,
                }))
                : t.material && t.grams && t.color
                    ? [
                        {
                            material: t.material,
                            grams: Number(t.grams || 0),
                            color: t.color,
                        },
                    ]
                    : [],
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
/* =========================
   Wallet listeners
   ========================= */
/** Back-compat listener: supports (uid, cb) and (uid, cb, onError) */
export function onWalletSnapshot(uid, cb, onError) {
    let unsub = null;
    let stopped = false;
    (async () => {
        const id = await resolveWalletDocId(uid);
        if (stopped)
            return;
        const ref = doc(db, "users", uid, "wallet", id);
        unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                cb(null);
                return;
            }
            const d = snap.data();
            // normalize into WalletSnapshot expected by older components
            const ws = {
                userId: uid,
                hours: d.hours ?? d.hoursBalance ?? 0,
                hoursBalance: d.hoursBalance ?? d.hours ?? 0,
                filament: d.filament ?? emptyBreakdown,
                plaGrams: d.plaGrams ??
                    ((d.filament?.PLA?.White ?? 0) + (d.filament?.PLA?.Black ?? 0) + (d.filament?.PLA?.Gray ?? 0)),
                tpuGrams: d.tpuGrams ??
                    ((d.filament?.TPU?.White ?? 0) + (d.filament?.TPU?.Black ?? 0) + (d.filament?.TPU?.Gray ?? 0)),
                updatedAt: d.updatedAt ?? null,
            };
            cb(ws);
        }, (e) => onError?.(e));
    })();
    return () => {
        stopped = true;
        if (unsub)
            unsub();
    };
}
/** Uses approved topups to compute breakdown; falls back to wallet doc if needed */
export function onFilamentBreakdown(uid, cb) {
    let fallbackUsed = false;
    const stopWallet = onWalletSnapshot(uid, (w) => {
        if (fallbackUsed || !w?.filament)
            return;
        cb({
            PLA: {
                White: w.filament.PLA?.White ?? 0,
                Black: w.filament.PLA?.Black ?? 0,
                Gray: w.filament.PLA?.Gray ?? 0,
            },
            TPU: {
                White: w.filament.TPU?.White ?? 0,
                Black: w.filament.TPU?.Black ?? 0,
                Gray: w.filament.TPU?.Gray ?? 0,
            },
        });
    });
    const qy = query(collection(db, "topups"), where("userId", "==", uid), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(500));
    const stopTopups = onSnapshot(qy, (snap) => {
        const acc = JSON.parse(JSON.stringify(emptyBreakdown));
        snap.forEach((d) => {
            const v = d.data();
            const items = Array.isArray(v.items) ? v.items : undefined;
            if (items?.length) {
                items.forEach((it) => {
                    if (it.material && it.grams && it.color) {
                        acc[it.material][it.color] += Number(it.grams || 0);
                    }
                });
            }
            else if (v.material && v.grams && v.color) {
                acc[v.material][v.color] += Number(v.grams || 0);
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
/* =========================
   Recent orders (stub)
   ========================= */
export async function listRecentOrders(_uid, _take = 5) {
    return [];
}
