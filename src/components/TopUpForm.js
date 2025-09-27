"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { createTopUpRequest } from "../lib/wallet";
import { PRICE_IDR, calcTopupTotalIDR } from "../lib/pricing";
export default function TopUpForm() {
    const { user } = useAuth();
    const [hours, setHours] = useState(0);
    const [grams, setGrams] = useState(0);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const total = useMemo(() => calcTopupTotalIDR(hours, grams), [hours, grams]);
    async function submit() {
        if (!user) {
            alert("Please sign in");
            return;
        }
        if (hours <= 0 && grams <= 0) {
            alert("Choose at least one quantity");
            return;
        }
        setBusy(true);
        try {
            const id = await createTopUpRequest(user.uid, { hours, amountIDR: total, note, grams });
            alert(`Top-up submitted.\nID: ${id}\nPlease pay manually and include this ID; admin will approve.`);
            setHours(0);
            setGrams(0);
            setNote("");
        }
        catch (e) {
            alert(e.message || "Failed to submit top-up");
        }
        finally {
            setBusy(false);
        }
    }
    return (_jsxs("div", { className: "space-y-4 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Top-Up Wallet" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Field, { label: `Hours (Rp ${PRICE_IDR.hour.toLocaleString("id-ID")}/hr)`, children: _jsx("input", { type: "number", min: 0, step: "0.5", value: hours, onChange: (e) => setHours(Number(e.target.value)), className: "w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" }) }), _jsx(Field, { label: `Filament (Rp ${PRICE_IDR.filamentPerGram.toLocaleString("id-ID")}/g)`, children: _jsx("input", { type: "number", min: 0, step: "10", value: grams, onChange: (e) => setGrams(Number(e.target.value)), className: "w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" }) }), _jsx(Field, { label: "Note (optional)", children: _jsx("input", { value: note, onChange: (e) => setNote(e.target.value), className: "w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" }) })] }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "text-sm text-gray-300", children: ["Total:\u00A0", _jsxs("span", { className: "text-xl font-bold", children: ["Rp ", total.toLocaleString("id-ID")] })] }), _jsx("button", { onClick: submit, disabled: busy || !user, className: "px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50", children: busy ? "Submitting…" : "Checkout (Manual Payment)" })] })] }));
}
function Field({ label, children }) {
    return (_jsxs("label", { className: "block space-y-1", children: [_jsx("div", { className: "text-sm text-gray-300", children: label }), children] }));
}
