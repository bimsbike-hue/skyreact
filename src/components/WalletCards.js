// src/components/WalletCards.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
export default function WalletCards() {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const [wallet, setWallet] = useState(null);
    const [error] = useState(null); // no error callback in onWalletSnapshot
    useEffect(() => {
        if (!uid) {
            setWallet(null);
            return;
        }
        const unsub = onWalletSnapshot(uid, (w) => {
            setWallet(w || null);
        });
        return () => unsub();
    }, [uid]);
    if (!uid)
        return null;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "Hours Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: wallet ? wallet.hoursBalance ?? 0 : "…" }), _jsx("p", { className: "text-sm text-white/50", children: "Usable for print jobs" })] }), _jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "PLA Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: wallet ? wallet.filamentGrams ?? 0 : "…" }), _jsx("p", { className: "text-sm text-white/50", children: "Filament stock" })] }), _jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "TPU Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: "0" }), _jsx("p", { className: "text-sm text-white/50", children: "Filament stock" })] }), error && (_jsx("div", { className: "col-span-full rounded-lg bg-red-500/10 text-red-300 px-4 py-2", children: error }))] }));
}
