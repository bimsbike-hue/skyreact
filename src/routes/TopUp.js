// src/routes/TopUp.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { createTopUpRequest, formatIDR } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
const HOUR_PACKS = [
    { label: "1 Hour", hours: 1, price: 25000 },
    { label: "5 Hours", hours: 5, price: 120000 },
    { label: "10 Hours", hours: 10, price: 200000 },
];
const MATERIALS = [
    { material: "PLA", pricePerKg: 170000 },
    { material: "TPU", pricePerKg: 240000 },
];
const GRAMS = [100, 500, 1000];
const COLORS = ["White", "Black", "Gray"];
export default function TopUpPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Hours selection — -1 means "none selected"
    const [hourIdx, setHourIdx] = useState(-1);
    // Filament lines
    const [lines, setLines] = useState([]);
    const [note, setNote] = useState("");
    const hourPrice = hourIdx >= 0 ? HOUR_PACKS[hourIdx].price : 0;
    const hours = hourIdx >= 0 ? HOUR_PACKS[hourIdx].hours : 0;
    const lineCost = (ln) => {
        const perKg = MATERIALS.find((m) => m.material === ln.material)?.pricePerKg ?? 0;
        const base = (perKg / 1000) * ln.grams;
        return Math.round(base * 1.2); // 20% margin
    };
    const itemsPrice = useMemo(() => lines.reduce((sum, ln) => sum + lineCost(ln), 0), [lines]);
    const total = hourPrice + itemsPrice;
    function addLine() {
        setLines((prev) => [...prev, { material: "PLA", grams: 100, color: "White" }]);
    }
    function removeLine(i) {
        setLines((prev) => prev.filter((_, idx) => idx !== i));
    }
    function updateLine(i, patch) {
        setLines((prev) => prev.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));
    }
    async function submit() {
        if (!user)
            return;
        if (hours === 0 && lines.length === 0) {
            alert("Please select hours or add at least one filament.");
            return;
        }
        await createTopUpRequest(user.uid, {
            userEmail: user.email,
            userName: user.displayName ?? undefined,
            hours,
            items: lines,
            amountIDR: total,
            note,
        });
        navigate("/dashboard/payment");
    }
    const card = "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";
    const label = "text-sm text-slate-300";
    const select = "rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const btnSecondary = "px-3 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-white text-sm transition";
    const btnPrimary = "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition";
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("header", { className: "space-y-1", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Top-Up Wallet" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Buy print hours or add filament balance to your wallet." })] }), _jsxs("div", { className: card, children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("div", { className: label, children: "Hour Balance" }), _jsx("button", { onClick: () => setHourIdx(-1), className: "text-xs text-slate-400 hover:text-white underline", children: "Clear hours" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: HOUR_PACKS.map((p, i) => (_jsxs("button", { onClick: () => setHourIdx(i), className: `rounded-xl px-4 py-3 text-left ring-1 transition ${hourIdx === i
                                ? "ring-indigo-400/40 bg-indigo-600/20 text-indigo-100"
                                : "ring-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/60"}`, children: [_jsx("div", { className: "font-semibold", children: p.label }), _jsx("div", { className: "text-sm", children: formatIDR(p.price) })] }, p.label))) })] }), _jsxs("div", { className: `${card} space-y-4`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-semibold", children: "Add Filament" }), _jsx("button", { onClick: addLine, className: btnSecondary, children: "+ Add Filament" })] }), lines.length === 0 ? (_jsx("p", { className: "text-slate-400 text-sm", children: "No filaments added." })) : (_jsx("div", { className: "space-y-3", children: lines.map((ln, i) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-3 items-center", children: [_jsx("select", { className: select, value: ln.material, onChange: (e) => updateLine(i, { material: e.target.value }), children: MATERIALS.map((m) => (_jsx("option", { value: m.material, children: m.material }, m.material))) }), _jsx("select", { className: select, value: ln.grams, onChange: (e) => updateLine(i, { grams: Number(e.target.value) }), children: GRAMS.map((g) => (_jsxs("option", { value: g, children: [g, " g"] }, g))) }), _jsx("select", { className: select, value: ln.color, onChange: (e) => updateLine(i, { color: e.target.value }), children: COLORS.map((c) => (_jsx("option", { value: c, children: c }, c))) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-sm text-slate-300 min-w-[100px]", children: formatIDR(lineCost(ln)) }), _jsx("button", { onClick: () => removeLine(i), className: "px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white", children: "Remove" })] })] }, i))) }))] }), _jsxs("div", { className: `${card} space-y-4`, children: [_jsxs("div", { className: "grid gap-2 text-sm text-slate-200", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Hours" }), _jsxs("span", { className: "tabular-nums", children: [hours, " ", hours === 1 ? "Hour" : "Hours", " ", hours ? `— ${formatIDR(hourPrice)}` : ""] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Filament" }), _jsx("span", { className: "tabular-nums", children: formatIDR(itemsPrice) })] })] }), _jsx("input", { placeholder: "Note (optional)", className: "w-full rounded-lg bg-slate-900/60 text-white px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500", value: note, onChange: (e) => setNote(e.target.value) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-slate-300", children: "Total" }), _jsx("div", { className: "text-xl font-bold text-white", children: formatIDR(total) })] }), _jsx("button", { onClick: submit, disabled: total <= 0, className: `${btnPrimary} disabled:opacity-50`, children: "Submit Top-Up" }), _jsx("p", { className: "text-xs text-slate-400", children: "After submitting, you\u2019ll see payment instructions. Your wallet will be credited once the admin verifies your transfer." })] })] }));
}
