"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust if your firebase init path differs
import { useAuth } from "@/lib/useAuth"; // replace with your auth hook/context

type WalletSnapshot = {
  userId: string;
  hoursBalance: number;
  plaGrams: number;
  tpuGrams: number;
  updatedAt: any; // Firestore timestamp
};

export default function DashboardWallet() {
  const { user } = useAuth(); // make sure this gives you the current Firebase user
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "wallet", "default");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as WalletSnapshot;
          setWallet(data);
        } else {
          console.warn("wallet/default doc does not exist for user:", user.uid);
          setWallet(null);
        }
      },
      (err) => {
        console.error("wallet listener error:", err);
      }
    );

    return () => unsub();
  }, [user]);

  if (!user) {
    return <p>Please sign in to see your wallet.</p>;
  }

  if (!wallet) {
    return <p>Loading wallet...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">Hours Balance</h3>
        <p className="text-2xl">{wallet.hoursBalance}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">PLA Balance</h3>
        <p className="text-2xl">{wallet.plaGrams}</p>
      </div>
      <div className="p-4 rounded-2xl shadow bg-white">
        <h3 className="text-lg font-semibold">TPU Balance</h3>
        <p className="text-2xl">{wallet.tpuGrams}</p>
      </div>
    </div>
  );
}
