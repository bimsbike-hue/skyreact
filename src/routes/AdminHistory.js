// src/routes/AdminHistory.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onAllTopUpsHistory, formatIDR } from "../lib/wallet";
export default function AdminHistory() {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        const unsub = onAllTopUpsHistory(setRows, 500);
        return () => unsub();
    }, []);
    function renderItems(r) {
        if (!r.items || r.items.length === 0)
            return "—";
        return r.items
            .map((it) => `${it.material} ${it.grams}g (${it.color})`)
            .join(", ");
    }
    return (_jsxs("section", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "User Purchase History" }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/70", children: _jsxs("table", { className: "min-w-full text-sm text-slate-200", children: [_jsx("thead", { className: "bg-slate-800/60 text-slate-300", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Created" }), _jsx("th", { className: "px-4 py-2 text-left", children: "User" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Hours" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Filament" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Amount" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Status" })] }) }), _jsxs("tbody", { children: [rows.map((r) => (_jsxs("tr", { className: "border-t border-slate-800", children: [_jsx("td", { className: "px-4 py-3", children: new Date(r.createdAt).toLocaleString() }), _jsx("td", { className: "px-4 py-3", children: r.userEmail || r.userName || r.userId }), _jsx("td", { className: "px-4 py-3", children: r.hours || 0 }), _jsx("td", { className: "px-4 py-3", children: renderItems(r) }), _jsx("td", { className: "px-4 py-3", children: formatIDR(r.amountIDR) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `rounded px-2 py-1 text-xs ${r.status === "approved"
                                                    ? "bg-green-500/20 text-green-300"
                                                    : r.status === "pending"
                                                        ? "bg-yellow-500/20 text-yellow-300"
                                                        : "bg-rose-500/20 text-rose-300"}`, children: r.status }) })] }, r.id))), rows.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "px-4 py-6 text-slate-400", colSpan: 6, children: "No data yet." }) }))] })] }) })] }));
}
