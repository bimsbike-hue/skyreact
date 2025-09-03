// src/lib/wallet.ts
import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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
  increment as fsIncrement,
} from "firebase/firestore";

/* ===========================
   Types
   =========================== */

export type OrderKind = "print" | "filament" | "time";
export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled";

export type Order = {
  id: string;
  userId: string;
  kind: OrderKind;
  status: OrderStatus;
  amountIDR: number;
  quantity?: number;
  filamentType?: "PLA" | "TPU" | "OTHER";
  createdAt: Date;
  notes?: string;
};

export type WalletSnapshot = {
  userId: string;
  hoursBalance: number;
  filamentGrams: number; // single bucket
  updatedAt: Date;
};

export type UserDoc = {
  email?: string | null;
  displayName?: string | null;
  providerIds?: string[];
  createdAt?: any;
  hours?: number;     // optional legacy
  plaGrams?: number;  // optional legacy
  tpuGrams?: number;  // optional legacy
};

export type TopUpStatus = "pending" | "approved" | "rejected";

export type TopUpFilament = {
  material: "PLA" | "TPU";
  grams: number;
  color?: "White" | "Black" | "Gray";
};

export type TopUpRequest = {
  id: string;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  hours: number;               // +hours to add
  filament?: TopUpFilament;    // optional filament pack
  grams?: number;              // (kept for backward compat if you used grams directly)
  amountIDR: number;           // total charged
  status: TopUpStatus;
  note?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
};

/* ===========================
   Utils
   =========================== */

export function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount || 0)));
}

/* ===========================
   User + Wallet
   =========================== */

/**
 * Ensure a user doc and a wallet doc exist with defaults.
 */
