// src/components/DashboardWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";

type WalletSnapshot = {
  hours?: number;
  hoursBalance?: number;
  plaGrams?: number;
  tpuGrams?: number;
};

export default function DashboardWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "wallet", "summary");
    const stop = onSnapshot(ref, (snap) => {
      setWallet((snap.data() as any) ?? null);
    });
    return () => stop();
  }, [user]);

  if (!user) return <p>Please sign in to see your wallet.</p>;
  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl shadow bg-white/5 border border-white/10">
        <h3 className="text-sm text-slate-300">Hours Balance</h3>
        <p className="text-2xl text-white">{wallet.hoursBalance ?? wallet.hours ?? 0}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-white/5 border border-white/10">
        <h3 className="text-sm text-slate-300">PLA Balance (g)</h3>
        <p className="text-2xl text-white">{wallet.plaGrams ?? 0}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-white/5 border border-white/10">
        <h3 className="text-sm text-slate-300">TPU Balance (g)</h3>
        <p className="text-2xl text-white">{wallet.tpuGrams ?? 0}</p>
      </div>
    </div>
  );
}
