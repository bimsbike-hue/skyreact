import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/AdminQuoteForm.tsx
import { useState } from "react";
import { adminSetQuote } from "@/lib/printJobs";
export default function AdminQuoteForm({ jobId, adminUid, onSaved }) {
    // Split hours into Hours + Minutes
    const [hoursH, setHoursH] = useState("");
    const [hoursM, setHoursM] = useState("");
    const [grams, setGrams] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(false);
    function toNum(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    }
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setOk(false);
        const H = toNum(hoursH || "0");
        const M = toNum(hoursM || "0");
        const G = toNum(grams);
        // Validation
        if (isNaN(H) || H < 0) {
            setErr("Hours must be a non-negative number.");
            return;
        }
        if (isNaN(M) || M < 0 || M >= 60) {
            setErr("Minutes must be a number between 0 and 59.");
            return;
        }
        if (isNaN(G) || G <= 0) {
            setErr("Estimated filament (grams) must be a number greater than 0.");
            return;
        }
        const decimalHours = H + M / 60;
        setSaving(true);
        try {
            const quote = { hours: decimalHours, grams: G };
            const trimmed = notes.trim();
            if (trimmed)
                quote.notes = trimmed;
            await adminSetQuote(jobId, adminUid, {
                by: adminUid,
                estimate: { hours: decimalHours, grams: G },
                artifacts: {},
            }, quote);
            setOk(true);
            onSaved?.();
            // optional reset
            // setHoursH(""); setHoursM(""); setGrams(""); setNotes("");
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    const label = "text-sm font-medium text-slate-200";
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    // Small inline preview of the decimal value
    const preview = hoursH.trim() !== "" || hoursM.trim() !== ""
        ? (() => {
            const H = toNum(hoursH || "0");
            const M = toNum(hoursM || "0");
            if (!isNaN(H) && !isNaN(M) && M >= 0 && M < 60 && H >= 0) {
                const dh = (H + M / 60).toFixed(2);
                return `≈ ${dh} hours`;
            }
            return "";
        })()
        : "";
    return (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: label, children: "Estimated Hours" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-1", children: [_jsx("input", { className: input, inputMode: "numeric", placeholder: "Hours e.g. 4", value: hoursH, onChange: (e) => setHoursH(e.target.value) }), _jsx("input", { className: input, inputMode: "numeric", placeholder: "Minutes (0\u201359)", value: hoursM, onChange: (e) => setHoursM(e.target.value) })] }), preview && (_jsx("div", { className: "mt-1 text-xs text-slate-400", children: preview }))] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Estimated Filament (grams)" }), _jsx("input", { className: input, inputMode: "numeric", placeholder: "e.g. 120", value: grams, onChange: (e) => setGrams(e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Notes (optional)" }), _jsx("textarea", { rows: 4, className: input, placeholder: "Any remarks for the user (supports, surface quality, etc.)", value: notes, onChange: (e) => setNotes(e.target.value) })] }), err && (_jsx("div", { className: "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200", children: err })), ok && (_jsx("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200", children: "Quote saved." })), _jsx("div", { className: "flex gap-2", children: _jsx("button", { type: "submit", disabled: saving, className: "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50", children: saving ? "Saving…" : "Save Quote" }) })] }));
}
