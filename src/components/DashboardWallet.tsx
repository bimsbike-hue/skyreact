// src/components/DashboardWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { onWalletSnapshot } from "@/lib/wallet";

/**
 * We support BOTH schemas:
 *  A) New: { hours: number, filament: { PLA: {White,Black,Gray}, TPU: {...} } }
 *  B) Legacy: { hoursBalance, plaGrams, tpuGrams }
 */
type WalletNew =
  | {
      hours?: number;
      filament?: {
        PLA?: { White?: number; Black?: number; Gray?: number };
        TPU?: { White?: number; Black?: number; Gray?: number };
      };
    }
  | null;

type WalletLegacy =
  | {
      hoursBalance?: number;
      plaGrams?: number;
      tpuGrams?: number;
    }
  | null;

type WalletDoc = (WalletNew & WalletLegacy) | null;

export default function DashboardWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletDoc>(null);

  useEffect(() => {
    if (!user) return;
    const stop = onWalletSnapshot(user.uid, setWallet);
    return () => stop();
  }, [user]);

  if (!user) return <p className="text-slate-400">Please sign in to see your wallet.</p>;
  if (!wallet) return <p className="text-slate-400">Loading wallet…</p>;

  // Hours (prefer new schema)
  const hours =
    typeof wallet.hours === "number"
      ? wallet.hours
      : typeof wallet.hoursBalance === "number"
      ? wallet.hoursBalance
      : 0;

  // PLA/TPU totals
  const plaTotal =
    (wallet.filament?.PLA?.White ?? 0) +
    (wallet.filament?.PLA?.Black ?? 0) +
    (wallet.filament?.PLA?.Gray ?? 0);

  const tpuTotal =
    (wallet.filament?.TPU?.White ?? 0) +
    (wallet.filament?.TPU?.Black ?? 0) +
    (wallet.filament?.TPU?.Gray ?? 0);

  // Fallback to legacy flat grams if new breakdown not present
  const PLA = plaTotal || (wallet.plaGrams ?? 0);
  const TPU = tpuTotal || (wallet.tpuGrams ?? 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-slate-300">Hours Balance</h3>
        <p className="text-2xl font-extrabold text-white">{hours}</p>
      </div>
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-slate-300">PLA Balance (g)</h3>
        <p className="text-2xl font-extrabold text-white">{PLA}</p>
      </div>
      <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-slate-300">TPU Balance (g)</h3>
        <p className="text-2xl font-extrabold text-white">{TPU}</p>
      </div>
    </div>
  );
}
