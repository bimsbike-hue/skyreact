// src/components/WalletCards.tsx
"use client";

import { useEffect, useState } from "react";
import { onWalletSnapshot, type FilamentBreakdown } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

type WalletDoc = {
  hours?: number;
  filament?: FilamentBreakdown;
};

export default function WalletCards() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const stop = onWalletSnapshot(user.uid, (w) => {
      setWallet(w);
      setLoading(false);
    });
    return () => stop();
  }, [user]);

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
      <Card title="Hours Balance" value={loading ? "…" : `${hours}`} subtitle="Usable for print jobs" />
      <Card title="PLA Balance" value={loading ? "…" : `${pla} g`} subtitle="Filament stock" />
      <Card title="TPU Balance" value={loading ? "…" : `${tpu} g`} subtitle="Filament stock" />
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="mt-1 text-3xl font-extrabold text-white">{value}</div>
      {subtitle && <div className="mt-1 text-slate-500 text-sm">{subtitle}</div>}
    </div>
  );
}
