// src/routes/AdminHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { onAllTopUpsHistory, formatIDR, type TopUpRequest } from "../lib/wallet";

export default function AdminHistory() {
  const [rows, setRows] = useState<TopUpRequest[]>([]);

  useEffect(() => {
    const unsub = onAllTopUpsHistory(setRows, 500);
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
              <th className="px-6 py-2 text-left w-[40%]">Filament</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-slate-400">
                  No data yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800 align-top">
                  <td className="px-4 py-3">{r.createdAt?.toLocaleString?.() ?? "-"}</td>
                  <td className="px-4 py-3">{r.userEmail || r.userName || r.userId}</td>
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

function StatusBadge({ s }: { s: TopUpRequest["status"] }) {
  const cls =
    s === "approved"
      ? "bg-emerald-600/30 text-emerald-300"
      : s === "rejected"
      ? "bg-rose-600/30 text-rose-300"
      : "bg-amber-600/30 text-amber-300";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>;
}

function FilamentCell({ row }: { row: TopUpRequest }) {
  const items = (row as any).items as
    | { material: "PLA" | "TPU"; grams: number; color: "White" | "Black" | "Gray" }[]
    | undefined;

  // legacy single
  const single = (row as any).filament as
    | { material: "PLA" | "TPU"; grams: number; color: "White" | "Black" | "Gray" }
    | undefined;

  if (items?.length) {
    return (
      <div className="space-y-1">
        {items.map((it, i) => (
          <div key={i}>
            {it.material} {it.grams}g ({it.color}){i < items.length - 1 ? " +" : ""}
          </div>
        ))}
      </div>
    );
  }

  if (single?.grams) {
    return (
      <div>
        {single.material} {single.grams}g ({single.color})
      </div>
    );
  }

  // also support legacy material/grams/color flat fields
  const flat = row as any;
  if (flat.material && flat.grams) {
    return (
      <div>
        {flat.material} {flat.grams}g {flat.color ? `(${flat.color})` : ""}
      </div>
    );
  }

  return <span className="text-slate-400">-</span>;
}
