// src/routes/AdminPurchaseHistory.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  onAllTopUpsHistory,
  type TopUpRequest,
  formatIDR,
} from "../lib/wallet";

const PAGE_SIZE = 12 as const; // items per page

function StatusBadge({ s }: { s: TopUpRequest["status"] }) {
  const cls =
    s === "approved"
      ? "bg-emerald-600/30 text-emerald-300"
      : s === "rejected"
      ? "bg-rose-600/30 text-rose-300"
      : "bg-amber-600/30 text-amber-300";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${cls}`}>
      {s}
    </span>
  );
}

function FilamentCell({ row }: { row: TopUpRequest }) {
  // New schema: items[]
  const items = (row as any).items as
    | { material: "PLA" | "TPU"; grams: number; color: "White" | "Black" | "Gray" }[]
    | undefined;

  // Legacy single filament
  const single = (row as any).filament;

  if (items && items.length > 0) {
    return (
      <div className="space-y-0.5">
        {items.map((it, i) => (
          <div key={i} className="whitespace-nowrap">
            {it.material} {it.grams}g ({it.color})
          </div>
        ))}
      </div>
    );
  }

  if (single && single.grams) {
    return (
      <div className="whitespace-nowrap">
        {single.material} {single.grams}g ({single.color})
      </div>
    );
  }

  return <span className="text-slate-400">-</span>;
}

type StatusFilter = "all" | TopUpRequest["status"];

export default function AdminPurchaseHistory() {
  const [allRows, setAllRows] = useState<TopUpRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // filters + paging
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // subscribe once; stream up to 400 records (adjust if you like)
  useEffect(() => {
    try {
      const stop = onAllTopUpsHistory(setAllRows, 400);
      return () => stop();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }, []);

  // derived: filtered list
  const filtered = useMemo(() => {
    const base = [...allRows].sort((a, b) => {
      const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toMillis?.() ?? 0;
      const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toMillis?.() ?? 0;
      return tb - ta;
    });
    if (statusFilter === "all") return base;
    return base.filter((r) => r.status === statusFilter);
  }, [allRows, statusFilter]);

  // total pages + current page slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  useEffect(() => {
    // whenever filter changes or totalPages changes, ensure page is valid
    setPage((p) => Math.min(Math.max(p, 1), totalPages));
  }, [totalPages, statusFilter]);

  const pageRows = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, clampedPage]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin – All Purchases</h1>
          <p className="text-xs text-slate-400">
            Showing {pageRows.length} of {filtered.length} (page {clampedPage} of {totalPages})
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200">
          Error: {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Created</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Hours</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200 w-[40%]">
                Filament
              </th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-slate-400 text-center">
                  No purchases found.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.createdAt
                      ? (r.createdAt as any)?.toLocaleString?.() ??
                        (r.createdAt as any)?.toDate?.()?.toLocaleString?.() ??
                        "-"
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[22rem]">
                        {r.userEmail || r.userName || r.userId}
                      </span>
                      {r.userEmail && r.userId && (
                        <span className="text-xs text-slate-400">{r.userId}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.hours ?? 0}</td>
                  <td className="px-4 py-3">
                    <FilamentCell row={r} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatIDR(r.amountIDR || 0)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge s={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
          disabled={clampedPage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-slate-200">
          Page <span className="tabular-nums">{clampedPage}</span> /{" "}
          <span className="tabular-nums">{totalPages}</span>
        </span>
        <button
          className="rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
          disabled={clampedPage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </section>
  );
}
