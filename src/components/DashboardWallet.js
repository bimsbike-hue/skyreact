// src/components/DashboardWallet.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";
export default function DashboardWallet() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        const ref = doc(db, "users", user.uid, "wallet", "summary");
        const stop = onSnapshot(ref, (snap) => {
            setWallet(snap.data() ?? null);
        });
        return () => stop();
    }, [user]);
    if (!user)
        return _jsx("p", { children: "Please sign in to see your wallet." });
    if (!wallet)
        return _jsx("p", { children: "Loading wallet..." });
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "text-sm text-slate-300", children: "Hours Balance" }), _jsx("p", { className: "text-2xl text-white", children: wallet.hoursBalance ?? wallet.hours ?? 0 })] }), _jsxs("div", { className: "p-4 rounded-2xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "text-sm text-slate-300", children: "PLA Balance (g)" }), _jsx("p", { className: "text-2xl text-white", children: wallet.plaGrams ?? 0 })] }), _jsxs("div", { className: "p-4 rounded-2xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "text-sm text-slate-300", children: "TPU Balance (g)" }), _jsx("p", { className: "text-2xl text-white", children: wallet.tpuGrams ?? 0 })] })] }));
}
