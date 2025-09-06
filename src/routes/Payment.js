// src/routes/Payment.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation, Link } from "react-router-dom";
import { formatIDR } from "../lib/wallet";
export default function Payment() {
    const loc = useLocation();
    const total = loc.state?.total;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Payment" }), _jsxs("div", { className: "rounded-2xl border border-slate-700/60 bg-slate-900/70 shadow-xl overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-slate-700/60", children: _jsx("h3", { className: "text-lg font-semibold text-white", children: "Bank Transfer" }) }), _jsxs("div", { className: "p-6 text-slate-200 space-y-4", children: [_jsx("p", { children: "Please continue your payment using the bank information below. After your payment is verified and approved by the admin, your top-up will be applied automatically." }), _jsxs("div", { className: "rounded-lg border border-slate-700/60 bg-slate-800/40 p-4", children: [_jsxs("div", { children: ["BCA : ", _jsx("b", { children: "5271041536" })] }), _jsxs("div", { children: ["A/N : ", _jsx("b", { children: "Bima Pratama Putra" })] }), typeof total === "number" && (_jsxs("div", { className: "mt-2", children: ["Total to pay: ", _jsx("b", { children: formatIDR(total) })] }))] }), _jsx("div", { className: "pt-2", children: _jsx(Link, { to: "/dashboard/history", className: "inline-block rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2", children: "View my purchase history" }) })] })] })] }));
}
