// src/components/DashboardWallet.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { onWalletSnapshot } from "../lib/wallet";

type WalletDoc = {
  hours?: number;
  filament?: {
    PLA?: { White?: number; Black?: number; Gray?: number };
    TPU?: { White?: number; Black?: number; Gray?: number };
  };
};

export default function DashboardWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    const stop = onWalletSnapshot(user.uid, (w) => setWallet(w as WalletDoc | null));
    return () => stop();
  }, [user]);

  if (!user) return <p className="text-slate-300">Please sign in to see your wallet.</p>;
  if (!wallet) return <p className="text-slate-300">Loading wallet…</p>;

  const plaTotal = useMemo(() => {
    const p = wallet.filament?.PLA || {};
    return Number(p.White || 0) + Number(p.Black || 0) + Number(p.Gray || 0);
  }, [wallet]);

  const tpuTotal = useMemo(() => {
    const t = wallet.filament?.TPU || {};
    return Number(t.White || 0) + Number(t.Black || 0) + Number(t.Gray || 0);
  }, [wallet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl shadow bg-slate-900/70 border border-slate-700/60">
        <h3 className="text-sm text-slate-300">Hours Balance</h3>
        <p className="text-2xl text-white font-semibold">{wallet.hours ?? 0}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-slate-900/70 border border-slate-700/60">
        <h3 className="text-sm text-slate-300">PLA (total grams)</h3>
        <p className="text-2xl text-white font-semibold">{plaTotal}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-slate-900/70 border border-slate-700/60">
        <h3 className="text-sm text-slate-300">TPU (total grams)</h3>
        <p className="text-2xl text-white font-semibold">{tpuTotal}</p>
      </div>
    </div>
  );
}
