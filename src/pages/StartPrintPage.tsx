// src/pages/StartPrintPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listJobsByStatus,
  listMyJobsByStatus,
  listJobsByStatuses,
  listMyJobsByStatuses,
  PrintJob,
  approveJobAndCharge,
  userCancelJob,
  userSetDecision,
} from "@/lib/printJobs";
import AdminQuoteForm from "@/components/AdminQuoteForm";
import StartPrintToolbar from "@/components/StartPrintToolbar";
import { useAuth } from "@/contexts/AuthProvider";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

type Tab = "all" | "submitted" | "quoted" | "processing" | "completed" | "cancelled";

type UserInfo = { displayName?: string; email?: string };

/* ---------------- helpers ---------------- */
function toMillis(v: any): number {
  if (!v) return 0;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sortNewest(a: PrintJob, b: PrintJob) {
  return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}

function fmtDT(v: any) {
  try {
    if (!v) return "-";
    if (v instanceof Timestamp) return v.toDate().toLocaleString();
    if (typeof v?.toDate === "function") return v.toDate().toLocaleString();
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toLocaleString() : "-";
  } catch {
    return "-";
  }
}

/* ---------- pagination ---------- */
const PAGE_SIZE = 10;

function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-end gap-2 px-1 py-3">
      <button
        className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`rounded-md px-3 py-1.5 text-sm ${
            p === page
              ? "bg-indigo-600 text-white"
              : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

/* ---------------- component ---------------- */
export default function StartPrintPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<Record<string, UserInfo>>({});

  // pagination state
  const [page, setPage] = useState(1);

  const { user } = useAuth();
  const isAdmin = user?.email === "bimsbike@gmail.com";
  const adminUid = user?.uid ?? "admin-unknown";
  const navigate = useNavigate();

  // fetch + sort newest
  async function refresh() {
    if (!user) return;
    setNotice(null);
    try {
      let data: PrintJob[] = [];
      if (tab === "all") {
        const allStatuses: PrintJob["status"][] = [
          "submitted",
          "quoted",
          "approved",
          "processing",
          "completed",
          "cancelled",
        ];
        data = isAdmin
          ? await listJobsByStatuses(allStatuses)
          : await listMyJobsByStatuses(user.uid, allStatuses);
      } else if (tab === "processing") {
        data = isAdmin
          ? await listJobsByStatuses(["approved", "processing"])
          : await listMyJobsByStatuses(user.uid, ["approved", "processing"]);
      } else {
        data = isAdmin
          ? await listJobsByStatus(tab, 500)
          : await listMyJobsByStatus(user.uid, tab, 500);
      }
      setJobs((data || []).slice().sort(sortNewest));
      setPage(1); // reset to first page on refresh/tab change
    } catch (e: any) {
      setNotice(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAdmin, user?.uid]);

  // fetch user profiles for display names
  useEffect(() => {
    let cancelled = false;
    async function fetchUser(uid: string) {
      if (cancelled) return;
      if (userInfo[uid]) return;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data() as UserInfo;
          if (!cancelled) setUserInfo((prev) => ({ ...prev, [uid]: data }));
        }
      } catch {
        /* ignore */
      }
    }
    jobs.forEach((j) => fetchUser(j.userId));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  function renderUser(uid: string) {
    const info = userInfo[uid];
    return info?.displayName || info?.email || uid;
  }

  // USER: Approve (charge & move to processing bucket)
  async function handleApprove(jobId: string) {
    if (!user) return;
    try {
      await userSetDecision(jobId, user.uid, "approved");

      // reduce race with transaction reads
      for (let i = 0; i < 6; i++) {
        const snap = await getDoc(doc(db, "printJobs", jobId));
        const fresh = snap.data() as PrintJob | undefined;
        if (fresh?.userDecision?.state === "approved") break;
        await new Promise((r) => setTimeout(r, 150));
      }

      await approveJobAndCharge(jobId, user.uid);
      alert("Approved and queued! We’ve reserved your hours/filament.");
      setTab("processing");
      await refresh();
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("INSUFFICIENT_HOURS")) {
        alert("Insufficient hour balance. Please top-up your wallet.");
        navigate("/dashboard/topup");
      } else if (msg.includes("INSUFFICIENT_FILAMENT")) {
        alert("Insufficient filament balance. Please top-up your wallet.");
        navigate("/dashboard/topup");
      } else if (msg.includes("User has not approved")) {
        alert("Please try again in a moment.");
      } else {
        alert("Error approving job: " + msg);
      }
      await refresh();
    }
  }

  async function handleCancel(jobId: string) {
    if (!user) return;
    try {
      await userCancelJob(jobId, user.uid);
      alert("Job cancelled.");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e: any) {
      alert("Error: " + (e?.message ?? String(e)));
    }
  }

  const tabBtn = (t: Tab) =>
    `px-3 py-2 rounded-xl border transition ${
      tab === t
        ? "bg-white text-black border-white/0"
        : "text-white border-white/20 hover:bg-white/10"
    }`;

  // derived pagination
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)),
    [jobs.length]
  );

  const pagedJobs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return jobs.slice(start, start + PAGE_SIZE);
  }, [jobs, page]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white">My Print Status</h1>

      {notice && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "submitted", "quoted", "processing", "completed", "cancelled"] as Tab[]).map(
          (t) => (
            <button key={t} onClick={() => setTab(t)} className={tabBtn(t)} type="button">
              {t}
            </button>
          )
        )}
      </div>

      {/* Top pager */}
      <Pager page={page} pageCount={pageCount} onPage={setPage} />

      <div className="space-y-6">
        {pagedJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-white/10 bg-slate-900/40 shadow-inner"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="font-semibold text-white">
                  Job <span className="text-indigo-300">#{job.id}</span>
                </div>
                <div className="text-xs text-slate-300">
                  User: {renderUser(job.userId)}
                  <span className="mx-2">•</span>
                  Requested: <span className="text-slate-200">{fmtDT(job.createdAt)}</span>
                </div>
                <a
                  href={job.model.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline text-indigo-300 hover:text-indigo-200"
                >
                  Download model ({job.model.filename})
                </a>
              </div>
              <div className="text-sm text-slate-300">
                Status:{" "}
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-slate-100">
                  {job.status}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* User-submitted request summary */}
              <div className="text-sm grid md:grid-cols-2 gap-2 text-slate-200">
                <p>
                  <strong>Quantity:</strong> {job.quantity}
                </p>
                {job.settings?.filamentType && (
                  <p>
                    <strong>Filament Type:</strong> {job.settings.filamentType}
                  </p>
                )}
                {job.settings?.color && (
                  <p>
                    <strong>Color:</strong> {job.settings.color}
                  </p>
                )}
                {job.settings?.preset === "custom" && (
                  <>
                    {job.settings.infillPercent !== undefined && (
                      <p>
                        <strong>Infill %:</strong> {job.settings.infillPercent}
                      </p>
                    )}
                    {job.settings.wallLoops !== undefined && (
                      <p>
                        <strong>Wall Loops:</strong> {job.settings.wallLoops}
                      </p>
                    )}
                  </>
                )}
                {job.notes && (
                  <p className="md:col-span-2 break-words max-w-full">
                    <strong>User Notes:</strong> {job.notes}
                  </p>
                )}
              </div>

              {/* Quote details (if present) */}
              {job.quote && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <div className="mb-2 text-sm font-semibold text-indigo-200">
                    Admin Estimate
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-200">
                    <p>
                      <strong>Estimated Hours:</strong>{" "}
                      {job.quote.hours != null ? (
                        <>
                          {Math.floor(job.quote.hours)} Hours :{" "}
                          {Math.round((job.quote.hours - Math.floor(job.quote.hours)) * 60)} Minutes
                        </>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p>
                      <strong>Estimated Filament:</strong> {job.quote.grams} g
                    </p>
                    {typeof job.quote.queuePosition === "number" && (
                      <p>
                        <strong>Queue Position:</strong> {job.quote.queuePosition}
                      </p>
                    )}
                    {job.quote.notes && (
                      <p className="sm:col-span-3 break-words max-w-full">
                        <strong>Admin Notes:</strong> {job.quote.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin: quote form on submitted */}
              {isAdmin && job.status === "submitted" && tab !== "processing" && (
                <AdminQuoteForm
                  jobId={job.id!}
                  adminUid={adminUid}
                  onSaved={() => setTab("quoted")}
                />
              )}

              {/* User: actions on quoted */}
              {!isAdmin && (tab === "quoted" || job.status === "quoted") && job.quote && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleApprove(job.id!)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  >
                    Approve & Continue
                  </button>
                  <button
                    onClick={() => handleCancel(job.id!)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Cancel Job
                  </button>
                </div>
              )}

              {/* Admin: toolbar for approved/processing */}
              {isAdmin &&
                (tab === "processing" ||
                  job.status === "approved" ||
                  job.status === "processing") && (
                  <StartPrintToolbar
                    jobId={job.id!}
                    currentStatus={job.status as any}
                    onStatusChange={() => refresh()}
                  />
                )}

              {/* User message while waiting for quote */}
              {!isAdmin && !job.quote && job.status === "submitted" && (
                <div className="text-sm text-slate-300">
                  Waiting for admin to quote your job. You’ll get hours/filament estimate here.
                </div>
              )}
            </div>
          </div>
        ))}

        {!pagedJobs.length && !notice && (
          <p className="text-sm text-gray-400">No jobs in this bucket yet.</p>
        )}
      </div>

      {/* Bottom pager */}
      <Pager page={page} pageCount={pageCount} onPage={setPage} />
    </div>
  );
}
