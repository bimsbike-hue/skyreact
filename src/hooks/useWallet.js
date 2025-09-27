"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust if your firebase init lives elsewhere
export function useWallet(uid) {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!uid)
            return;
        const ref = doc(db, "users", uid, "wallet", "default");
        const unsub = onSnapshot(ref, (snap) => {
            setLoading(false);
            if (!snap.exists()) {
                setWallet(null);
                return;
            }
            const data = snap.data();
            // Fallback mapping:
            // If pla/tpu are missing, show filamentGrams for PLA and 0 for TPU (or split however you like).
            const pla = data.plaGrams ?? data.filamentGrams ?? 0;
            const tpu = data.tpuGrams ?? 0;
            setWallet({
                ...data,
                plaGrams: pla,
                tpuGrams: tpu,
                hoursBalance: Number(data.hoursBalance ?? 0),
            });
        }, (e) => {
            setLoading(false);
            setError(e);
            console.error("wallet listener error:", e);
        });
        return () => unsub();
    }, [uid]);
    return { wallet, loading, error };
}
