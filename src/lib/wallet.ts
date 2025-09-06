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
import { auth } from "../lib/firebase";

/* =========================
   Types
   ========================= */
export type TopUpStatus = "pending" | "approved" | "rejected";

export type FilamentItem = {
  material: "PLA" | "TPU";
  grams: number;
  color: "White" | "Black" | "Gray";
};

export type FilamentSelection = FilamentItem;

export type TopUpRequest = {
  id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  hours: number;
  amountIDR: number;
  items?: FilamentItem[]; // NEW schema
  filament?: FilamentSelection; // legacy compat
  material?: "PLA" | "TPU"; // legacy compat
  grams?: number; // legacy compat
  color?: "White" | "Black" | "Gray"; // legacy compat
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

/* =========================
   Utils
   ========================= */
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

/* -------------------------------------------------
   Wallet doc resolution (backward compatible)
   ------------------------------------------------- */
const WALLET_DOC_CANDIDATES = ["summary", "snapshot", "balances", "default"] as const;

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
      updatedAt: serverTimestamp(),
    });
  } else {
    const d = snap.data() as any;
    const upd: any = { updatedAt: serverTimestamp() };
    if (typeof d.hours !== "number") upd.hours = 0;
    if (!d.filament) upd.filament = emptyBreakdown;
    if (Object.keys(upd).length) await updateDoc(ref, upd);
  }
  return ref.id;
}

/* =========================
   User bootstrap
   ========================= */
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
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, { updatedAt: serverTimestamp() });
  }
  await ensureWallet(uid);
}

/* =========================
   Create top-up (user)
   ========================= */
export async function createTopUpRequest(
  uid: string,
  payload: {
    userEmail?: string | null;
    userName?: string | null;
    hours: number;
    items?: FilamentItem[]; // preferred
    amountIDR: number;
    note?: string;

    // legacy single filament (fallback)
    filament?: FilamentSelection;
    grams?: number;
    material?: "PLA" | "TPU";
    color?: "White" | "Black" | "Gray";
  }
) {
  await ensureUserDoc(uid);

  const body: any = {
    userId: uid,
    userEmail: payload.userEmail ?? null,
    userName: payload.userName ?? null,
    hours: Number(payload.hours || 0),
    amountIDR: Number(payload.amountIDR || 0),
    note: payload.note ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  };

  if (payload.items && payload.items.length) {
    body.items = payload.items
      .filter((it) => it && it.grams && it.material && it.color)
      .map((it) => ({
        material: it.material,
        grams: Number(it.grams || 0),
        color: it.color,
      }));
  } else {
    const single =
      payload.filament ||
      (payload.grams && payload.material && payload.color
        ? { grams: Number(payload.grams), material: payload.material, color: payload.color }
        : undefined);
    if (single) {
      body.filament = {
        material: single.material,
        grams: Number(single.grams || 0),
        color: single.color,
      };
      body.material = single.material;
      body.grams = Number(single.grams || 0);
      body.color = single.color;
    }
  }

  await addDoc(collection(db, "topups"), body);
}

/* =========================
   Query mappers / listeners
   ========================= */
const mapTopUp = (s: any): TopUpRequest => {
  const d = s.data();
  const row: TopUpRequest = {
    id: s.id,
    userId: d.userId,
    userEmail: d.userEmail ?? null,
    userName: d.userName ?? null,
    hours: Number(d.hours || 0),
    amountIDR: Number(d.amountIDR || 0),
    note: d.note ?? "",
    status: (d.status ?? "pending") as TopUpStatus,
    createdAt: toDate(d.createdAt),
    approvedAt: d.approvedAt ? toDate(d.approvedAt) : undefined,
    approvedBy: d.approvedBy,
    rejectedAt: d.rejectedAt ? toDate(d.rejectedAt) : undefined,
    rejectedBy: d.rejectedBy,
  };

  if (Array.isArray(d.items) && d.items.length) {
    row.items = d.items.map((it: any) => ({
      material: it.material as "PLA" | "TPU",
      grams: Number(it.grams || 0),
      color: it.color as "White" | "Black" | "Gray",
    }));
  }

  if (!row.items?.length) {
    const grams = Number(d.grams || d?.filament?.grams || 0);
    const material = (d.material || d?.filament?.material) as "PLA" | "TPU" | undefined;
    const color = (d.color || d?.filament?.color) as "White" | "Black" | "Gray" | undefined;
    if (material && grams && color) {
      row.filament = { material, grams, color };
    }
  }

  return row;
};

export function onPendingTopUps(cb: (rows: TopUpRequest[]) => void, max = 100) {
  const qy = query(
    collection(db, "topups"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopUp)));
}

