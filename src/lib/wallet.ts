// src/lib/wallet.ts
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { auth } from "./firebase";

/* ========= Types ========= */

export type TopUpStatus = "pending" | "approved" | "rejected";

export type FilamentItem = {
  material: "PLA" | "TPU";
  grams: number;                   // 100, 500, 1000, ...
  color: "White" | "Black" | "Gray";
};

export type TopUpRequest = {
  id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  hours: number;                   // may be 0
  items: FilamentItem[];           // new — multiple lines
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

/* ========= Utils ========= */

const db = getFirestore();
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

/* ========= Wallet doc (compatible) ========= */

const WALLET_DOC_CANDIDATES = ["summary", "snapshot", "balances"] as const;

async function resolveWalletDocId(uid: string): Promise<string> {
  for (const id of WALLET_DOC_CANDIDATES) {
    const r = doc(db, "users", uid, "wallet", id);
    const s = await getDoc(r);
    if (s.exists()) return id;
  }
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

/* ========= User bootstrap ========= */

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

/* ========= Create top-up (ONE doc) ========= */

export async function createTopUpRequest(
  uid: string,
  payload: {
    userEmail?: string | null;
    userName?: string | null;
    hours: number;            // can be 0
    items: FilamentItem[];    // can be []
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

/* ========= Queries ========= */

const fromDoc = (s: any): TopUpRequest => {
  const d = s.data();

  // Backward compatibility with legacy one-filament docs
  const legacyItems: FilamentItem[] =
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
    items: legacyItems,
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
  return onSnapshot(qy, (snap) => cb(snap.docs.map(fromDoc)));
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
  return onSnapshot(qy, (snap) => cb(snap.docs.map(fromDoc)));
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
  return onSnapshot(qy, (snap) => cb(snap.docs.map(fromDoc)));
}

/* ========= Approve / Reject (admin) ========= */

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

    // Normalize to array
    const items: FilamentItem[] =
      t.items && Array.isArray(t.items)
        ? t.items
        : t.material && t.grams
        ? [{ material: t.material, grams: Number(t.grams || 0), color: t.color }]
        : [];

    const updates: Record<string, any> = {};
    const hoursInc = Number(t.hours || 0);
    if (hoursInc) updates["hours"] = increment(hoursInc);

    // Merge per-color increments so we only call trx.update once
    for (const it of items) {
      if (!it || !it.material || !it.color || !it.grams) continue;
      const key = `filament.${it.material}.${it.color}`;
      if (!updates[key]) updates[key] = increment(it.grams);
      else {
        // can't add two increments together; instead record sum and set later
        // use temp number and replace with increment once summed
        // but simpler: track numeric sums, then convert at the end
        updates[key] = (updates[key]._operand ?? 0) + it.grams;
      }
    }
    // convert numeric sums -> increments
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

/* ========= Wallet listeners ========= */

export function onWalletSnapshot(
  uid: string,
  cb: (wallet: any | null) => void
) {
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

/** live breakdown from approved topups with wallet fallback */
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

/* ========= Orders (stub) ========= */
export async function listRecentOrders(
  _uid: string,
  _take = 5
): Promise<Order[]> {
  return [];
}
