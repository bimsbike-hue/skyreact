// src/contexts/WalletProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "./AuthProvider";

type WalletDoc = {
  hours?: number;
  filament?: {
    PLA?: { White?: number; Black?: number; Gray?: number };
    TPU?: { White?: number; Black?: number; Gray?: number };
  };
};

type WalletState = {
  wallet: WalletDoc | null;
};

const Ctx = createContext<WalletState>({ wallet: null });

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletDoc | null>(null);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      return;
    }
    const stop = onWalletSnapshot(user.uid, (w) => setWallet(w as WalletDoc | null));
    return () => stop();
  }, [user]);

  return <Ctx.Provider value={{ wallet }}>{children}</Ctx.Provider>;
}

export const useWallet = () => useContext(Ctx);
