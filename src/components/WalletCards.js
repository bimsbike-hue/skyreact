// src/components/WalletCards.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onWalletSnapshot } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
export default function WalletCards() {
    const { user } = useAuth();
    // only depend on a *stable primitive* (uid), not the whole user object
    const uid = user?.uid ?? null;
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        // when logging out, clear local state and don't subscribe
        if (!uid) {
            setWallet(null);
            setError(null);
            return;
        }
        // one subscription per uid, with proper cleanup
        const unsub = onWalletSnapshot(uid, (w) => {
            setError(null);
            setWallet(w);
        }, (e) => {
            console.error("wallet listener error:", e);
            setError("Failed to load wallet");
        });
        return () => unsub();
    }, [uid]); // <— stable dependency
    if (!uid)
        return null; // shouldn't render on public pages
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "Hours Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: wallet ? wallet.hoursBalance : "…" }), _jsx("p", { className: "text-sm text-white/50", children: "Usable for print jobs" })] }), _jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "PLA Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: wallet ? wallet.filamentGrams : "…" }), _jsx("p", { className: "text-sm text-white/50", children: "Filament stock" })] }), _jsxs("div", { className: "p-4 rounded-xl shadow bg-white/5 border border-white/10", children: [_jsx("h3", { className: "font-semibold text-white/90", children: "TPU Balance" }), _jsx("p", { className: "mt-1 text-3xl text-white", children: "0" }), _jsx("p", { className: "text-sm text-white/50", children: "Filament stock" })] }), error && (_jsx("div", { className: "col-span-full rounded-lg bg-red-500/10 text-red-300 px-4 py-2", children: error }))] }));
}
