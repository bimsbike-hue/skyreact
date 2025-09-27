// src/components/DashboardWallet.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
export default function DashboardWallet() {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const [wallet, setWallet] = useState({
        hoursBalance: 0,
        plaGrams: 0,
        tpuGrams: 0,
    });
    useEffect(() => {
        if (!uid) {
            setWallet({ hoursBalance: 0, plaGrams: 0, tpuGrams: 0 });
            return;
        }
        const unsub = onWalletSnapshot(uid, (w) => {
            setWallet({
                hoursBalance: Number(w?.hoursBalance ?? 0),
                // your schema currently exposes filamentGrams; fall back to plaGrams if present
                plaGrams: Number(w?.filamentGrams ?? w?.plaGrams ?? 0),
                tpuGrams: Number(w?.tpuGrams ?? 0),
            });
        });
        return () => unsub();
    }, [uid]);
    if (!uid)
        return null;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl shadow bg-white", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Hours Balance" }), _jsx("p", { className: "text-2xl", children: wallet.hoursBalance }), _jsx("p", { className: "text-sm text-slate-500", children: "Usable for print jobs" })] }), _jsxs("div", { className: "p-4 rounded-2xl shadow bg-white", children: [_jsx("h3", { className: "text-lg font-semibold", children: "PLA Balance" }), _jsx("p", { className: "text-2xl", children: wallet.plaGrams }), _jsx("p", { className: "text-sm text-slate-500", children: "Filament stock" })] }), _jsxs("div", { className: "p-4 rounded-2xl shadow bg-white", children: [_jsx("h3", { className: "text-lg font-semibold", children: "TPU Balance" }), _jsx("p", { className: "text-2xl", children: wallet.tpuGrams }), _jsx("p", { className: "text-sm text-slate-500", children: "Filament stock" })] })] }));
}
