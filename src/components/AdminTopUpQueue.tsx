"use client";

import { useEffect, useState } from "react";
import { onPendingTopUps, adminApproveTopUp, adminRejectTopUp, type TopUpRequest } from "../lib/wallet";

export default function AdminTopUpQueue({ adminIdOrEmail }: { adminIdOrEmail: string }) {
  const [rows, setRows] = useState<TopUpRequest[]>([]);

  useEffect(() => {
    const unsub = onPendingTopUps(setRows, 50);
    return () => unsub();
  }, []);

  async function approve(id: string) {
    if (!confirm("Approve this top-up and credit the wallet?")) return;
    await adminApproveTopUp(id, adminIdOrEmail);
  }
  async function reject(id: string) {
    const note = prompt("Reason (optional)") || "";
    await adminRejectTopUp(id, adminIdOrEmail, note);
  }

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <h3 className="text-lg font-semibold mb-3">Pending Top-Ups</h3>
      {rows.length === 0 ? (
        <div className="text-gray-300">No pending requests.</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Hours</th>
              <th className="py-2 pr-4">Grams</th>
              <th className="py-2 pr-4">Total (IDR)</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-100">
            {rows.map(r => (
              <tr key={r.id} className="border-t border-gray-700/60">
                <td className="py-2 pr-4">{r.id.slice(0,8)}…</td>
                <td className="py-2 pr-4">{r.userId}</td>
                <td className="py-2 pr-4">{r.hours}</td>
                <td className="py-2 pr-4">{r.grams}</td>
                <td className="py-2 pr-4">Rp {r.amountIDR.toLocaleString("id-ID")}</td>
                <td className="py-2 pr-4 flex gap-2">
                  <button className="px-3 py-1 rounded bg-emerald-600" onClick={() => approve(r.id)}>Approve</button>
                  <button className="px-3 py-1 rounded bg-rose-600" onClick={() => reject(r.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
