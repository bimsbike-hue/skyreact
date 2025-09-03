// src/routes/AdminHistory.tsx
"use client";

import { useEffect, useState } from "react";
import type { onAllTopUps, TopUpRequest, formatIDR } from "../lib/wallet";

export default function AdminHistory() {
  const [rows, setRows] = useState<TopUpRequest[]>([]);

  useEffect(() => {
    const unsub = onAllTopUps(setRows, 500);
    return () => unsub();
  }, []);

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
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{r.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {r.userEmail || r.userName || r.userId}
                </td>
                <td className="px-4 py-3">{r.hours || 0}</td>
                <td className="px-4 py-3">
                  {r.filament
                    ? `${r.filament.material} ${r.filament.grams}g${
                        r.filament.color ? ` (${r.filament.color})` : ""
                      }`
                    : "-"}
                </td>
                <td className="px-4 py-3">{formatIDR(r.amountIDR)}</td>
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
