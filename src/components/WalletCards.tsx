// src/components/WalletCards.tsx
"use client";

import { useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

// Minimal local shape; compatible with your wallet listener
type WalletSnapshot = {
  hoursBalance?: number;
  filamentGrams?: number;
  [key: string]: any;
};

export default function WalletCards() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [error] = useState<string | null>(null); // no error callback in onWalletSnapshot

  useEffect(() => {
    if (!uid) {
      setWallet(null);
      return;
    }
    const unsub = onWalletSnapshot(uid, (w) => {
      setWallet(w || null);
    });
    return () => unsub();
  }, [uid]);

  if (!uid) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl shadow bg-white/5 border border-white/10">
        <h3 className="font-semibold text-white/90">Hours Balance</h3>
        <p className="mt-1 text-3xl text-white">
          {wallet ? wallet.hoursBalance ?? 0 : "…"}
        </p>
        <p className="text-sm text-white/50">Usable for print jobs</p>
      </div>

      <div className="p-4 rounded-xl shadow bg-white/5 border border-white/10">
        <h3 className="font-semibold text-white/90">PLA Balance</h3>
        <p className="mt-1 text-3xl text-white">
          {wallet ? wallet.filamentGrams ?? 0 : "…"}
        </p>
        <p className="text-sm text-white/50">Filament stock</p>
      </div>

      <div className="p-4 rounded-xl shadow bg-white/5 border border-white/10">
        <h3 className="font-semibold text-white/90">TPU Balance</h3>
        <p className="mt-1 text-3xl text-white">0</p>
        <p className="text-sm text-white/50">Filament stock</p>
      </div>

      {error && (
        <div className="col-span-full rounded-lg bg-red-500/10 text-red-300 px-4 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
