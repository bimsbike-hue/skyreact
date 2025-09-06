// src/contexts/WalletProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onWalletSnapshot, type FilamentBreakdown } from "../lib/wallet";
import { useAuth } from "./AuthProvider";

type WalletState = {
  hours: number;
  filament: FilamentBreakdown;
  loading: boolean;
};

const emptyBreakdown: FilamentBreakdown = {
  PLA: { White: 0, Black: 0, Gray: 0 },
  TPU: { White: 0, Black: 0, Gray: 0 },
};

const Ctx = createContext<WalletState>({
  hours: 0,
  filament: emptyBreakdown,
  loading: true,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<WalletState>({
    hours: 0,
    filament: emptyBreakdown,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ hours: 0, filament: emptyBreakdown, loading: false });
      return;
    }
    const stop = onWalletSnapshot(user.uid, (w) => {
      setState({
        hours: w?.hours ?? 0,
        filament: w?.filament ?? emptyBreakdown,
        loading: false,
      });
    });
    return () => stop();
  }, [user]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useWallet() {
  return useContext(Ctx);
}
