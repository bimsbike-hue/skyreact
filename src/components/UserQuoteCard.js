import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/UserQuoteCard.tsx
import { useState } from "react";
import { approveJobAndCharge, userSetDecision } from "@/lib/printJobs";
export default function UserQuoteCard({ jobId, uid, quote }) {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    async function onApprove() {
        setLoading("approve");
        setError(null);
        try {
            await userSetDecision(jobId, uid, "approved");
            await approveJobAndCharge(jobId, uid);
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(null);
        }
    }
    async function onChanges() {
        setLoading("changes");
        setError(null);
        try {
            await userSetDecision(jobId, uid, "changes_requested");
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(null);
        }
    }
    async function onCancel() {
        setLoading("cancel");
        setError(null);
        try {
            await userSetDecision(jobId, uid, "cancelled");
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(null);
        }
    }
    return (_jsxs("div", { className: "rounded-2xl border p-4 space-y-2 bg-white", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Your Quote" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsx("div", { children: "Hours" }), _jsx("div", { className: "font-medium", children: quote.hours }), _jsx("div", { children: "Filament" }), _jsxs("div", { className: "font-medium", children: [quote.grams, " g"] }), _jsx("div", { children: "Price" }), _jsxs("div", { className: "font-medium", children: ["IDR ", quote.amountIDR.toLocaleString()] }), quote.queuePosition != null && (_jsxs(_Fragment, { children: [_jsx("div", { children: "Queue" }), _jsxs("div", { className: "font-medium", children: ["#", quote.queuePosition] })] })), quote.notes && (_jsx(_Fragment, { children: _jsx("div", { className: "col-span-2 text-gray-600", children: quote.notes }) }))] }), error && _jsx("p", { className: "text-red-600 text-sm", children: error }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { onClick: onApprove, disabled: loading !== null, className: "px-4 py-2 rounded-xl bg-black text-white", children: loading === "approve" ? "Approving..." : "Approve & Charge Wallet" }), _jsx("button", { onClick: onChanges, disabled: loading !== null, className: "px-4 py-2 rounded-xl border", children: loading === "changes" ? "Sending..." : "Request changes" }), _jsx("button", { onClick: onCancel, disabled: loading !== null, className: "px-4 py-2 rounded-xl border", children: loading === "cancel" ? "Cancelling..." : "Cancel" })] })] }));
}
