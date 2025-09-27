// src/lib/wallet.ts
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";

/* ===================== Types ===================== */

export type TopUpStatus = "pending" | "approved" | "rejected";

export type FilamentItem = {
  material: "PLA" | "TPU";
  grams: number; // e.g. 100, 500, 1000 …
  color: "White" | "Black" | "Gray";
};

export type TopUpRequest = {
  id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  hours: number; // may be 0
  items: FilamentItem[]; // multiple line items
  amountIDR: number;
  note?: string;
  status: TopUpStatus;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
};

export type FilamentBreakdown = {
  PLA: { White: number; Black: number; Gray: number };
  TPU: { White: number; Black: number; Gray: number };
};

export type Order = {
  id: string;
  createdAt: Date;
  totalIDR: number;
  status: string;
};

/* ===================== Utils ===================== */

export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

const toDate = (v: any): Date =>
  v instanceof Timestamp ? v.toDate() : v ? new Date(v) : new Date(0);

const emptyBreakdown: FilamentBreakdown = {
  PLA: { White: 0, Black: 0, Gray: 0 },
  TPU: { White: 0, Black: 0, Gray: 0 },
};

/* ===================== Wallet doc resolution ===================== */
/** We support any of these wallet documents to be backward-compatible. */
const WALLET_DOC_CANDIDATES = ["summary", "snapshot", "balances", "default"] as const;

async function resolveWalletDocId(uid: string): Promise<string> {
  for (const id of WALLET_DOC_CANDIDATES) {
    const r = doc(db, "users", uid, "wallet", id);
    const s = await getDoc(r);
    if (s.exists()) return id;
  }
  // If nothing exists, we'll initialise "summary"
  return "summary";
}

async function ensureWallet(uid: string) {
  const chosen = await resolveWalletDocId(uid);
  const ref = doc(db, "users", uid, "wallet", chosen);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      hours: 0,
      filament: emptyBreakdown,
      createdAt: serverTimestamp(),
    });
  } else {
    const d = snap.data() as any;
    const upd: any = {};
    if (typeof d.hours !== "number") upd.hours = 0;
    if (!d.filament) upd.filament = emptyBreakdown;
    if (Object.keys(upd).length) await updateDoc(ref, upd);
  }
  return ref.id;
}

/* ===================== User bootstrap ===================== */

export async function ensureUserDoc(
  uid: string,
  extra?: Partial<{ email?: string | null; providerIds?: string[] }>
) {
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

export async function createTopUpRequest(
  uid: string,
  payload: {
    userEmail?: string | null;
    userName?: string | null;
    hours: number; // can be 0
    items: FilamentItem[]; // can be []
    amountIDR: number;
    note?: string;
  }
) {
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
    status: "pending" as TopUpStatus,
    createdAt: serverTimestamp(),
  };

  if (!normalized.hours && normalized.items.length === 0) {
    throw new Error("Nothing to top-up.");
  }

  await addDoc(collection(db, "topups"), normalized);
}

/* ===================== Queries / listeners ===================== */

