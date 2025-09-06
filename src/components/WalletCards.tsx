// src/components/WalletCards.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

type WalletDoc = {
  hours?: number;
  filament?: {
    PLA?: { White?: number; Black?: number; Gray?: number };
    TPU?: { White?: number; Black?: number; Gray?: number };
  };
};

export default function WalletCards() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    const stop = onWalletSnapshot(user.uid, (w) => setWallet(w as WalletDoc | null));
    return () => stop();
  }, [user]);

  const pla = wallet?.filament?.PLA || {};
  const tpu = wallet?.filament?.TPU || {};

  const plaTotal = useMemo(
    () => Number(pla.White || 0) + Number(pla.Black || 0) + Number(pla.Gray || 0),
    [pla.White, pla.Black, pla.Gray]
  );
  const tpuTotal = useMemo(
    () => Number(tpu.White || 0) + Number(tpu.Black || 0) + Number(tpu.Gray || 0),
    [tpu.White, tpu.Black, tpu.Gray]
  );

  if (!user) return <div className="text-slate-400">Please sign in to see wallet.</div>;
  if (!wallet) return <div className="text-slate-400">Loading wallet…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60">
        <div className="text-slate-300 text-sm">Hour Balance</div>
        <div className="text-white text-3xl font-semibold">{wallet.hours ?? 0}</div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60">
        <div className="text-slate-300 text-sm">PLA</div>
        <div className="text-white text-xl">{plaTotal} g</div>
        <div className="text-slate-400 text-xs mt-1">
          White {pla.White || 0}g • Black {pla.Black || 0}g • Gray {pla.Gray || 0}g
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60">
        <div className="text-slate-300 text-sm">TPU</div>
        <div className="text-white text-xl">{tpuTotal} g</div>
        <div className="text-slate-400 text-xs mt-1">
          White {tpu.White || 0}g • Black {tpu.Black || 0}g • Gray {tpu.Gray || 0}g
        </div>
      </div>
    </div>
  );
}
