// src/lib/printJobs.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/* ===================== Types ===================== */

export type JobStatus =
  | "submitted"
  | "quoted"
  | "approved"
  | "processing"
  | "completed"
  | "cancelled"
  | "error";

export type Quote = {
  amountIDR?: number;
  hours: number;
  grams: number;
  queuePosition?: number;
  notes?: string;
};

export type Slicing = {
  by: string;
  at?: Timestamp;
  tool?: string;
  profile?: string;
  estimate: { hours: number; grams: number };
  artifacts?: { previewUrl?: string; gcodePath?: string };
};

export type PrintJob = {
  id?: string;
  userId: string;
  status: JobStatus;
  createdAt: Timestamp;
  model: { filename: string; storagePath: string; publicUrl: string };
  settings: {
    preset?: "default" | "custom";
    layerHeightMm?: number;
    infillPercent?: number;
    wallLoops?: number;
    filamentType?: "PLA" | "TPU" | "OTHER" | string;
    color?: string;
  };
  quantity: number;
  notes?: string;

  slicing?: Slicing;
  quote?: Quote;
  userDecision?: {
    state: "approved" | "cancelled" | "changes_requested";
    at: Timestamp;
    message?: string;
  };
  walletCharge?: {
    hours: number;
    grams: number;
    amountIDR?: number;
    at: Timestamp;
  };
  locked?: { hours: number; grams: number; amountIDR?: number };
  printer?: { id: string; name?: string };
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  actuals?: { hours: number; grams: number };
  adminError?: { message: string; at: Timestamp };
  photos?: string[];
};

/* ===================== Helpers ===================== */

const JOBS = "printJobs";

/** Remove all undefined values so Firestore never sees them */
function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(pruneUndefined) as any;
  }
  if (value !== null && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value as any)) {
      if (v === undefined) continue;
      out[k] = pruneUndefined(v as any);
    }
    return out;
  }
  return value;
}

/** Compute next queue position = (# of approved + processing) + 1 */
async function computeNextQueuePosition(): Promise<number> {
  const qy = query(
    collection(db, JOBS),
    where("status", "in", ["approved", "processing"])
  );
  const snap = await getDocs(qy);
  return snap.size + 1;
}

/** Normalise materials/colors to the keys you store in wallet/summary */
const normMaterial = (x?: string) => {
  const s = (x || "").trim().toUpperCase();
  if (s.startsWith("TPU")) return "TPU";
  if (s.startsWith("PLA")) return "PLA";
  return "OTHER"; // not deducted today, but keeps shape stable
};
const normColor = (x?: string) => {
  const s = (x || "").trim().toLowerCase();
  if (s.startsWith("wh")) return "White";
  if (s.startsWith("bl")) return "Black";
  return "Gray"; // treat gray/grey as Gray
};

/* ===================== Admin: set quote ===================== */

export async function adminSetQuote(
  jobId: string,
  adminUid: string,
  slicing: Slicing,
  quote: Quote
) {
  // auto queue if not provided
  let queuePosition = quote.queuePosition;
  if (queuePosition === undefined) {
    try {
      queuePosition = await computeNextQueuePosition();
    } catch {
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
  } as any);
}

/* ===================== User: decision ===================== */

