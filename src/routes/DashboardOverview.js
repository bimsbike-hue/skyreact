import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, orderBy, query, where, getDocs, Timestamp, } from "firebase/firestore";
const EMPTY_COUNTS = {
    submitted: 0,
    quoted: 0,
    processing: 0,
    completed: 0,
};
/* ---- small UI helpers ---- */
function Card({ title, children, className = "", }) {
    return (_jsxs("div", { className: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl ${className}`, children: [title && (_jsx("div", { className: "px-5 pt-4", children: _jsx("h3", { className: "text-white font-semibold", children: title }) })), _jsx("div", { className: `${title ? "px-5 pb-5 pt-3" : "p-5"}`, children: children })] }));
}
function StatusPill({ label, count, tint = "indigo", }) {
    const ring = tint === "indigo"
        ? "ring-indigo-400/30 text-indigo-200"
        : tint === "amber"
            ? "ring-amber-400/30 text-amber-200"
            : tint === "sky"
                ? "ring-sky-400/30 text-sky-200"
                : "ring-emerald-400/30 text-emerald-200";
    const dot = tint === "indigo"
        ? "bg-indigo-400/70"
        : tint === "amber"
            ? "bg-amber-400/70"
            : tint === "sky"
                ? "bg-sky-400/70"
                : "bg-emerald-400/70";
    return (_jsxs("div", { className: `flex items-center gap-3 rounded-xl bg-slate-900/60 ring-1 ${ring} px-4 py-3`, children: [_jsx("span", { className: `h-2.5 w-2.5 rounded-full ${dot}` }), _jsx("span", { className: "text-xs uppercase tracking-wider", children: label }), _jsx("span", { className: "ml-auto rounded-md bg-white/5 px-2 py-0.5 text-sm font-semibold text-white tabular-nums", children: count })] }));
}
function fmtHoursVerbose(hours) {
    const h = Number(hours ?? 0);
    if (!Number.isFinite(h) || h <= 0)
        return "0 Hours : 0 Minutes";
    const whole = Math.floor(h);
    let minutes = Math.round((h - whole) * 60);
    if (minutes === 60) {
        return `${whole + 1} Hours : 0 Minutes`;
    }
    return `${whole} Hours : ${minutes} Minutes`;
}
/* ---- page ---- */
export default function DashboardOverview() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loadedJobs, setLoadedJobs] = useState(false);
    // Wallet (live)
    useEffect(() => {
        if (!user)
            return;
        const ref = doc(db, "users", user.uid, "wallet", "summary");
        const stop = onSnapshot(ref, (snap) => {
            if (snap.exists())
                setWallet(snap.data());
        });
        return stop;
    }, [user?.uid]);
    // Jobs (live) with safe fallback
    useEffect(() => {
        if (!user)
            return;
        const baseCol = collection(db, "printJobs");
        const qWithOrder = query(baseCol, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const qWithoutOrder = query(baseCol, where("userId", "==", user.uid));
        const stop = onSnapshot(qWithOrder, (snap) => {
            setJobs(mapJobs(snap));
            setLoadedJobs(true);
        }, async () => {
            try {
                const first = await getDocs(qWithoutOrder);
                const initial = mapJobs(first).sort(sortByCreatedAtDesc);
                setJobs(initial);
                setLoadedJobs(true);
            }
            catch {
                setJobs([]);
                setLoadedJobs(true);
            }
            onSnapshot(qWithoutOrder, (snap2) => {
                const rows = mapJobs(snap2).sort(sortByCreatedAtDesc);
                setJobs(rows);
            });
        });
        return stop;
    }, [user?.uid]);
    // Counters & recent
    const counts = useMemo(() => {
        if (!loadedJobs)
            return EMPTY_COUNTS;
        const out = { ...EMPTY_COUNTS };
        for (const j of jobs) {
            switch (j.status) {
                case "submitted":
                    out.submitted++;
                    break;
                case "quoted":
                    out.quoted++;
                    break;
                case "approved":
                case "processing":
                    out.processing++;
                    break;
                case "completed":
                    out.completed++;
                    break;
            }
        }
        return out;
    }, [jobs, loadedJobs]);
    const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);
    function renderFilament() {
        if (!wallet?.filament)
            return null;
        return (_jsx("div", { className: "grid md:grid-cols-2 gap-6", children: Object.entries(wallet.filament).map(([type, colors]) => {
                const total = Object.values(colors).reduce((a, b) => a + b, 0);
                return (_jsx(Card, { title: type, children: _jsxs("div", { className: "space-y-1 text-sm text-slate-300", children: [Object.entries(colors).map(([color, grams]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: color }), _jsxs("span", { children: [grams, " g"] })] }, color))), _jsxs("div", { className: "mt-1 border-t border-white/10 pt-2 flex justify-between font-semibold text-slate-100", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: [total, " g"] })] })] }) }, type));
            }) }));
    }
    return (_jsxs("div", { className: "relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden", children: [_jsxs(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0.8 }, animate: { opacity: 1 }, transition: { duration: 1.2 }, children: [_jsx(motion.div, { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl", animate: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }, transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl", animate: { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }, transition: { duration: 10, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl", animate: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 max-w-6xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx("div", { className: "text-sm text-slate-400", children: "Hours Balance" }), _jsx("div", { className: "mt-2 text-3xl md:text-4xl font-bold text-white", children: fmtHoursVerbose(wallet?.hours) }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Usable for print jobs (Hours : Minutes)" })] }), _jsx(Card, { title: "My Print Status", children: _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(StatusPill, { label: "submitted", count: counts.submitted, tint: "indigo" }), _jsx(StatusPill, { label: "quoted", count: counts.quoted, tint: "amber" }), _jsx(StatusPill, { label: "processing", count: counts.processing, tint: "sky" }), _jsx(StatusPill, { label: "completed", count: counts.completed, tint: "emerald" })] }) })] }), _jsxs(Card, { title: "Filament details", children: [_jsx("p", { className: "text-xs text-slate-400 mb-4", children: "Breakdown by material and color (live wallet balances)" }), renderFilament()] }), _jsx(Card, { title: "Recent Orders", children: !loadedJobs ? (_jsx("p", { className: "text-sm text-slate-400", children: "Loading\u2026" })) : recentJobs.length === 0 ? (_jsx("p", { className: "text-sm text-slate-400", children: "No orders yet." })) : (_jsx("div", { className: "space-y-2", children: recentJobs.map((job) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2 text-sm", children: [_jsxs("div", { className: "flex flex-col min-w-0", children: [_jsxs("span", { className: "text-white truncate", children: ["#", job.id?.slice(0, 5), " \u2014 ", job.model?.filename] }), _jsxs("span", { className: "text-xs text-slate-400", children: [job.settings?.filamentType, " \u00B7 ", job.settings?.color] })] }), _jsx("span", { className: "rounded-md bg-slate-700/50 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-300", children: job.status })] }, job.id))) })) })] })] }));
}
/* ---------- data helpers ---------- */
function mapJobs(snap) {
    const rows = [];
    snap.forEach((d) => rows.push({ ...d.data(), id: d.id }));
    return rows;
}
function sortByCreatedAtDesc(a, b) {
    const ta = toMillis(a?.createdAt);
    const tb = toMillis(b?.createdAt);
    return tb - ta;
}
function toMillis(v) {
    if (!v)
        return 0;
    if (v instanceof Timestamp)
        return v.toMillis();
    if (typeof v?.toDate === "function")
        return v.toDate().getTime();
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