export async function ensureUserDoc(
  uid: string,
  extras: Partial<UserDoc & { email?: string | null; providerIds?: string[] }> = {}
): Promise<void> {
  if (!uid) throw new Error("ensureUserDoc: missing uid");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const baseUser: UserDoc = {
    createdAt: serverTimestamp(),
    hours: 0,
    plaGrams: 0,
    tpuGrams: 0,
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, { ...baseUser, ...extras }, { merge: true });
  } else {
    await setDoc(userRef, { ...baseUser, ...extras }, { merge: true });
  }

  const walletRef = doc(db, "users", uid, "wallet", "default");
  const walletSnap = await getDoc(walletRef);
  if (!walletSnap.exists()) {
    await setDoc(walletRef, {
      userId: uid,
      hoursBalance: 0,
      filamentGrams: 0,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * One-time read of wallet snapshot.
 */
export async function getWallet(userId: string): Promise<WalletSnapshot> {
  const walletRef = doc(db, "users", userId, "wallet", "default");
  const snap = await getDoc(walletRef);

  if (!snap.exists()) {
    await ensureUserDoc(userId);
    return {
      userId,
      hoursBalance: 0,
      filamentGrams: 0,
      updatedAt: new Date(),
    };
  }
  const d = snap.data() as any;
  return {
    userId,
    hoursBalance: Number(d.hoursBalance ?? 0),
    filamentGrams: Number(d.filamentGrams ?? 0),
    updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toDate() : new Date(),
  };
}

/**
 * Live wallet listener for Dashboard UI.
 */
export function onWalletSnapshot(
  userId: string,
  cb: (wallet: WalletSnapshot) => void,
  onError?: (e: unknown) => void
) {
  const walletRef = doc(db, "users", userId, "wallet", "default");
  return onSnapshot(
    walletRef,
    (snap) => {
      if (!snap.exists()) {
        cb({
          userId,
          hoursBalance: 0,
          filamentGrams: 0,
          updatedAt: new Date(),
        });
        return;
      }
      const d = snap.data() as any;
      cb({
        userId,
        hoursBalance: Number(d.hoursBalance ?? 0),
        filamentGrams: Number(d.filamentGrams ?? 0),
        updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toDate() : new Date(),
      });
    },
    (e) => onError?.(e)
  );
}

/**
 * Set/merge wallet balances.
 */
export async function setWallet(
  userId: string,
  data: Partial<Pick<WalletSnapshot, "hoursBalance" | "filamentGrams">>
) {
  const walletRef = doc(db, "users", userId, "wallet", "default");
  await setDoc(walletRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Increment (atomic) balances.
 */
export async function incrementWallet(
  userId: string,
  delta: Partial<Pick<WalletSnapshot, "hoursBalance" | "filamentGrams">>
) {
  const walletRef = doc(db, "users", userId, "wallet", "default");
  const patch: Record<string, any> = { updatedAt: serverTimestamp() };
  if (typeof delta.hoursBalance === "number") patch.hoursBalance = fsIncrement(delta.hoursBalance);
  if (typeof delta.filamentGrams === "number") patch.filamentGrams = fsIncrement(delta.filamentGrams);
  await updateDoc(walletRef, patch);
}

/* ===========================
   Orders (Recent)
   =========================== */

export async function listRecentOrders(userId: string, limitCount = 10): Promise<Order[]> {
  const col = collection(db, "users", userId, "orders");
  const qy = query(col, orderBy("createdAt", "desc"), limit(limitCount));
  const snap = await getDocs(qy);

  const rows: Order[] = [];
  snap.forEach((docu) => {
    const d = docu.data() as any;
    rows.push({
      id: docu.id,
      userId,
      kind: (d.kind ?? "print") as OrderKind,
      status: (d.status ?? "pending") as OrderStatus,
      amountIDR: Number(d.amountIDR ?? 0),
      quantity: d.quantity ?? undefined,
      filamentType: d.filamentType ?? undefined,
      createdAt:
        d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(d.createdAt ?? Date.now()),
      notes: d.notes ?? undefined,
    });
  });
  return rows;
}

/* ===========================
   Top-up Flow
   =========================== */

export async function createTopUpRequest(
  userId: string,
  data: {
    userEmail?: string | null;
    userName?: string | null;
    hours: number;
    filament?: TopUpFilament;
    grams?: number; // backward compat
    amountIDR: number;
    note?: string;
  }
) {
  const colRef = collection(db, "topups");
  const docRef = await addDoc(colRef, {
    userId,
    userEmail: data.userEmail ?? "",
    userName: data.userName ?? "",
    hours: Math.max(0, Number(data.hours || 0)),
    filament: data.filament ?? null,
    grams: data.grams ? Math.max(0, Number(data.grams)) : null,
    amountIDR: Math.max(0, Number(data.amountIDR || 0)),
    note: data.note ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** User’s own top-ups (live). */
export function onMyTopUps(userId: string, cb: (rows: TopUpRequest[]) => void, n = 50) {
  const colRef = collection(db, "topups");
  const qy = query(
    colRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  return onSnapshot(qy, (snap) => {
    const rows: TopUpRequest[] = [];
    snap.forEach((d) => {
      const x = d.data() as any;
      rows.push({
        id: d.id,
        userId: x.userId,
        userEmail: x.userEmail ?? undefined,
        userName: x.userName ?? undefined,
        hours: Number(x.hours || 0),
        filament: x.filament ?? undefined,
        grams: x.grams != null ? Number(x.grams) : undefined,
        amountIDR: Number(x.amountIDR || 0),
        status: x.status as TopUpStatus,
        note: x.note ?? "",
        createdAt: x.createdAt instanceof Timestamp ? x.createdAt.toDate() : new Date(),
        approvedAt: x.approvedAt instanceof Timestamp ? x.approvedAt.toDate() : undefined,
        approvedBy: x.approvedBy ?? undefined,
      });
    });
    cb(rows);
  });
}

/** Admin: pending top-ups (live). Requires composite index on (status, createdAt). */
export function onPendingTopUps(cb: (rows: TopUpRequest[]) => void, n = 100) {
  const colRef = collection(db, "topups");
  const qy = query(
    colRef,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc"),
    limit(n)
  );
  return onSnapshot(qy, (snap) => {
    const rows: TopUpRequest[] = [];
    snap.forEach((d) => {
      const x = d.data() as any;
      rows.push({
        id: d.id,
        userId: x.userId,
        userEmail: x.userEmail ?? undefined,
        userName: x.userName ?? undefined,
        hours: Number(x.hours || 0),
        filament: x.filament ?? undefined,
        grams: x.grams != null ? Number(x.grams) : undefined,
        amountIDR: Number(x.amountIDR || 0),
        status: x.status as TopUpStatus,
        note: x.note ?? "",
        createdAt: x.createdAt instanceof Timestamp ? x.createdAt.toDate() : new Date(),
      });
    });
    cb(rows);
  });
}

/** Admin: all top-ups history (live). Requires composite index on (userId, createdAt) OR (createdAt) depending on your sort/filter. */
export function onAllTopUpsHistory(cb: (rows: TopUpRequest[]) => void, n = 500) {
  const colRef = collection(db, "topups");
  const qy = query(colRef, orderBy("createdAt", "desc"), limit(n));
  return onSnapshot(qy, (snap) => {
    const rows: TopUpRequest[] = [];
    snap.forEach((d) => {
      const x = d.data() as any;
      rows.push({
        id: d.id,
        userId: x.userId,
        userEmail: x.userEmail ?? undefined,
        userName: x.userName ?? undefined,
        hours: Number(x.hours || 0),
        filament: x.filament ?? undefined,
        grams: x.grams != null ? Number(x.grams) : undefined,
        amountIDR: Number(x.amountIDR || 0),
        status: x.status as TopUpStatus,
        note: x.note ?? "",
        createdAt: x.createdAt instanceof Timestamp ? x.createdAt.toDate() : new Date(),
        approvedAt: x.approvedAt instanceof Timestamp ? x.approvedAt.toDate() : undefined,
        approvedBy: x.approvedBy ?? undefined,
      });
    });
    cb(rows);
  });
}

/** Admin: approve top-up (atomic). */
export async function adminApproveTopUp(topUpId: string, adminIdOrEmail: string) {
  const topRef = doc(db, "topups", topUpId);

  await runTransaction(db, async (trx) => {
    const snap = await trx.get(topRef);
    if (!snap.exists()) throw new Error("TopUp not found");
    const x = snap.data() as any;
    if (x.status !== "pending") return; // idempotent

    const userId = x.userId as string;
    const addHours = Number(x.hours || 0);
    const addGrams =
      x.filament?.grams != null ? Number(x.filament.grams) :
      x.grams != null ? Number(x.grams) : 0;

    // 1) credit wallet
    const walletRef = doc(db, "users", userId, "wallet", "default");
    const wSnap = await trx.get(walletRef);
    const currentH = wSnap.exists() ? Number((wSnap.data() as any).hoursBalance || 0) : 0;
    const currentG = wSnap.exists() ? Number((wSnap.data() as any).filamentGrams || 0) : 0;

    trx.set(
      walletRef,
      {
        userId,
        hoursBalance: currentH + addHours,
        filamentGrams: currentG + addGrams,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2) mark approved
    trx.update(topRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: adminIdOrEmail,
    });

    // 3) optional wallet ledger
    const ledgerCol = collection(db, "users", userId, "wallet_tx");
    trx.set(doc(ledgerCol), {
      kind: "credit",
      hours: addHours,
      grams: addGrams,
      note: `TopUp ${topUpId}`,
      createdAt: serverTimestamp(),
    });
  });
}

/** Admin: reject top-up. */
export async function adminRejectTopUp(topUpId: string, adminIdOrEmail: string, note = "") {
  const topRef = doc(db, "topups", topUpId);
  await updateDoc(topRef, {
    status: "rejected",
    approvedBy: adminIdOrEmail,
    approvedAt: serverTimestamp(),
    note,
  });
}
