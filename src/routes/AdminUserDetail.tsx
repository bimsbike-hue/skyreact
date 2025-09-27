// src/routes/AdminUserDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PrintJob } from "@/lib/printJobs";

/* ----------------------------- Types ----------------------------- */

type WalletSummary = {
  hours: number;
  filament?: Record<string, Record<string, number>>; // e.g. PLA: { Black: 200, White: 100 }
};

type UserDoc = {
  displayName?: string;
  email?: string;
  phone?: string;       // we’ll store the “No HP” here
  address?: string;
};

type StatusCounts = {
  submitted: number;
  quoted: number;
  processing: number; // (approved ∪ processing)
  completed: number;
};

/* --------------------------- Utilities --------------------------- */

function toMillis(v: any): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapJobs(snap: QuerySnapshot<DocumentData>): PrintJob[] {
  const rows: PrintJob[] = [];
  snap.forEach((d) => rows.push({ ...(d.data() as any), id: d.id }));
  return rows;
}

function sortByCreatedAtDesc(a: any, b: any) {
  return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}

function formatHM(totalHours: number | undefined) {
  const h = Math.max(0, Math.floor(Number(totalHours || 0)));
  const minutes = Math.round((Number(totalHours || 0) - h) * 60);
  const hh = `${h} ${h === 1 ? "Hour" : "Hours"}`;
  const mm = `${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
  return `${hh} : ${mm}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/30",
    quoted: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
    approved: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
    processing: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
    completed: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
    cancelled: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
    error: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
  };
  const cls =
    map[status] ||
    "bg-slate-600/10 text-slate-300 ring-slate-400/30";
  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${cls} uppercase tracking-wide`}>
      {status}
    </span>
  );
}

/* ---------------------------- Component -------------------------- */

export default function AdminUserDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const walletRef = doc(db, "users", uid, "wallet", "summary");
    const jobsQ = query(
      collection(db, "printJobs"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    let stopJobs = () => {};

    (async () => {
      const [uSnap, wSnap] = await Promise.all([getDoc(userRef), getDoc(walletRef)]);
      if (uSnap.exists()) setUserDoc(uSnap.data() as UserDoc);
      if (wSnap.exists()) setWallet(wSnap.data() as WalletSummary);

      stopJobs = onSnapshot(
        jobsQ,
        (snap) => {
          setJobs(mapJobs(snap));
          setLoading(false);
        },
        async () => {
          // fallback if no index: fetch without order and sort locally
          const fallbackQ = query(collection(db, "printJobs"), where("userId", "==", uid));
          const first = await getDocs(fallbackQ);
          const rows = mapJobs(first).sort(sortByCreatedAtDesc);
          setJobs(rows);
          setLoading(false);
        }
      );
    })();

    return () => {
      stopJobs?.();
    };
  }, [uid]);

  const counts: StatusCounts = useMemo(() => {
    const out: StatusCounts = { submitted: 0, quoted: 0, processing: 0, completed: 0 };
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
      }
    }
    return out;
  }, [jobs]);

  const recent = useMemo(() => jobs.slice(0, 6), [jobs]);

  /* ---------------------------- UI Pieces ---------------------------- */

  function StatCard({
    title,
    value,
    sub,
  }: {
    title: string;
    value: React.ReactNode;
    sub?: string;
  }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner">
        <div className="text-xs font-medium text-slate-400 mb-2">{title}</div>
        <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    );
  }

  function ProfileCard() {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-white font-semibold mb-3">Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-slate-400">Name</div>
            <div className="text-slate-200">{userDoc?.displayName || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400">Email</div>
            <div className="text-slate-200">{userDoc?.email || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400">Phone (WA)</div>
            <div className="text-slate-200">{userDoc?.phone || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400">Address</div>
            <div className="text-slate-200">{userDoc?.address || "—"}</div>
          </div>
        </div>
      </div>
    );
  }

  function FilamentGroup({
    title,
    colors,
  }: {
    title: string;
    colors: Record<string, number>;
  }) {
    const total = Object.values(colors).reduce((a, b) => a + (Number(b) || 0), 0);
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <div className="text-white font-semibold mb-2">{title}</div>
        <div className="space-y-1 text-sm text-slate-300">
          {Object.keys(colors).length === 0 && <div>—</div>}
          {Object.entries(colors).map(([c, grams]) => (
            <div key={c} className="flex justify-between">
              <span>{c}</span>
              <span className="tabular-nums">{grams} g</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-slate-200 border-t border-white/10 pt-1 mt-1">
            <span>Total</span>
            <span className="tabular-nums">{total} g</span>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- Render ------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header / breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">User Detail</h1>
          <div className="text-sm text-slate-400">
            {userDoc?.displayName || "—"} • {userDoc?.email || "—"}
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/admin-users")}
          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-2 text-sm"
        >
          Back to list
        </button>
      </div>

      {/* Stat Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Hours Balance"
          value={<span className="tabular-nums">{formatHM(wallet?.hours)}</span>}
          sub="Usable for print jobs (Hours : Minutes)"
        />
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner">
          <div className="text-xs font-medium text-slate-400 mb-3">Filament Balance</div>
          <div className="space-y-2 text-sm text-slate-200">
            {wallet?.filament ? (
              Object.entries(wallet.filament).map(([mat, colors]) => {
                const sum = Object.values(colors).reduce((a, b) => a + (Number(b) || 0), 0);
                return (
                  <div key={mat} className="flex justify-between">
                    <span>{mat}</span>
                    <span className="tabular-nums">{sum} g</span>
                  </div>
                );
              })
            ) : (
              <div>—</div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner">
          <div className="text-xs font-medium text-slate-400 mb-3">Jobs Summary</div>
          <div className="space-y-1 text-sm text-slate-200">
            <div className="flex justify-between">
              <span>Submitted</span>
              <span className="tabular-nums">{counts.submitted}</span>
            </div>
            <div className="flex justify-between">
              <span>Quoted</span>
              <span className="tabular-nums">{counts.quoted}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing</span>
              <span className="tabular-nums">{counts.processing}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="tabular-nums">{counts.completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <ProfileCard />

      {/* Filament details by material */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <h3 className="text-white font-semibold mb-3">Filament details</h3>
        {!wallet?.filament ? (
          <div className="text-sm text-slate-400">No filament info.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(wallet.filament).map(([mat, colors]) => (
              <FilamentGroup key={mat} title={mat} colors={colors} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Jobs */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-white font-semibold">Recent Jobs</h3>
          {!loading && recent.length > 0 && (
            <div className="text-xs text-slate-400">{recent.length} shown</div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-slate-400">No jobs yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-white text-sm truncate">
                    <span className="text-white/80 mr-1">#{j.id?.slice(0, 5)}</span>
                    — {j.model?.filename}
                  </div>
                  <div className="text-xs text-slate-400">
                    {j.settings?.filamentType} • {j.settings?.color}
                  </div>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
