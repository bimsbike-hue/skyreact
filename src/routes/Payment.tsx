// src/routes/Payment.tsx
"use client";

import { useLocation, Link } from "react-router-dom";
import { formatIDR } from "../lib/wallet";

export default function Payment() {
  const loc = useLocation() as any;
  const total: number | undefined = loc.state?.total;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment</h1>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60">
          <h3 className="text-lg font-semibold text-white">Bank Transfer</h3>
        </div>
        <div className="p-6 text-slate-200 space-y-4">
          <p>
            Please continue your payment using the bank information below. After your payment is verified and approved by the admin, your top-up will be applied automatically.
          </p>

          <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
            <div>BCA : <b>5271041536</b></div>
            <div>A/N : <b>Bima Pratama Putra</b></div>
            {typeof total === "number" && (
              <div className="mt-2">
                Total to pay: <b>{formatIDR(total)}</b>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/dashboard/history"
              className="inline-block rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
            >
              View my purchase history
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
