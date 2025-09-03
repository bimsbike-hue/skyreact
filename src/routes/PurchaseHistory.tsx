// src/routes/PurchaseHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";
import { formatIDR } from "../lib/wallet";

type TopUpRow = {
  id: string;
  userId: string;
  hours: number;
  grams: number;
  material?: string;
  color?: string;
  amountIDR: number;
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
};

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TopUpRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Requires index: userId + createdAt(desc)
    const col = collection(db, "topups");
    const qy = query(col, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const list: TopUpRow[] = [];
        snap.forEach((d) => {
          const x = d.data() as any;
          list.push({
            id: d.id,
            userId: x.userId,
            hours: Number(x.hours || 0),
            grams: Number(x.grams || 0),
            material: x.material,
            color: x.color,
            amountIDR: Number(x.amountIDR || 0),
            status: x.status,
            createdAt: x.createdAt
          });
        });
        setRows(list);
        setError(null);
      },
      (e) => setError(e.message || "Failed to load history")
    );
    return () => unsub();
  }, [user]);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/60">
        <h3 className="text-lg font-semibold text-white">Purchase History</h3>
      </div>
      <div className="p-6">
        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-slate-400">No purchases yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Hours</th>
                  <th className="py-2 pr-4">Filament</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {rows.map((r) => {
                  const dt =
                    r.createdAt?.toDate?.() instanceof Date
                      ? r.createdAt.toDate().toLocaleString()
                      : "-";
                  const filament =
                    r.grams > 0
                      ? `${r.material ?? "-"} ${r.grams}g${r.color ? ` (${r.color})` : ""}`
                      : "-";
                  return (
                    <tr key={r.id} className="border-t border-slate-800">
                      <td className="py-3 pr-4">{dt}</td>
                      <td className="py-3 pr-4">{r.hours || "-"}</td>
                      <td className="py-3 pr-4">{filament}</td>
                      <td className="py-3 pr-4">{formatIDR(r.amountIDR)}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            "rounded px-2 py-1 text-xs " +
                            (r.status === "approved"
                              ? "bg-green-500/20 text-green-300"
                              : r.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300")
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
