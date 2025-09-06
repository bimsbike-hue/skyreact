// src/routes/DashboardOverview.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import {
  onWalletSnapshot,
  onFilamentBreakdown,
  type FilamentBreakdown,
  listRecentOrders,
  type Order,
} from "../lib/wallet";

/** Try a bunch of historical keys and cast to number safely */
function extractHours(w: any): number {
  if (!w) return 0;

  // common historic variants we’ve seen in this project
  const candidates = [
    w.hours,
    w.hour,
    w.hoursBalance,
    w.balanceHours,
    w.hours_balance,
    w.totalHours,
  ];

  for (const v of candidates) {
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }

  // last-ditch: if the document is like { balances: { hours: n } }
  const nested =
    (w.balances && (w.balances.hours ?? w.balances.hour)) ??
    (w.wallet && (w.wallet.hours ?? w.wallet.hour));

  if (nested !== undefined && nested !== null && !Number.isNaN(Number(nested))) {
    return Number(nested);
  }

  return 0;
}

function HoursCard({ hours }: { hours: number }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl">
      <div className="text-sm text-slate-400">Hours Balance</div>
      <div className="mt-2 text-3xl font-semibold text-white">{hours}</div>
      <div className="text-slate-400 text-sm mt-1">Usable for print jobs</div>
    </div>
  );
}

function MaterialBlock({
  title,
  colors,
}: {
  title: "PLA" | "TPU";
  colors: Record<"White" | "Black" | "Gray", number>;
}) {
  const total = (colors.White ?? 0) + (colors.Black ?? 0) + (colors.Gray ?? 0);

  return (
    <div className="rounded-lg bg-slate-900/60 border border-slate-700/40 p-4">
      <div className="text-sm font-semibold text-slate-300 mb-2">{title}</div>

      {total === 0 ? (
        <div className="text-slate-400 text-sm">No filament yet.</div>
      ) : (
        <div className="space-y-1 text-slate-200">
          <div className="flex justify-between">
            <span>White</span>
            <span className="tabular-nums">{colors.White ?? 0} g</span>
          </div>
          <div className="flex justify-between">
            <span>Black</span>
            <span className="tabular-nums">{colors.Black ?? 0} g</span>
          </div>
          <div className="flex justify-between">
            <span>Gray</span>
            <span className="tabular-nums">{colors.Gray ?? 0} g</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();

  const [hours, setHours] = useState(0);
  const [breakdown, setBreakdown] = useState<FilamentBreakdown>({
    PLA: { White: 0, Black: 0, Gray: 0 },
    TPU: { White: 0, Black: 0, Gray: 0 },
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Hours total from wallet doc (tolerant to field name differences)
  useEffect(() => {
    if (!user) return;
    const unsub = onWalletSnapshot(user.uid, (walletDoc: any) => {
      setHours(extractHours(walletDoc));
    });
    return () => unsub?.();
  }, [user]);

  // Per-color filament breakdown from approved topups
  useEffect(() => {
    if (!user) return;
    const unsub = onFilamentBreakdown(user.uid, setBreakdown);
    return () => unsub?.();
  }, [user]);

  // Recent orders list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      setLoadingOrders(true);
      const rows = await listRecentOrders(user.uid, 5);
      if (!cancelled) setOrders(rows);
      setLoadingOrders(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Hours card only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HoursCard hours={hours} />
        <div className="hidden md:block" />
        <div className="hidden md:block" />
      </div>

      {/* Filament details */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60">
          <h3 className="text-lg font-semibold text-white">Filament details</h3>
          <p className="text-slate-400 text-sm">
            Breakdown by material and color (approved top-ups)
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaterialBlock title="PLA" colors={breakdown.PLA} />
          <MaterialBlock title="TPU" colors={breakdown.TPU} />
        </div>
      </section>

      {/* Recent orders */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
        </div>
        <div className="p-6 text-slate-200">
          {loadingOrders ? "Loading…" : orders.length ? "…your table…" : "No orders yet."}
        </div>
      </section>
    </div>
  );
}