export async function userSetDecision(
  jobId: string,
  uid: string,
  state: "approved" | "cancelled" | "changes_requested",
  message?: string
) {
  const ref = doc(db, JOBS, jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Job not found");
  const job = snap.data() as PrintJob;
  if (job.userId !== uid) throw new Error("You can only act on your own job");
  if (job.status !== "quoted") throw new Error("Job is not in quoted state");

  await updateDoc(
    ref,
    pruneUndefined({
      userDecision: {
        state,
        at: serverTimestamp(),
        ...(message ? { message } : {}),
      },
    })
  );
}

/* ===================== USER: Approve + Charge (wallet/summary) ===================== */
/**
 * Deducts from users/{uid}/wallet/summary:
 *   - hours (number)
 *   - filament.<Material>.<Color> (dot-path update)
 * Creates a ledger under wallet/summary/ledger and advances job to "approved".
 */
export async function approveJobAndCharge(jobId: string, uid: string) {
  const jobRef = doc(db, JOBS, jobId);
  const walletSummaryRef = doc(db, "users", uid, "wallet", "summary");

  await runTransaction(db, async (tx) => {
    // 1) Load job
    const jobSnap = await tx.get(jobRef);
    if (!jobSnap.exists()) throw new Error("Job not found");
    const job = jobSnap.data() as PrintJob;

    if (job.userId !== uid) throw new Error("Not your job");
    if (job.status !== "quoted") throw new Error("Job is not quoted");
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
    if (!wSnap.exists()) throw new Error("INSUFFICIENT_HOURS"); // no wallet => not funded
    const w = wSnap.data() as any;

    const hoursAvail = Number(w?.hours ?? 0);
    const gramsAvail = Number(w?.filament?.[mat]?.[col] ?? 0);

    if (hoursAvail < qHours) throw new Error("INSUFFICIENT_HOURS");
    if (gramsAvail < qGrams) throw new Error("INSUFFICIENT_FILAMENT");

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
    } as any);
  });
}

/* ===================== User: Cancel ===================== */

export async function userCancelJob(jobId: string, uid: string) {
  const jobRef = doc(db, JOBS, jobId);
  const snap = await getDoc(jobRef);
  if (!snap.exists()) throw new Error("Job not found");
  const job = snap.data() as PrintJob;

  if (job.userId !== uid) throw new Error("Not your job");
  if (job.status !== "submitted" && job.status !== "quoted") {
    throw new Error("Only submitted or quoted jobs can be cancelled.");
  }

  await updateDoc(jobRef, {
    status: "cancelled",
    userDecision: { state: "cancelled", at: serverTimestamp() },
  });
}

/* ===================== Admin ops ===================== */

export async function adminStartPrint(
  jobId: string,
  printerId: string,
  printerName?: string
) {
  const jobRef = doc(db, JOBS, jobId);
  await updateDoc(
    jobRef,
    pruneUndefined({
      status: "processing",
      printer: { id: printerId, ...(printerName ? { name: printerName } : {}) },
      startedAt: serverTimestamp(),
    })
  );
}

export async function adminCompletePrint(
  jobId: string,
  actuals: { hours: number; grams: number },
  photos?: string[]
) {
  const jobRef = doc(db, JOBS, jobId);
  await updateDoc(
    jobRef,
    pruneUndefined({
      status: "completed",
      actuals,
      photos: photos ?? [],
      completedAt: serverTimestamp(),
    })
  );
}

export async function adminCancelPrint(jobId: string, reason?: string) {
  const jobRef = doc(db, JOBS, jobId);
  await updateDoc(
    jobRef,
    pruneUndefined({
      status: "cancelled",
      adminError: reason ? { message: reason, at: serverTimestamp() } : null,
    })
  );
}

export async function adminMarkError(jobId: string, message: string) {
  const jobRef = doc(db, JOBS, jobId);
  await updateDoc(jobRef, {
    status: "error",
    adminError: { message, at: serverTimestamp() },
  });
}

/* ===================== Queries ===================== */

export async function listJobsByStatus(status: JobStatus, _limit = 50) {
  const qy = query(
    collection(db, JOBS),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PrintJob[];
}

export async function listMyJobsByStatus(
  uid: string,
  status: JobStatus,
  _limit = 50
) {
  const qy = query(
    collection(db, JOBS),
    where("userId", "==", uid),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PrintJob[];
}

export async function listJobsByStatuses(statuses: JobStatus[], _limit = 50) {
  const qy = query(
    collection(db, JOBS),
    where("status", "in", statuses),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PrintJob[];
}

export async function listMyJobsByStatuses(
  uid: string,
  statuses: JobStatus[],
  _limit = 50
) {
  const qy = query(
    collection(db, JOBS),
    where("userId", "==", uid),
    where("status", "in", statuses),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PrintJob[];
}
