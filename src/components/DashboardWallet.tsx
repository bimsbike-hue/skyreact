// src/components/DashboardWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

type WalletView = {
  hoursBalance: number;
  plaGrams: number;
  tpuGrams: number;
};

export default function DashboardWallet() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [wallet, setWallet] = useState<WalletView>({
    hoursBalance: 0,
    plaGrams: 0,
    tpuGrams: 0,
  });

  useEffect(() => {
    if (!uid) {
      setWallet({ hoursBalance: 0, plaGrams: 0, tpuGrams: 0 });
      return;
    }
    const unsub = onWalletSnapshot(uid, (w) => {
      setWallet({
        hoursBalance: Number(w?.hoursBalance ?? 0),
        // your schema currently exposes filamentGrams; fall back to plaGrams if present
        plaGrams: Number((w as any)?.filamentGrams ?? (w as any)?.plaGrams ?? 0),
        tpuGrams: Number((w as any)?.tpuGrams ?? 0),
      });
    });
    return () => unsub();
  }, [uid]);

  if (!uid) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">Hours Balance</h3>
        <p className="text-2xl">{wallet.hoursBalance}</p>
        <p className="text-sm text-slate-500">Usable for print jobs</p>
      </div>

      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">PLA Balance</h3>
        <p className="text-2xl">{wallet.plaGrams}</p>
        <p className="text-sm text-slate-500">Filament stock</p>
      </div>

      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">TPU Balance</h3>
        <p className="text-2xl">{wallet.tpuGrams}</p>
        <p className="text-sm text-slate-500">Filament stock</p>
      </div>
    </div>
  );
}
