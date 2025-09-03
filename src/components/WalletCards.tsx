// src/components/WalletCards.tsx
"use client";

import { useEffect, useState } from "react";
import { onWalletSnapshot, type WalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

export default function WalletCards() {
  const { user } = useAuth();
  // only depend on a *stable primitive* (uid), not the whole user object
  const uid = user?.uid ?? null;

  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // when logging out, clear local state and don't subscribe
    if (!uid) {
      setWallet(null);
      setError(null);
      return;
    }

    // one subscription per uid, with proper cleanup
    const unsub = onWalletSnapshot(
      uid,
      (w) => {
        setError(null);
        setWallet(w);
      },
      (e) => {
        console.error("wallet listener error:", e);
        setError("Failed to load wallet");
      }
    );

    return () => unsub();
  }, [uid]); // <— stable dependency

  if (!uid) return null; // shouldn't render on public pages

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl shadow bg-white/5 border border-white/10">
        <h3 className="font-semibold text-white/90">Hours Balance</h3>
        <p className="mt-1 text-3xl text-white">
          {wallet ? wallet.hoursBalance : "…"}
        </p>
        <p className="text-sm text-white/50">Usable for print jobs</p>
      </div>

      <div className="p-4 rounded-xl shadow bg-white/5 border border-white/10">
        <h3 className="font-semibold text-white/90">PLA Balance</h3>
        <p className="mt-1 text-3xl text-white">
          {wallet ? wallet.filamentGrams : "…"}
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
