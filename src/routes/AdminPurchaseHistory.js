// src/routes/AdminPurchaseHistory.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { onAllTopUpsHistory, formatIDR, } from "../lib/wallet";
const PAGE_SIZE = 12; // items per page
function StatusBadge({ s }) {
    const cls = s === "approved"
        ? "bg-emerald-600/30 text-emerald-300"
        : s === "rejected"
            ? "bg-rose-600/30 text-rose-300"
            : "bg-amber-600/30 text-amber-300";
    return (_jsx("span", { className: `px-2 py-0.5 rounded text-xs font-medium uppercase ${cls}`, children: s }));
}
function FilamentCell({ row }) {
    // New schema: items[]
    const items = row.items;
    // Legacy single filament
    const single = row.filament;
    if (items && items.length > 0) {
        return (_jsx("div", { className: "space-y-0.5", children: items.map((it, i) => (_jsxs("div", { className: "whitespace-nowrap", children: [it.material, " ", it.grams, "g (", it.color, ")"] }, i))) }));
    }
    if (single && single.grams) {
        return (_jsxs("div", { className: "whitespace-nowrap", children: [single.material, " ", single.grams, "g (", single.color, ")"] }));
    }
    return _jsx("span", { className: "text-slate-400", children: "-" });
}
export default function AdminPurchaseHistory() {
    const [allRows, setAllRows] = useState([]);
    const [err, setErr] = useState(null);
    // filters + paging
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    // subscribe once; stream up to 400 records (adjust if you like)
    useEffect(() => {
        try {
            const stop = onAllTopUpsHistory(setAllRows, 400);
            return () => stop();
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
    }, []);
    // derived: filtered list
    const filtered = useMemo(() => {
        const base = [...allRows].sort((a, b) => {
            const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt?.toMillis?.() ?? 0;
            const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
        });
        if (statusFilter === "all")
            return base;
        return base.filter((r) => r.status === statusFilter);
    }, [allRows, statusFilter]);
    // total pages + current page slice
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    useEffect(() => {
        // whenever filter changes or totalPages changes, ensure page is valid
        setPage((p) => Math.min(Math.max(p, 1), totalPages));
    }, [totalPages, statusFilter]);
    const pageRows = useMemo(() => {
        const start = (clampedPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, clampedPage]);
    return (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-end justify-between gap-3 flex-wrap", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Admin \u2013 All Purchases" }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Showing ", pageRows.length, " of ", filtered.length, " (page ", clampedPage, " of ", totalPages, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm text-slate-300", children: "Status" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "rounded-lg border border-white/10 bg-slate-900/70 px-3 py-1.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] })] }), err && (_jsxs("div", { className: "rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200", children: ["Error: ", err] })), _jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl", children: _jsxs("table", { className: "min-w-full text-sm text-slate-200", children: [_jsx("thead", { className: "bg-slate-800/60 text-slate-300", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left whitespace-nowrap", children: "Created" }), _jsx("th", { className: "px-4 py-3 text-left", children: "User" }), _jsx("th", { className: "px-4 py-3 text-left whitespace-nowrap", children: "Hours" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-slate-200 w-[40%]", children: "Filament" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Amount" }), _jsx("th", { className: "px-4 py-3 text-left", children: "Status" })] }) }), _jsx("tbody", { children: pageRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-4 py-8 text-slate-400 text-center", children: "No purchases found." }) })) : (pageRows.map((r) => (_jsxs("tr", { className: "border-t border-slate-800 align-top", children: [_jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: r.createdAt
                                            ? r.createdAt?.toLocaleString?.() ??
                                                r.createdAt?.toDate?.()?.toLocaleString?.() ??
                                                "-"
                                            : "-" }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "truncate max-w-[22rem]", children: r.userEmail || r.userName || r.userId }), r.userEmail && r.userId && (_jsx("span", { className: "text-xs text-slate-400", children: r.userId }))] }) }), _jsx("td", { className: "px-4 py-3 tabular-nums", children: r.hours ?? 0 }), _jsx("td", { className: "px-4 py-3", children: _jsx(FilamentCell, { row: r }) }), _jsx("td", { className: "px-4 py-3 tabular-nums", children: formatIDR(r.amountIDR || 0) }), _jsx("td", { className: "px-4 py-3", children: _jsx(StatusBadge, { s: r.status }) })] }, r.id)))) })] }) }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { className: "rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10", disabled: clampedPage <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), children: "Prev" }), _jsxs("span", { className: "px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-slate-200", children: ["Page ", _jsx("span", { className: "tabular-nums", children: clampedPage }), " /", " ", _jsx("span", { className: "tabular-nums", children: totalPages })] }), _jsx("button", { className: "rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10", disabled: clampedPage >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), children: "Next" })] })] }));
}
