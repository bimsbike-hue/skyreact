// src/routes/AdminPurchaseHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { formatIDR, onAllTopUpsHistory } from "../lib/wallet";
import type { TopUpRequest } from "../lib/wallet";

export default function AdminPurchaseHistory() {
  const [rows, setRows] = useState<TopUpRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsub = onAllTopUpsHistory(setRows, 200);
      return () => unsub();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }, []);

  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-white">Admin – All Purchases</h1>
      {err && <div className="text-red-400">Error: {err}</div>}

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
                <td className="px-4 py-3">{r.userEmail || r.userName || r.userId}</td>
                <td className="px-4 py-3">{r.hours ?? 0}</td>
                <td className="px-4 py-3">
                  {r.filament?.material
                    ? `${r.filament.material} ${r.filament.grams ?? 0}g${
                        r.filament.color ? ` (${r.filament.color})` : ""
                      }`
                    : "-"}
                </td>
                <td className="px-4 py-3">{formatIDR(r.amountIDR)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      r.status === "approved"
                        ? "bg-emerald-700/50 text-emerald-200"
                        : r.status === "rejected"
                        ? "bg-rose-700/50 text-rose-200"
                        : "bg-slate-700/60 text-slate-300"
                    }`}
                  >
                    {r.status ?? "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
