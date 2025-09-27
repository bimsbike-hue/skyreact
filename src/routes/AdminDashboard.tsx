import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
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

/* ---------- types ---------- */
type TopUp = {
  id: string;
  userId: string;
  userEmail?: string | null;
  hours?: number;
  items?: Array<{ material: "PLA" | "TPU"; color: "White" | "Black" | "Gray"; grams: number }>;
  amountIDR?: number;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Timestamp | any;
  approvedAt?: Timestamp | any;
  rejectedAt?: Timestamp | any;
  approvedBy?: string;
  rejectedBy?: string;
};

type JobCounts = {
  submitted: number;
  quoted: number;
  processing: number; // approved ∪ processing
  completed: number;
  cancelled: number;
};

const EMPTY_COUNTS: JobCounts = {
  submitted: 0,
  quoted: 0,
  processing: 0,
  completed: 0,
  cancelled: 0,
};

/* ---------- shared UI ---------- */
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

function KpiCard({
  label,
  value,
  tone = "indigo",
}: {
  label: string;
  value: number | string;
  tone?: "indigo" | "amber" | "emerald" | "cyan" | "sky";
}) {
  const ring =
    tone === "amber"
      ? "ring-amber-400/30 text-amber-200"
      : tone === "emerald"
      ? "ring-emerald-400/30 text-emerald-200"
      : tone === "cyan"
      ? "ring-cyan-400/30 text-cyan-200"
      : tone === "sky"
      ? "ring-sky-400/30 text-sky-200"
      : "ring-indigo-400/30 text-indigo-200";

  return (
    <div className={`rounded-2xl bg-slate-900/60 ring-1 ${ring} p-4`}>
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

function Tag({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "indigo" | "amber" | "sky" | "emerald" | "rose" | "slate" | "cyan";
}) {
  const cls =
    tone === "indigo"
      ? "bg-indigo-500/10 text-indigo-200"
      : tone === "amber"
      ? "bg-amber-500/10 text-amber-200"
      : tone === "sky"
      ? "bg-sky-500/10 text-sky-200"
      : tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-200"
      : tone === "rose"
      ? "bg-rose-500/10 text-rose-200"
      : tone === "cyan"
      ? "bg-cyan-500/10 text-cyan-200"
      : "bg-slate-700/50 text-slate-200";
  return <span className={`px-2 py-0.5 rounded-md text-xs uppercase ${cls}`}>{children}</span>;
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2">
      {children}
    </div>
  );
}

/* ---------- helpers ---------- */
function toMillis(v: any): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function sortByCreatedAtDesc(a: any, b: any) {
  return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}
function mapDocs<T = any>(snap: QuerySnapshot<DocumentData>): T[] {
  const rows: any[] = [];
  snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
  return rows as T[];
}

/* ---------- page ---------- */
export default function AdminDashboard() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [pendingTopUps, setPendingTopUps] = useState<TopUp[]>([]);
  const [recentTopUps, setRecentTopUps] = useState<TopUp[]>([]);
  const [loadedJobs, setLoadedJobs] = useState(false);

  // Jobs listener with fallback
  useEffect(() => {
    const col = collection(db, "printJobs");
    const qWithOrder = query(col, orderBy("createdAt", "desc"));
    const qWithoutOrder = query(col);

    const stop = onSnapshot(
      qWithOrder,
      (snap) => {
        setJobs(mapDocs<PrintJob>(snap));
        setLoadedJobs(true);
      },
      async () => {
        try {
          const first = await getDocs(qWithoutOrder);
          const rows = mapDocs<PrintJob>(first).sort(sortByCreatedAtDesc);
          setJobs(rows);
          setLoadedJobs(true);
        } catch {
          setJobs([]);
          setLoadedJobs(true);
        }
        onSnapshot(qWithoutOrder, (snap2) => {
          setJobs(mapDocs<PrintJob>(snap2).sort(sortByCreatedAtDesc));
        });
      }
    );
    return stop;
  }, []);

  // TopUps: pending (live)
  useEffect(() => {
    const col = collection(db, "topups");
    const qy = query(col, where("status", "==", "pending"));
    const stop = onSnapshot(
      qy,
      (snap) => {
        setPendingTopUps(mapDocs<TopUp>(snap).sort(sortByCreatedAtDesc));
      },
      async () => {
        const first = await getDocs(qy);
        setPendingTopUps(mapDocs<TopUp>(first).sort(sortByCreatedAtDesc));
      }
    );
    return stop;
  }, []);

  // TopUps: recent approvals / rejections (live)
  useEffect(() => {
    const col = collection(db, "topups");
    const qWithOrder = query(col, where("status", "in", ["approved", "rejected"]), orderBy("createdAt", "desc"));
    const qFallback = query(col, where("status", "in", ["approved", "rejected"]));

    const stop = onSnapshot(
      qWithOrder,
      (snap) => {
        const rows = mapDocs<TopUp>(snap).sort(sortByCreatedAtDesc).slice(0, 6);
        setRecentTopUps(rows);
      },
      async () => {
        const first = await getDocs(qFallback);
        const rows = mapDocs<TopUp>(first).sort(sortByCreatedAtDesc).slice(0, 6);
        setRecentTopUps(rows);
      }
    );
    return stop;
  }, []);

  // Derived job counts
  const counts = useMemo<JobCounts>(() => {
    if (!loadedJobs) return EMPTY_COUNTS;
    const out = { ...EMPTY_COUNTS };
    for (const j of jobs) {
      switch (j.status) {
        case "submitted":
          out.submitted++;
          break;
        case "quoted":
          out.quoted++;
          break;
        case "approved":
        case "processing":
          out.processing++;
          break;
        case "completed":
          out.completed++;
          break;
        case "cancelled":
          out.cancelled++;
          break;
      }
    }
    return out;
  }, [jobs, loadedJobs]);

  // Queue
  const queue = useMemo<PrintJob[]>(() => {
    const rows = jobs.filter(j => j.status === "approved" || j.status === "processing");
    rows.sort((a, b) => {
      const qa = a?.quote?.queuePosition ?? 999999;
      const qb = b?.quote?.queuePosition ?? 999999;
      if (qa !== qb) return qa - qb;
      return sortByCreatedAtDesc(a, b);
    });
    return rows.slice(0, 12);
  }, [jobs]);

  // Recent jobs (submitted/quoted)
  const recentJobs = useMemo<PrintJob[]>(() => {
    return jobs.filter(j => j.status === "submitted" || j.status === "quoted").slice(0, 8);
  }, [jobs]);

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* animated blobs (match Home) */}
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <motion.div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>

      {/* content */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">Live operational overview</p>
        </div>

        {/* KPIs */}
        <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-4">
          <KpiCard label="Top-Ups Pending" value={pendingTopUps.length} tone="amber" />
          <KpiCard label="Jobs Submitted" value={counts.submitted} tone="indigo" />
          <KpiCard label="Jobs Quoted" value={counts.quoted} tone="sky" />
          <KpiCard label="In Queue / Processing" value={counts.processing} tone="cyan" />
          <KpiCard label="Completed (Total)" value={counts.completed} tone="emerald" />
        </div>

        {/* queue + pending topups */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Current Queue">
            {queue.length === 0 ? (
              <p className="text-sm text-slate-300">No jobs in the queue yet.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((j) => (
                  <Row key={j.id}>
                    <div className="min-w-0">
                      <div className="text-white truncate">#{j.id?.slice(0, 6)} — {j.model?.filename}</div>
                      <div className="text-xs text-slate-400">{j.settings?.filamentType} • {j.settings?.color}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tag tone="sky">{j.status}</Tag>
                      {typeof j.quote?.queuePosition === "number" && (
                        <Tag tone="indigo">Queue {j.quote.queuePosition}</Tag>
                      )}
                    </div>
                  </Row>
                ))}
              </div>
            )}
          </Card>

          <Card title="Top-Ups Pending Approval">
            {pendingTopUps.length === 0 ? (
              <p className="text-sm text-slate-300">No pending requests.</p>
            ) : (
              <div className="space-y-2">
                {pendingTopUps.slice(0, 10).map((t) => (
                  <Row key={t.id}>
                    <div className="min-w-0">
                      <div className="text-white truncate">#{t.id?.slice(0, 6)} — {t.userEmail || t.userId}</div>
                      <div className="text-xs text-slate-400">
                        {t.hours ? `${t.hours} h` : ""}{" "}
                        {t.items && t.items.length
                          ? `• ${t.items.map(i => `${i.material} ${i.color} ${i.grams}g`).join(", ")}`
                          : ""}
                      </div>
                    </div>
                    <Tag tone="amber">pending</Tag>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Recently Submitted / Quoted">
            {recentJobs.length === 0 ? (
              <p className="text-sm text-slate-300">No recent jobs.</p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((j) => (
                  <Row key={j.id}>
                    <div className="min-w-0">
                      <div className="text-white truncate">#{j.id?.slice(0, 6)} — {j.model?.filename}</div>
                      <div className="text-xs text-slate-400">{j.settings?.filamentType} • {j.settings?.color}</div>
                    </div>
                    <Tag tone={j.status === "submitted" ? "indigo" : "amber"}>{j.status}</Tag>
                  </Row>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent Top-Up Activity">
            {recentTopUps.length === 0 ? (
              <p className="text-sm text-slate-300">No recent approvals/rejections.</p>
            ) : (
              <div className="space-y-2">
                {recentTopUps.map((t) => (
                  <Row key={t.id}>
                    <div className="min-w-0">
                      <div className="text-white truncate">#{t.id?.slice(0, 6)} — {t.userEmail || t.userId}</div>
                      <div className="text-xs text-slate-400">
                        {t.hours ? `${t.hours} h` : ""}{" "}
                        {t.items && t.items.length
                          ? `• ${t.items.map(i => `${i.material} ${i.color} ${i.grams}g`).join(", ")}`
                          : ""}
                      </div>
                    </div>
                    <Tag tone={t.status === "approved" ? "emerald" : "rose"}>{t.status}</Tag>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
