// src/components/AdminTopUpQueue.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { onPendingTopUps, adminApproveTopUp, adminRejectTopUp, } from "../lib/wallet";
export default function AdminTopUpQueue({ adminIdOrEmail, }) {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        const unsub = onPendingTopUps(setRows, 50);
        return () => unsub();
    }, []);
    async function approve(id) {
        if (!confirm("Approve this top-up and credit the wallet?"))
            return;
        await adminApproveTopUp(id, adminIdOrEmail);
    }
    async function reject(id) {
        const note = prompt("Reason (optional)") || "";
        await adminRejectTopUp(id, adminIdOrEmail, note);
    }
    return (_jsxs("div", { className: "p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white", children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Pending Top-Ups" }), rows.length === 0 ? (_jsx("div", { className: "text-gray-300", children: "No pending requests." })) : (_jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-400", children: [_jsx("th", { className: "py-2 pr-4", children: "ID" }), _jsx("th", { className: "py-2 pr-4", children: "User" }), _jsx("th", { className: "py-2 pr-4", children: "Hours" }), _jsx("th", { className: "py-2 pr-4", children: "Grams" }), _jsx("th", { className: "py-2 pr-4", children: "Total (IDR)" }), _jsx("th", { className: "py-2 pr-4", children: "Actions" })] }) }), _jsx("tbody", { className: "text-gray-100", children: rows.map((r) => {
                            const grams = r.grams ??
                                r.filament?.grams ??
                                0;
                            return (_jsxs("tr", { className: "border-t border-gray-700/60", children: [_jsxs("td", { className: "py-2 pr-4", children: [r.id.slice(0, 8), "\u2026"] }), _jsx("td", { className: "py-2 pr-4", children: r.userId }), _jsx("td", { className: "py-2 pr-4", children: r.hours ?? 0 }), _jsx("td", { className: "py-2 pr-4", children: grams }), _jsxs("td", { className: "py-2 pr-4", children: ["Rp ", r.amountIDR.toLocaleString("id-ID")] }), _jsxs("td", { className: "py-2 pr-4 flex gap-2", children: [_jsx("button", { className: "px-3 py-1 rounded bg-emerald-600", onClick: () => approve(r.id), children: "Approve" }), _jsx("button", { className: "px-3 py-1 rounded bg-rose-600", onClick: () => reject(r.id), children: "Reject" })] })] }, r.id));
                        }) })] }))] }));
}
