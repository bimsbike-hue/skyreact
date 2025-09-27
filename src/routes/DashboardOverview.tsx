import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { PrintJob } from "@/lib/printJobs";

type WalletSummary = {
  hours: number;
  filament?: Record<string, Record<string, number>>;
};

type StatusCounts = {
  submitted: number;
  quoted: number;
  processing: number; // approved ∪ processing
  completed: number;
};

const EMPTY_COUNTS: StatusCounts = {
  submitted: 0,
  quoted: 0,
  processing: 0,
  completed: 0,
};

/* ---- small UI helpers ---- */
function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl ${className}`}>
      {title && (
        <div className="px-5 pt-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}
      <div className={`${title ? "px-5 pb-5 pt-3" : "p-5"}`}>{children}</div>
    </div>
  );
}

function StatusPill({
  label,
  count,
  tint = "indigo",
}: {
  label: string;
  count: number | string;
  tint?: "indigo" | "amber" | "sky" | "emerald";
}) {
  const ring =
    tint === "indigo"
      ? "ring-indigo-400/30 text-indigo-200"
      : tint === "amber"
      ? "ring-amber-400/30 text-amber-200"
      : tint === "sky"
      ? "ring-sky-400/30 text-sky-200"
      : "ring-emerald-400/30 text-emerald-200";

  const dot =
    tint === "indigo"
      ? "bg-indigo-400/70"
      : tint === "amber"
      ? "bg-amber-400/70"
      : tint === "sky"
      ? "bg-sky-400/70"
      : "bg-emerald-400/70";

  return (
    <div className={`flex items-center gap-3 rounded-xl bg-slate-900/60 ring-1 ${ring} px-4 py-3`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="text-xs uppercase tracking-wider">{label}</span>
      <span className="ml-auto rounded-md bg-white/5 px-2 py-0.5 text-sm font-semibold text-white tabular-nums">
        {count}
      </span>
    </div>
  );
}

function fmtHoursVerbose(hours: number | null | undefined): string {
  const h = Number(hours ?? 0);
  if (!Number.isFinite(h) || h <= 0) return "0 Hours : 0 Minutes";
  const whole = Math.floor(h);
  let minutes = Math.round((h - whole) * 60);
  if (minutes === 60) {
    return `${whole + 1} Hours : 0 Minutes`;
  }
  return `${whole} Hours : ${minutes} Minutes`;
}

/* ---- page ---- */
export default function DashboardOverview() {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loadedJobs, setLoadedJobs] = useState(false);

  // Wallet (live)
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "wallet", "summary");
    const stop = onSnapshot(ref, (snap) => {
      if (snap.exists()) setWallet(snap.data() as WalletSummary);
    });
    return stop;
  }, [user?.uid]);

  // Jobs (live) with safe fallback
  useEffect(() => {
    if (!user) return;

    const baseCol = collection(db, "printJobs");
    const qWithOrder = query(
      baseCol,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const qWithoutOrder = query(baseCol, where("userId", "==", user.uid));

    const stop = onSnapshot(
      qWithOrder,
      (snap) => {
        setJobs(mapJobs(snap));
        setLoadedJobs(true);
      },
      async () => {
        try {
          const first = await getDocs(qWithoutOrder);
          const initial = mapJobs(first).sort(sortByCreatedAtDesc);
          setJobs(initial);
          setLoadedJobs(true);
        } catch {
          setJobs([]);
          setLoadedJobs(true);
        }
        onSnapshot(qWithoutOrder, (snap2) => {
          const rows = mapJobs(snap2).sort(sortByCreatedAtDesc);
          setJobs(rows);
        });
      }
    );

    return stop;
  }, [user?.uid]);

  // Counters & recent
  const counts = useMemo<StatusCounts>(() => {
    if (!loadedJobs) return EMPTY_COUNTS;
    const out = { ...EMPTY_COUNTS };
    for (const j of jobs) {
      switch (j.status) {
        case "submitted":
          out.submitted++; break;
        case "quoted":
          out.quoted++; break;
        case "approved":
        case "processing":
          out.processing++; break;
        case "completed":
          out.completed++; break;
      }
    }
    return out;
  }, [jobs, loadedJobs]);

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  function renderFilament() {
    if (!wallet?.filament) return null;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(wallet.filament).map(([type, colors]) => {
          const total = Object.values(colors).reduce((a, b) => a + b, 0);
          return (
            <Card key={type} title={type}>
              <div className="space-y-1 text-sm text-slate-300">
                {Object.entries(colors).map(([color, grams]) => (
                  <div key={color} className="flex justify-between">
                    <span>{color}</span>
                    <span>{grams} g</span>
                  </div>
                ))}
                <div className="mt-1 border-t border-white/10 pt-2 flex justify-between font-semibold text-slate-100">
                  <span>Total</span>
                  <span>{total} g</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* animated blobs to match Home */}
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <motion.div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>

      {/* content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto p-6 space-y-6"
      >
        {/* Top Row: Hours + Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="text-sm text-slate-400">Hours Balance</div>
            <div className="mt-2 text-3xl md:text-4xl font-bold text-white">
              {fmtHoursVerbose(wallet?.hours)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Usable for print jobs (Hours : Minutes)</p>
          </Card>

          <Card title="My Print Status">
            <div className="grid grid-cols-2 gap-3">
              <StatusPill label="submitted" count={counts.submitted} tint="indigo" />
              <StatusPill label="quoted" count={counts.quoted} tint="amber" />
              <StatusPill label="processing" count={counts.processing} tint="sky" />
              <StatusPill label="completed" count={counts.completed} tint="emerald" />
            </div>
          </Card>
        </div>

        {/* Filament details */}
        <Card title="Filament details">
          <p className="text-xs text-slate-400 mb-4">Breakdown by material and color (live wallet balances)</p>
          {renderFilament()}
        </Card>

        {/* Recent Orders */}
        <Card title="Recent Orders">
          {!loadedJobs ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : recentJobs.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2 text-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="text-white truncate">
                      #{job.id?.slice(0, 5)} — {job.model?.filename}
                    </span>
                    <span className="text-xs text-slate-400">
                      {job.settings?.filamentType} · {job.settings?.color}
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-700/50 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-300">
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

/* ---------- data helpers ---------- */
function mapJobs(snap: QuerySnapshot<DocumentData>): PrintJob[] {
  const rows: PrintJob[] = [];
  snap.forEach((d) => rows.push({ ...(d.data() as any), id: d.id }));
  return rows;
}
function sortByCreatedAtDesc(a: any, b: any) {
  const ta = toMillis(a?.createdAt);
  const tb = toMillis(b?.createdAt);
  return tb - ta;
}
function toMillis(v: any): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