const mapTopup = (s: any): TopUpRequest => {
  const d = s.data();

  // Back-compat: legacy single filament fields -> array
  const items: FilamentItem[] =
    d.items && Array.isArray(d.items)
      ? d.items
      : d.material && d.grams
      ? [
          {
            material: d.material,
            grams: Number(d.grams || 0),
            color: (d.color ?? "White") as any,
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
    status: (d.status ?? "pending") as TopUpStatus,
    createdAt: toDate(d.createdAt),
    approvedAt: d.approvedAt ? toDate(d.approvedAt) : undefined,
    approvedBy: d.approvedBy,
    rejectedAt: d.rejectedAt ? toDate(d.rejectedAt) : undefined,
    rejectedBy: d.rejectedBy,
  };
};

export function onPendingTopUps(cb: (rows: TopUpRequest[]) => void, max = 100) {
  const qy = query(
    collection(db, "topups"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}

export function onUserTopUps(
  uid: string,
  cb: (rows: TopUpRequest[]) => void,
  max = 100
) {
  const qy = query(
    collection(db, "topups"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}

export function onAllTopUpsHistory(
  cb: (rows: TopUpRequest[]) => void,
  max = 200
) {
  const qy = query(
    collection(db, "topups"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopup)));
}

/* ===================== Admin approve / reject ===================== */

export async function adminApproveTopUp(topupId: string, approver: string) {
  const topRef = doc(db, "topups", topupId);
  await runTransaction(db, async (trx) => {
    const topSnap = await trx.get(topRef);
    if (!topSnap.exists()) throw new Error("Top-up not found");
    const t = topSnap.data() as any;

    if (t.status === "approved") return; // idempotent

    const uid: string = t.userId;
    const walletId = await ensureWallet(uid);
    const walletRef = doc(db, "users", uid, "wallet", walletId);

    // Normalize to array for multi-line topups
    const items: FilamentItem[] =
      t.items && Array.isArray(t.items)
        ? t.items
        : t.material && t.grams
        ? [{ material: t.material, grams: Number(t.grams || 0), color: t.color }]
        : [];

    // Prepare a single update with all increments
    const updates: Record<string, any> = {};
    const hoursInc = Number(t.hours || 0);
    if (hoursInc) updates["hours"] = increment(hoursInc);

    // Merge filament increments
    for (const it of items) {
      if (!it || !it.material || !it.color || !it.grams) continue;
      const key = `filament.${it.material}.${it.color}`;
      // accumulate numeric sums; convert to increment at the end
      updates[key] = (updates[key] ?? 0) + Number(it.grams || 0);
    }
    // Convert numeric sums -> increment()
    for (const k of Object.keys(updates)) {
      const v = updates[k];
      if (typeof v === "number") updates[k] = increment(v);
    }

    if (Object.keys(updates).length) trx.update(walletRef, updates);

    trx.update(topRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: approver,
    });
  });
}

export async function adminRejectTopUp(
  topupId: string,
  approver: string,
  note?: string
) {
  const topRef = doc(db, "topups", topupId);
  await updateDoc(topRef, {
    status: "rejected",
    rejectedAt: serverTimestamp(),
    rejectedBy: approver,
    rejectNote: note ?? "",
  });
}

/* ===================== Wallet listeners ===================== */

export function onWalletSnapshot(uid: string, cb: (wallet: any | null) => void) {
  let unsub: (() => void) | null = null;
  let stopped = false;
  (async () => {
    const id = await resolveWalletDocId(uid);
    if (stopped) return;
    const ref = doc(db, "users", uid, "wallet", id);
    unsub = onSnapshot(ref, (snap) => cb(snap.data() || null));
  })();
  return () => {
    stopped = true;
    if (unsub) unsub();
  };
}

/** Live per-color/material breakdown derived from topups (fallback to wallet doc). */
export function onFilamentBreakdown(
  uid: string,
  cb: (b: FilamentBreakdown) => void
) {
  let fallbackUsed = false;

  const stopWallet = onWalletSnapshot(uid, (w) => {
    if (fallbackUsed || !w) return;
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

  const qy = query(
    collection(db, "topups"),
    where("userId", "==", uid),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(500)
  );

  const stopTopups = onSnapshot(
    qy,
    (snap) => {
      const acc: FilamentBreakdown = JSON.parse(
        JSON.stringify(emptyBreakdown)
      );
      snap.forEach((d) => {
        const v = d.data() as any;
        const arr: FilamentItem[] =
          v.items && Array.isArray(v.items)
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
    },
    () => {}
  );

  return () => {
    stopTopups();
    stopWallet();
  };
}

/* ===================== Orders (stub for now) ===================== */
export async function listRecentOrders(_uid: string, _take = 5): Promise<Order[]> {
  return [];
}

/* ===================== Compatibility shim ===================== */
/**
 * Some older parts of the app import `walletLedgerRef(uid)`.
 * Keep this tiny helper so those imports continue to work.
 * It points to: users/{uid}/wallet/default/ledger
 */
export function walletLedgerRef(uid: string) {
  const defaultWallet = doc(db, "users", uid, "wallet", "default");
  return collection(defaultWallet, "ledger");
}
