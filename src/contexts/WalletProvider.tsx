// src/contexts/WalletProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { onWalletSnapshot } from "../lib/wallet";

type WalletSnapshot = {
  hoursBalance?: number;
  filamentGrams?: number;
  [key: string]: any;
};

type WalletContextType = {
  balance: number; // hours
  filament: { PLA: number; TPU: number }; // grams
  loading: boolean;
  refresh: () => Promise<void>; // kept for API compatibility
};

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  filament: { PLA: 0, TPU: 0 },
  loading: true,
  refresh: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [filamentPLA, setFilamentPLA] = useState(0);
  const [filamentTPU, setFilamentTPU] = useState(0);

  useEffect(() => {
    let unsubWallet: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // cleanup previous wallet listener when user changes
      if (unsubWallet) {
        unsubWallet();
        unsubWallet = undefined;
      }

      if (user) {
        setLoading(true);
        unsubWallet = onWalletSnapshot(user.uid, (w: WalletSnapshot | null) => {
          const hours = Number(w?.hoursBalance ?? 0);
          const grams = Number((w as any)?.filamentGrams ?? 0);
          setBalance(hours);
          setFilamentPLA(grams);
          setFilamentTPU(0); // until you add tpuGrams in schema
          setLoading(false);
        });
      } else {
        setBalance(0);
        setFilamentPLA(0);
        setFilamentTPU(0);
        setLoading(false);
      }
    });

    return () => {
      if (unsubWallet) unsubWallet();
      unsubAuth();
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance,
        filament: { PLA: filamentPLA, TPU: filamentTPU },
        loading,
        refresh: async () => {}, // not needed with onSnapshot
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