export function onUserTopUps(uid: string, cb: (rows: TopUpRequest[]) => void, max = 100) {
  const qy = query(
    collection(db, "topups"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopUp)));
}

export function onAllTopUpsHistory(cb: (rows: TopUpRequest[]) => void, max = 400) {
  const qy = query(collection(db, "topups"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(qy, (snap) => cb(snap.docs.map(mapTopUp)));
}
export const onAllTopUps = onAllTopUpsHistory;

/* =========================
   Approve / Reject (admin)
   ========================= */
export async function adminApproveTopUp(topupId: string, approver: string) {
  const topRef = doc(db, "topups", topupId);

  await runTransaction(db, async (trx) => {
    const topSnap = await trx.get(topRef);
    if (!topSnap.exists()) throw new Error("Top-up not found");

    const t = topSnap.data() as any;
    if (t.status === "approved") return;

    const uid: string = t.userId;
    const walletId = await ensureWallet(uid);
    const walletRef = doc(db, "users", uid, "wallet", walletId);

    const updates: Record<string, any> = { updatedAt: serverTimestamp() };

    const hoursInc = Number(t.hours || 0);
    if (hoursInc) updates["hours"] = increment(hoursInc);

    if (Array.isArray(t.items) && t.items.length) {
      (t.items as any[]).forEach((it: any) => {
        const m = it?.material as "PLA" | "TPU" | undefined;
        const c = it?.color as "White" | "Black" | "Gray" | undefined;
        const g = Number(it?.grams || 0);
        if (m && c && g) {
          updates[`filament.${m}.${c}`] = increment(g);
        }
      });
    } else {
      const m = (t.material ?? t?.filament?.material) as "PLA" | "TPU" | undefined;
      const c = (t.color ?? t?.filament?.color) as "White" | "Black" | "Gray" | undefined;
      const g = Number(t.grams ?? t?.filament?.grams ?? 0);
      if (m && c && g) {
        updates[`filament.${m}.${c}`] = increment(g);
      }
    }

    if (Object.keys(updates).length > 1) {
      trx.update(walletRef, updates);
    }

    const patch: any = {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: approver,
    };
    if (!Array.isArray(t.items) || !t.items.length) {
      patch.material = t.material ?? t?.filament?.material ?? null;
      patch.grams = Number(t.grams ?? t?.filament?.grams ?? 0);
      patch.color = t.color ?? t?.filament?.color ?? null;
    }
    trx.update(topRef, patch);
  });
}

export async function adminRejectTopUp(topupId: string, approver: string, note?: string) {
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

/**
 * Primary: sum approved topups; Fallback: wallet doc
 */
export function onFilamentBreakdown(uid: string, cb: (b: FilamentBreakdown) => void) {
  let fallbackUsed = false;

  const qy = query(
    collection(db, "topups"),
    where("userId", "==", uid),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(500)
  );

  const stopWallet = onWalletSnapshot(uid, (w) => {
    if (fallbackUsed || !w) return;
    if (w.filament) {
      cb({
        PLA: {
          White: Number(w.filament?.PLA?.White || 0),
          Black: Number(w.filament?.PLA?.Black || 0),
          Gray: Number(w.filament?.PLA?.Gray || 0),
        },
        TPU: {
          White: Number(w.filament?.TPU?.White || 0),
          Black: Number(w.filament?.TPU?.Black || 0),
          Gray: Number(w.filament?.TPU?.Gray || 0),
        },
      });
    }
  });

  const stopTopups = onSnapshot(
    qy,
    (snap) => {
      const acc: FilamentBreakdown = {
        PLA: { White: 0, Black: 0, Gray: 0 },
        TPU: { White: 0, Black: 0, Gray: 0 },
      };

      snap.forEach((d) => {
        const v = d.data() as any;

        if (Array.isArray(v.items) && v.items.length) {
          (v.items as any[]).forEach((it: any) => {
            const m = it?.material as "PLA" | "TPU" | undefined;
            const c = it?.color as "White" | "Black" | "Gray" | undefined;
            const g = Number(it?.grams || 0);
            if (m && c && g) acc[m][c] += g;
          });
        } else {
          const m = v.material as "PLA" | "TPU" | undefined;
          const c = v.color as "White" | "Black" | "Gray" | undefined;
          const g = Number(v.grams || v?.filament?.grams || 0);
          if (m && c && g) acc[m][c] += g;
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

/* =========================
   Recent orders (stub)
   ========================= */
export async function listRecentOrders(_uid: string, _take = 5): Promise<Order[]> {
  return [];
}
