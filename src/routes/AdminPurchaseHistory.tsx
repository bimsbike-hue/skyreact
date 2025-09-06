// src/routes/AdminHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { onAllTopUps, formatIDR, type TopUpRequest } from "../lib/wallet";

export default function AdminHistory() {
  const [rows, setRows] = useState<TopUpRequest[]>([]);

  useEffect(() => {
    const stop = onAllTopUps(setRows, 500);
    return () => stop();
  }, []);

  const renderFilament = (r: TopUpRequest) => {
    if (r.items && r.items.length) {
      return r.items.map((it, i) => (
        <div key={i}>
          {it.material} {it.grams}g ({it.color}){i < r.items!.length - 1 ? " +" : ""}
        </div>
      ));
    }
    if (r.filament) {
      return (
        <div>
          {r.filament.material} {r.filament.grams}g ({r.filament.color})
        </div>
      );
    }
    if (r.material && r.grams) {
      return (
        <div>
          {r.material} {r.grams}g {r.color ? `(${r.color})` : ""}
        </div>
      );
    }
    return <span className="text-slate-400">-</span>;
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">User Purchase History</h1>

      <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/70">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Hours</th>
              <th className="px-4 py-2 text-left">Filament</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800 align-top">
                <td className="px-4 py-3">{r.createdAt?.toLocaleString?.() ?? "-"}</td>
                <td className="px-4 py-3">{r.userEmail || r.userName || r.userId}</td>
                <td className="px-4 py-3">{r.hours || 0}</td>
                <td className="px-4 py-3">{renderFilament(r)}</td>
                <td className="px-4 py-3">{formatIDR(r.amountIDR || 0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      r.status === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : r.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={6}>
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
