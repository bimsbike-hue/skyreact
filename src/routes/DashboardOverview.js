// src/routes/DashboardOverview.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { onWalletSnapshot, onFilamentBreakdown, listRecentOrders, } from "../lib/wallet";
/** Try a bunch of historical keys and cast to number safely */
function extractHours(w) {
    if (!w)
        return 0;
    // common historic variants we’ve seen in this project
    const candidates = [
        w.hours,
        w.hour,
        w.hoursBalance,
        w.balanceHours,
        w.hours_balance,
        w.totalHours,
    ];
    for (const v of candidates) {
        if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
            return Number(v);
        }
    }
    // last-ditch: if the document is like { balances: { hours: n } }
    const nested = (w.balances && (w.balances.hours ?? w.balances.hour)) ??
        (w.wallet && (w.wallet.hours ?? w.wallet.hour));
    if (nested !== undefined && nested !== null && !Number.isNaN(Number(nested))) {
        return Number(nested);
    }
    return 0;
}
function HoursCard({ hours }) {
    return (_jsxs("div", { className: "rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl", children: [_jsx("div", { className: "text-sm text-slate-400", children: "Hours Balance" }), _jsx("div", { className: "mt-2 text-3xl font-semibold text-white", children: hours }), _jsx("div", { className: "text-slate-400 text-sm mt-1", children: "Usable for print jobs" })] }));
}
function MaterialBlock({ title, colors, }) {
    const total = (colors.White ?? 0) + (colors.Black ?? 0) + (colors.Gray ?? 0);
    return (_jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-700/40 p-4", children: [_jsx("div", { className: "text-sm font-semibold text-slate-300 mb-2", children: title }), total === 0 ? (_jsx("div", { className: "text-slate-400 text-sm", children: "No filament yet." })) : (_jsxs("div", { className: "space-y-1 text-slate-200", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "White" }), _jsxs("span", { className: "tabular-nums", children: [colors.White ?? 0, " g"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Black" }), _jsxs("span", { className: "tabular-nums", children: [colors.Black ?? 0, " g"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Gray" }), _jsxs("span", { className: "tabular-nums", children: [colors.Gray ?? 0, " g"] })] })] }))] }));
}
export default function DashboardOverview() {
    const { user } = useAuth();
    const [hours, setHours] = useState(0);
    const [breakdown, setBreakdown] = useState({
        PLA: { White: 0, Black: 0, Gray: 0 },
        TPU: { White: 0, Black: 0, Gray: 0 },
    });
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    // Hours total from wallet doc (tolerant to field name differences)
    useEffect(() => {
        if (!user)
            return;
        const unsub = onWalletSnapshot(user.uid, (walletDoc) => {
            setHours(extractHours(walletDoc));
        });
        return () => unsub?.();
    }, [user]);
    // Per-color filament breakdown from approved topups
    useEffect(() => {
        if (!user)
            return;
        const unsub = onFilamentBreakdown(user.uid, setBreakdown);
        return () => unsub?.();
    }, [user]);
    // Recent orders list
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!user)
                return;
            setLoadingOrders(true);
            const rows = await listRecentOrders(user.uid, 5);
            if (!cancelled)
                setOrders(rows);
            setLoadingOrders(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(HoursCard, { hours: hours }), _jsx("div", { className: "hidden md:block" }), _jsx("div", { className: "hidden md:block" })] }), _jsxs("section", { className: "rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-700/60", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Filament details" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Breakdown by material and color (approved top-ups)" })] }), _jsxs("div", { className: "p-6 grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(MaterialBlock, { title: "PLA", colors: breakdown.PLA }), _jsx(MaterialBlock, { title: "TPU", colors: breakdown.TPU })] })] }), _jsxs("section", { className: "rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-slate-700/60", children: _jsx("h3", { className: "text-lg font-semibold text-white", children: "Recent Orders" }) }), _jsx("div", { className: "p-6 text-slate-200", children: loadingOrders ? "Loading…" : orders.length ? "…your table…" : "No orders yet." })] })] }));
}
