// src/routes/PurchaseHistory.tsx
"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { onUserTopUps, formatIDR, } from "../lib/wallet";
function FilamentCell({ row }) {
    // New schema: items[]
    const items = row.items;
    // Old/legacy single filament fields
    const single = row.filament;
    if (items && items.length > 0) {
        return (_jsx("div", { className: "space-y-1", children: items.map((it, idx) => (_jsxs("div", { children: [it.material, " ", it.grams, "g (", it.color, ")"] }, idx))) }));
    }
    if (single && single.grams) {
        return (_jsxs("div", { children: [single.material, " ", single.grams, "g (", single.color, ")"] }));
    }
    return _jsx("span", { className: "text-slate-400", children: "-" });
}
function StatusBadge({ s }) {
    const cls = s === "approved"
        ? "bg-emerald-600/30 text-emerald-300"
        : s === "rejected"
            ? "bg-rose-600/30 text-rose-300"
            : "bg-amber-600/30 text-amber-300";
    return (_jsx("span", { className: `px-2 py-0.5 rounded text-xs font-medium ${cls}`, children: s }));
}
export default function PurchaseHistory() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        try {
            const stop = onUserTopUps(user.uid, setRows, 200);
            return () => stop();
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
    }, [user]);
    return (_jsxs("section", { className: "space-y-4", children: [_jsx("h1", { className: "text-xl font-semibold text-white", children: "Purchase History" }), err && _jsxs("div", { className: "text-rose-400", children: ["Error: ", err] }), _jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl", children: _jsxs("table", { className: "min-w-full text-sm text-slate-200", children: [_jsx("thead", { className: "bg-slate-800/60 text-slate-300", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: "Created" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Hours" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Filament" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Amount" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Status" })] }) }), _jsx("tbody", { children: rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-4 py-6 text-slate-400", children: "No purchases yet." }) })) : (rows.map((r) => (_jsxs("tr", { className: "border-t border-slate-800", children: [_jsx("td", { className: "px-4 py-3", children: r.createdAt ? r.createdAt.toLocaleString() : "-" }), _jsx("td", { className: "px-4 py-3", children: r.hours || 0 }), _jsx("td", { className: "px-4 py-3", children: _jsx(FilamentCell, { row: r }) }), _jsx("td", { className: "px-4 py-3", children: formatIDR(r.amountIDR || 0) }), _jsx("td", { className: "px-4 py-3", children: _jsx(StatusBadge, { s: r.status }) })] }, r.id)))) })] }) })] }));
}
