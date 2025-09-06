// src/components/DashboardWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { onWalletSnapshot, type FilamentBreakdown } from "../lib/wallet";

type WalletDoc = {
  hours?: number;
  filament?: FilamentBreakdown;
};

export default function DashboardWallet() {
  const [wallet, setWallet] = useState<WalletDoc | null>(null);

  useEffect(() => {
    const stop = onWalletSnapshot((w) => setWallet(w));
    return () => stop();
  }, []);

  const hours = wallet?.hours ?? 0;
  const pla =
    (wallet?.filament?.PLA?.White ?? 0) +
    (wallet?.filament?.PLA?.Black ?? 0) +
    (wallet?.filament?.PLA?.Gray ?? 0);
  const tpu =
    (wallet?.filament?.TPU?.White ?? 0) +
    (wallet?.filament?.TPU?.Black ?? 0) +
    (wallet?.filament?.TPU?.Gray ?? 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Box title="Hours Balance" value={`${hours}`} />
      <Box title="PLA Balance" value={`${pla} g`} />
      <Box title="TPU Balance" value={`${tpu} g`} />
    </div>
  );
}

function Box({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-700/60 bg-slate-900/70">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}
