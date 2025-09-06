// src/routes/PurchaseHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import {
  onUserTopUps,
  type TopUpRequest,
  formatIDR,
} from "../lib/wallet";

function FilamentCell({ row }: { row: TopUpRequest }) {
  // New schema: items[]
  const items = (row as any).items as
    | { material: "PLA" | "TPU"; grams: number; color: "White" | "Black" | "Gray" }[]
    | undefined;

  // Old/legacy single filament fields
  const single = row.filament;

  if (items && items.length > 0) {
    return (
      <div className="space-y-1">
        {items.map((it, idx) => (
          <div key={idx}>
            {it.material} {it.grams}g ({it.color})
          </div>
        ))}
      </div>
    );
  }

  if (single && single.grams) {
    return (
      <div>
        {single.material} {single.grams}g ({single.color})
      </div>
    );
  }

  return <span className="text-slate-400">-</span>;
}

function StatusBadge({ s }: { s: TopUpRequest["status"] }) {
  const cls =
    s === "approved"
      ? "bg-emerald-600/30 text-emerald-300"
      : s === "rejected"
      ? "bg-rose-600/30 text-rose-300"
      : "bg-amber-600/30 text-amber-300";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {s}
    </span>
  );
}

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TopUpRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const stop = onUserTopUps(user.uid, setRows, 200);
      return () => stop();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }, [user]);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Purchase History</h1>
      {err && <div className="text-rose-400">Error: {err}</div>}

      <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Hours</th>
              <th className="px-4 py-3 text-left">Filament</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-slate-400">
                  No purchases yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    {r.createdAt ? r.createdAt.toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">{r.hours || 0}</td>
                  <td className="px-4 py-3">
                    <FilamentCell row={r} />
                  </td>
                  <td className="px-4 py-3">{formatIDR(r.amountIDR || 0)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge s={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
