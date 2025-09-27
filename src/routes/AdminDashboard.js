import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, where, getDocs, Timestamp, } from "firebase/firestore";
const EMPTY_COUNTS = {
    submitted: 0,
    quoted: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
};
/* ---------- shared UI ---------- */
function Card({ title, children, className = "", }) {
    return (_jsxs("div", { className: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl ${className}`, children: [title && (_jsx("div", { className: "px-5 pt-4", children: _jsx("h3", { className: "text-white font-semibold", children: title }) })), _jsx("div", { className: `${title ? "px-5 pb-5 pt-3" : "p-5"}`, children: children })] }));
}
function KpiCard({ label, value, tone = "indigo", }) {
    const ring = tone === "amber"
        ? "ring-amber-400/30 text-amber-200"
        : tone === "emerald"
            ? "ring-emerald-400/30 text-emerald-200"
            : tone === "cyan"
                ? "ring-cyan-400/30 text-cyan-200"
                : tone === "sky"
                    ? "ring-sky-400/30 text-sky-200"
                    : "ring-indigo-400/30 text-indigo-200";
    return (_jsxs("div", { className: `rounded-2xl bg-slate-900/60 ring-1 ${ring} p-4`, children: [_jsx("div", { className: "text-xs uppercase tracking-wider text-slate-400", children: label }), _jsx("div", { className: "mt-2 text-3xl font-semibold text-white tabular-nums", children: value })] }));
}
function Tag({ children, tone = "slate", }) {
    const cls = tone === "indigo"
        ? "bg-indigo-500/10 text-indigo-200"
        : tone === "amber"
            ? "bg-amber-500/10 text-amber-200"
            : tone === "sky"
                ? "bg-sky-500/10 text-sky-200"
                : tone === "emerald"
                    ? "bg-emerald-500/10 text-emerald-200"
                    : tone === "rose"
                        ? "bg-rose-500/10 text-rose-200"
                        : tone === "cyan"
                            ? "bg-cyan-500/10 text-cyan-200"
                            : "bg-slate-700/50 text-slate-200";
    return _jsx("span", { className: `px-2 py-0.5 rounded-md text-xs uppercase ${cls}`, children: children });
}
function Row({ children }) {
    return (_jsx("div", { className: "flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2", children: children }));
}
/* ---------- helpers ---------- */
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
function sortByCreatedAtDesc(a, b) {
    return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}
function mapDocs(snap) {
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    return rows;
}
/* ---------- page ---------- */
export default function AdminDashboard() {
    const [jobs, setJobs] = useState([]);
    const [pendingTopUps, setPendingTopUps] = useState([]);
    const [recentTopUps, setRecentTopUps] = useState([]);
    const [loadedJobs, setLoadedJobs] = useState(false);
    // Jobs listener with fallback
    useEffect(() => {
        const col = collection(db, "printJobs");
        const qWithOrder = query(col, orderBy("createdAt", "desc"));
        const qWithoutOrder = query(col);
        const stop = onSnapshot(qWithOrder, (snap) => {
            setJobs(mapDocs(snap));
            setLoadedJobs(true);
        }, async () => {
            try {
                const first = await getDocs(qWithoutOrder);
                const rows = mapDocs(first).sort(sortByCreatedAtDesc);
                setJobs(rows);
                setLoadedJobs(true);
            }
            catch {
                setJobs([]);
                setLoadedJobs(true);
            }
            onSnapshot(qWithoutOrder, (snap2) => {
                setJobs(mapDocs(snap2).sort(sortByCreatedAtDesc));
            });
        });
        return stop;
    }, []);
    // TopUps: pending (live)
    useEffect(() => {
        const col = collection(db, "topups");
        const qy = query(col, where("status", "==", "pending"));
        const stop = onSnapshot(qy, (snap) => {
            setPendingTopUps(mapDocs(snap).sort(sortByCreatedAtDesc));
        }, async () => {
            const first = await getDocs(qy);
            setPendingTopUps(mapDocs(first).sort(sortByCreatedAtDesc));
        });
        return stop;
    }, []);
    // TopUps: recent approvals / rejections (live)
    useEffect(() => {
        const col = collection(db, "topups");
        const qWithOrder = query(col, where("status", "in", ["approved", "rejected"]), orderBy("createdAt", "desc"));
        const qFallback = query(col, where("status", "in", ["approved", "rejected"]));
        const stop = onSnapshot(qWithOrder, (snap) => {
            const rows = mapDocs(snap).sort(sortByCreatedAtDesc).slice(0, 6);
            setRecentTopUps(rows);
        }, async () => {
            const first = await getDocs(qFallback);
            const rows = mapDocs(first).sort(sortByCreatedAtDesc).slice(0, 6);
            setRecentTopUps(rows);
        });
        return stop;
    }, []);
    // Derived job counts
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
                case "cancelled":
                    out.cancelled++;
                    break;
            }
        }
        return out;
    }, [jobs, loadedJobs]);
    // Queue
    const queue = useMemo(() => {
        const rows = jobs.filter(j => j.status === "approved" || j.status === "processing");
        rows.sort((a, b) => {
            const qa = a?.quote?.queuePosition ?? 999999;
            const qb = b?.quote?.queuePosition ?? 999999;
            if (qa !== qb)
                return qa - qb;
            return sortByCreatedAtDesc(a, b);
        });
        return rows.slice(0, 12);
    }, [jobs]);
    // Recent jobs (submitted/quoted)
    const recentJobs = useMemo(() => {
        return jobs.filter(j => j.status === "submitted" || j.status === "quoted").slice(0, 8);
    }, [jobs]);
    return (_jsxs("div", { className: "relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden", children: [_jsxs(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0.8 }, animate: { opacity: 1 }, transition: { duration: 1.2 }, children: [_jsx(motion.div, { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl", animate: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }, transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl", animate: { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }, transition: { duration: 10, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl", animate: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 max-w-6xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-white", children: "Admin Dashboard" }), _jsx("p", { className: "text-sm text-slate-400", children: "Live operational overview" })] }), _jsxs("div", { className: "grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-4", children: [_jsx(KpiCard, { label: "Top-Ups Pending", value: pendingTopUps.length, tone: "amber" }), _jsx(KpiCard, { label: "Jobs Submitted", value: counts.submitted, tone: "indigo" }), _jsx(KpiCard, { label: "Jobs Quoted", value: counts.quoted, tone: "sky" }), _jsx(KpiCard, { label: "In Queue / Processing", value: counts.processing, tone: "cyan" }), _jsx(KpiCard, { label: "Completed (Total)", value: counts.completed, tone: "emerald" })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Current Queue", children: queue.length === 0 ? (_jsx("p", { className: "text-sm text-slate-300", children: "No jobs in the queue yet." })) : (_jsx("div", { className: "space-y-2", children: queue.map((j) => (_jsxs(Row, { children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-white truncate", children: ["#", j.id?.slice(0, 6), " \u2014 ", j.model?.filename] }), _jsxs("div", { className: "text-xs text-slate-400", children: [j.settings?.filamentType, " \u2022 ", j.settings?.color] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Tag, { tone: "sky", children: j.status }), typeof j.quote?.queuePosition === "number" && (_jsxs(Tag, { tone: "indigo", children: ["Queue ", j.quote.queuePosition] }))] })] }, j.id))) })) }), _jsx(Card, { title: "Top-Ups Pending Approval", children: pendingTopUps.length === 0 ? (_jsx("p", { className: "text-sm text-slate-300", children: "No pending requests." })) : (_jsx("div", { className: "space-y-2", children: pendingTopUps.slice(0, 10).map((t) => (_jsxs(Row, { children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-white truncate", children: ["#", t.id?.slice(0, 6), " \u2014 ", t.userEmail || t.userId] }), _jsxs("div", { className: "text-xs text-slate-400", children: [t.hours ? `${t.hours} h` : "", " ", t.items && t.items.length
                                                                ? `• ${t.items.map(i => `${i.material} ${i.color} ${i.grams}g`).join(", ")}`
                                                                : ""] })] }), _jsx(Tag, { tone: "amber", children: "pending" })] }, t.id))) })) })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Recently Submitted / Quoted", children: recentJobs.length === 0 ? (_jsx("p", { className: "text-sm text-slate-300", children: "No recent jobs." })) : (_jsx("div", { className: "space-y-2", children: recentJobs.map((j) => (_jsxs(Row, { children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-white truncate", children: ["#", j.id?.slice(0, 6), " \u2014 ", j.model?.filename] }), _jsxs("div", { className: "text-xs text-slate-400", children: [j.settings?.filamentType, " \u2022 ", j.settings?.color] })] }), _jsx(Tag, { tone: j.status === "submitted" ? "indigo" : "amber", children: j.status })] }, j.id))) })) }), _jsx(Card, { title: "Recent Top-Up Activity", children: recentTopUps.length === 0 ? (_jsx("p", { className: "text-sm text-slate-300", children: "No recent approvals/rejections." })) : (_jsx("div", { className: "space-y-2", children: recentTopUps.map((t) => (_jsxs(Row, { children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-white truncate", children: ["#", t.id?.slice(0, 6), " \u2014 ", t.userEmail || t.userId] }), _jsxs("div", { className: "text-xs text-slate-400", children: [t.hours ? `${t.hours} h` : "", " ", t.items && t.items.length
                                                                ? `• ${t.items.map(i => `${i.material} ${i.color} ${i.grams}g`).join(", ")}`
                                                                : ""] })] }), _jsx(Tag, { tone: t.status === "approved" ? "emerald" : "rose", children: t.status })] }, t.id))) })) })] })] })] }));
}
