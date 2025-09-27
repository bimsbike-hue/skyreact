import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/AdminUserDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, Timestamp, } from "firebase/firestore";
import { db } from "@/lib/firebase";
/* --------------------------- Utilities --------------------------- */
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
function mapJobs(snap) {
    const rows = [];
    snap.forEach((d) => rows.push({ ...d.data(), id: d.id }));
    return rows;
}
function sortByCreatedAtDesc(a, b) {
    return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}
function formatHM(totalHours) {
    const h = Math.max(0, Math.floor(Number(totalHours || 0)));
    const minutes = Math.round((Number(totalHours || 0) - h) * 60);
    const hh = `${h} ${h === 1 ? "Hour" : "Hours"}`;
    const mm = `${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
    return `${hh} : ${mm}`;
}
function StatusBadge({ status }) {
    const map = {
        submitted: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/30",
        quoted: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
        approved: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
        processing: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
        completed: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
        cancelled: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
        error: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
    };
    const cls = map[status] ||
        "bg-slate-600/10 text-slate-300 ring-slate-400/30";
    return (_jsx("span", { className: `rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${cls} uppercase tracking-wide`, children: status }));
}
/* ---------------------------- Component -------------------------- */
export default function AdminUserDetail() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [userDoc, setUserDoc] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!uid)
            return;
        const userRef = doc(db, "users", uid);
        const walletRef = doc(db, "users", uid, "wallet", "summary");
        const jobsQ = query(collection(db, "printJobs"), where("userId", "==", uid), orderBy("createdAt", "desc"));
        let stopJobs = () => { };
        (async () => {
            const [uSnap, wSnap] = await Promise.all([getDoc(userRef), getDoc(walletRef)]);
            if (uSnap.exists())
                setUserDoc(uSnap.data());
            if (wSnap.exists())
                setWallet(wSnap.data());
            stopJobs = onSnapshot(jobsQ, (snap) => {
                setJobs(mapJobs(snap));
                setLoading(false);
            }, async () => {
                // fallback if no index: fetch without order and sort locally
                const fallbackQ = query(collection(db, "printJobs"), where("userId", "==", uid));
                const first = await getDocs(fallbackQ);
                const rows = mapJobs(first).sort(sortByCreatedAtDesc);
                setJobs(rows);
                setLoading(false);
            });
        })();
        return () => {
            stopJobs?.();
        };
    }, [uid]);
    const counts = useMemo(() => {
        const out = { submitted: 0, quoted: 0, processing: 0, completed: 0 };
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
    }, [jobs]);
    const recent = useMemo(() => jobs.slice(0, 6), [jobs]);
    /* ---------------------------- UI Pieces ---------------------------- */
    function StatCard({ title, value, sub, }) {
        return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner", children: [_jsx("div", { className: "text-xs font-medium text-slate-400 mb-2", children: title }), _jsx("div", { className: "text-3xl md:text-4xl font-extrabold text-white tracking-tight", children: value }), sub && _jsx("div", { className: "text-xs text-slate-500 mt-1", children: sub })] }));
    }
    function ProfileCard() {
        return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/60 p-5", children: [_jsx("h3", { className: "text-white font-semibold mb-3", children: "Profile" }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-slate-400", children: "Name" }), _jsx("div", { className: "text-slate-200", children: userDoc?.displayName || "—" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-slate-400", children: "Email" }), _jsx("div", { className: "text-slate-200", children: userDoc?.email || "—" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-slate-400", children: "Phone (WA)" }), _jsx("div", { className: "text-slate-200", children: userDoc?.phone || "—" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-slate-400", children: "Address" }), _jsx("div", { className: "text-slate-200", children: userDoc?.address || "—" })] })] })] }));
    }
    function FilamentGroup({ title, colors, }) {
        const total = Object.values(colors).reduce((a, b) => a + (Number(b) || 0), 0);
        return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/60 p-4", children: [_jsx("div", { className: "text-white font-semibold mb-2", children: title }), _jsxs("div", { className: "space-y-1 text-sm text-slate-300", children: [Object.keys(colors).length === 0 && _jsx("div", { children: "\u2014" }), Object.entries(colors).map(([c, grams]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: c }), _jsxs("span", { className: "tabular-nums", children: [grams, " g"] })] }, c))), _jsxs("div", { className: "flex justify-between font-semibold text-slate-200 border-t border-white/10 pt-1 mt-1", children: [_jsx("span", { children: "Total" }), _jsxs("span", { className: "tabular-nums", children: [total, " g"] })] })] })] }));
    }
    /* ------------------------------- Render ------------------------------ */
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl md:text-2xl font-bold text-white", children: "User Detail" }), _jsxs("div", { className: "text-sm text-slate-400", children: [userDoc?.displayName || "—", " \u2022 ", userDoc?.email || "—"] })] }), _jsx("button", { onClick: () => navigate("/dashboard/admin-users"), className: "rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-2 text-sm", children: "Back to list" })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [_jsx(StatCard, { title: "Hours Balance", value: _jsx("span", { className: "tabular-nums", children: formatHM(wallet?.hours) }), sub: "Usable for print jobs (Hours : Minutes)" }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner", children: [_jsx("div", { className: "text-xs font-medium text-slate-400 mb-3", children: "Filament Balance" }), _jsx("div", { className: "space-y-2 text-sm text-slate-200", children: wallet?.filament ? (Object.entries(wallet.filament).map(([mat, colors]) => {
                                    const sum = Object.values(colors).reduce((a, b) => a + (Number(b) || 0), 0);
                                    return (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: mat }), _jsxs("span", { className: "tabular-nums", children: [sum, " g"] })] }, mat));
                                })) : (_jsx("div", { children: "\u2014" })) })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-inner", children: [_jsx("div", { className: "text-xs font-medium text-slate-400 mb-3", children: "Jobs Summary" }), _jsxs("div", { className: "space-y-1 text-sm text-slate-200", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Submitted" }), _jsx("span", { className: "tabular-nums", children: counts.submitted })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Quoted" }), _jsx("span", { className: "tabular-nums", children: counts.quoted })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Processing" }), _jsx("span", { className: "tabular-nums", children: counts.processing })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Completed" }), _jsx("span", { className: "tabular-nums", children: counts.completed })] })] })] })] }), _jsx(ProfileCard, {}), _jsxs("section", { className: "rounded-2xl border border-white/10 bg-slate-900/60 p-5", children: [_jsx("h3", { className: "text-white font-semibold mb-3", children: "Filament details" }), !wallet?.filament ? (_jsx("div", { className: "text-sm text-slate-400", children: "No filament info." })) : (_jsx("div", { className: "grid md:grid-cols-2 gap-4", children: Object.entries(wallet.filament).map(([mat, colors]) => (_jsx(FilamentGroup, { title: mat, colors: colors }, mat))) }))] }), _jsxs("section", { className: "rounded-2xl border border-white/10 bg-slate-900/60 p-5", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-semibold", children: "Recent Jobs" }), !loading && recent.length > 0 && (_jsxs("div", { className: "text-xs text-slate-400", children: [recent.length, " shown"] }))] }), loading ? (_jsx("p", { className: "text-sm text-slate-400", children: "Loading\u2026" })) : recent.length === 0 ? (_jsx("p", { className: "text-sm text-slate-400", children: "No jobs yet." })) : (_jsx("div", { className: "space-y-2", children: recent.map((j) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-white text-sm truncate", children: [_jsxs("span", { className: "text-white/80 mr-1", children: ["#", j.id?.slice(0, 5)] }), "\u2014 ", j.model?.filename] }), _jsxs("div", { className: "text-xs text-slate-400", children: [j.settings?.filamentType, " \u2022 ", j.settings?.color] })] }), _jsx(StatusBadge, { status: j.status })] }, j.id))) }))] })] }));
}
