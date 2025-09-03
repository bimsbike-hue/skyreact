"use client";
import { useEffect, useState } from "react";
import WalletCards from "../components/WalletCards";
import { listRecentOrders, type Order } from "../lib/wallet";

import { useAuth } from "../contexts/AuthProvider";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      setLoadingOrders(true);
      const rows = await listRecentOrders(user.uid, 5);
      if (!cancelled) setOrders(rows);
      setLoadingOrders(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="space-y-6">
      <WalletCards />
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
