// src/routes/AdminPanel.tsx
"use client";

import { useEffect, useState } from "react";
import {
  onPendingTopUps,
  adminApproveTopUp,
  adminRejectTopUp,
  formatIDR,
  type TopUpRequest,
} from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

function itemsToText(r: TopUpRequest) {
  if (!r.items?.length) return "-";
  return r.items
    .map((it) => `${it.material} ${it.grams}g (${it.color})`)
    .join(" + ");
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TopUpRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsub = onPendingTopUps(setRows, 100);
      return () => unsub();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }, []);

  async function handleApprove(id: string) {
    if (!user) return;
    await adminApproveTopUp(id, user.email ?? user.uid);
  }

  async function handleReject(id: string) {
    if (!user) return;
    const note = prompt("Reject note (optional)") ?? "";
    await adminRejectTopUp(id, user.email ?? user.uid, note);
  }

  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-white">
        Admin Panel — Pending Top-Ups
      </h1>
      {err && <div className="text-red-400">Error: {err}</div>}

      {rows.length === 0 ? (
        <div className="text-slate-400">No pending top-ups 🎉</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/70">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-800/60 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Hours</th>
                <th className="px-4 py-2 text-left">Filament</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Note</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    {r.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {r.userEmail || r.userName || r.userId}
                  </td>
                  <td className="px-4 py-3">{r.hours || 0}</td>
                  <td className="px-4 py-3">{itemsToText(r)}</td>
                  <td className="px-4 py-3">{formatIDR(r.amountIDR)}</td>
                  <td className="px-4 py-3">{r.note || "-"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
