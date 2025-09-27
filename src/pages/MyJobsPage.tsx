// src/pages/MyJobsPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { listMyJobsByStatus, PrintJob } from "@/lib/printJobs";

type Tab = "submitted" | "quoted" | "approved" | "processing";

export default function MyJobsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("submitted");
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    (async () => {
      try {
        setNotice(null);
        const data = await listMyJobsByStatus(user.uid, tab, 50);
        if (!cancelled) setJobs(data);
      } catch (e: any) {
        if (!cancelled) setNotice(e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [tab, user]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Jobs</h1>
      </div>

      {notice && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-2 text-sm">
          {notice}
        </div>
      )}

      <div className="flex gap-2">
        {(["submitted","quoted","approved","processing"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={"px-3 py-2 rounded-xl border " + (t===tab ? "bg-white text-black" : "text-white")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {jobs.map(job => (
          <div key={job.id} className="rounded-2xl border p-4 bg-gray-50/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-semibold text-white">Job #{job.id}</div>
                <div className="text-sm text-gray-300">Qty: {job.quantity}</div>
                <div className="text-sm text-gray-300">Settings: {job.settings?.preset ?? "default"}</div>
                <a href={job.model.publicUrl} target="_blank" className="text-sm underline">
                  Download model
                </a>
              </div>
              <div className="text-sm text-gray-200">
                Status: <span className="font-medium">{job.status}</span>
              </div>
            </div>

            {/* if later you add user approval UI for quoted jobs, mount it here */}
          </div>
        ))}

        {!jobs.length && !notice && (
          <p className="text-sm text-gray-400">No jobs in this bucket yet.</p>
        )}
      </div>
    </div>
  );
}
