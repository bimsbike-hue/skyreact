// src/routes/AdminPanel.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onPendingTopUps, adminApproveTopUp, adminRejectTopUp, formatIDR, } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
function itemsToText(r) {
    if (!r.items?.length)
        return "-";
    return r.items
        .map((it) => `${it.material} ${it.grams}g (${it.color})`)
        .join(" + ");
}
export default function AdminPanel() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState(null);
    useEffect(() => {
        try {
            const unsub = onPendingTopUps(setRows, 100);
            return () => unsub();
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
    }, []);
    async function handleApprove(id) {
        if (!user)
            return;
        await adminApproveTopUp(id, user.email ?? user.uid);
    }
    async function handleReject(id) {
        if (!user)
            return;
        const note = prompt("Reject note (optional)") ?? "";
        await adminRejectTopUp(id, user.email ?? user.uid, note);
    }
    return (_jsxs("section", { className: "space-y-4 p-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Admin Panel \u2014 Pending Top-Ups" }), err && _jsxs("div", { className: "text-red-400", children: ["Error: ", err] }), rows.length === 0 ? (_jsx("div", { className: "text-slate-400", children: "No pending top-ups \uD83C\uDF89" })) : (_jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/70", children: _jsxs("table", { className: "min-w-full text-sm text-slate-200", children: [_jsx("thead", { className: "bg-slate-800/60 text-slate-300", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Created" }), _jsx("th", { className: "px-4 py-2 text-left", children: "User" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Hours" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Filament" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Amount" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Note" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: rows.map((r) => (_jsxs("tr", { className: "border-t border-slate-800", children: [_jsx("td", { className: "px-4 py-3", children: r.createdAt.toLocaleString() }), _jsx("td", { className: "px-4 py-3", children: r.userEmail || r.userName || r.userId }), _jsx("td", { className: "px-4 py-3", children: r.hours || 0 }), _jsx("td", { className: "px-4 py-3", children: itemsToText(r) }), _jsx("td", { className: "px-4 py-3", children: formatIDR(r.amountIDR) }), _jsx("td", { className: "px-4 py-3", children: r.note || "-" }), _jsxs("td", { className: "px-4 py-3 space-x-2", children: [_jsx("button", { onClick: () => handleApprove(r.id), className: "px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white", children: "Approve" }), _jsx("button", { onClick: () => handleReject(r.id), className: "px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white", children: "Reject" })] })] }, r.id))) })] }) }))] }));
}
