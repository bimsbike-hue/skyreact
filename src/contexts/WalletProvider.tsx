import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  onWalletSnapshot,
  type WalletSnapshot,
} from "../lib/wallet";

type WalletContextType = {
  balance: number;                // hours
  filament: { PLA: number; TPU: number }; // grams
  loading: boolean;
  refresh: () => Promise<void>;   // no-op (kept for API compatibility)
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
    let unsubAuth = onAuthStateChanged(auth, (user) => {
      // clean previous listener when user changes
      let unsubWallet: (() => void) | undefined;

      if (user) {
        setLoading(true);
        unsubWallet = onWalletSnapshot(
          user.uid,
          (w: WalletSnapshot) => {
            setBalance(Number(w.hoursBalance ?? 0));
            // Your schema has only filamentGrams; show it in PLA for now.
            const grams = Number((w as any).filamentGrams ?? 0);
            setFilamentPLA(grams);
            setFilamentTPU(0); // until you add tpuGrams in schema
            setLoading(false);
          },
          (e) => {
            console.error("wallet snapshot error:", e);
            setLoading(false);
          }
        );
      } else {
        setBalance(0);
        setFilamentPLA(0);
        setFilamentTPU(0);
        setLoading(false);
      }

      return () => unsubWallet?.();
    });

    return () => unsubAuth();
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
