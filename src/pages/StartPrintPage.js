import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/StartPrintPage.tsx
import { useEffect, useMemo, useState } from "react";
import { listJobsByStatus, listMyJobsByStatus, listJobsByStatuses, listMyJobsByStatuses, approveJobAndCharge, userCancelJob, userSetDecision, } from "@/lib/printJobs";
import AdminQuoteForm from "@/components/AdminQuoteForm";
import StartPrintToolbar from "@/components/StartPrintToolbar";
import { useAuth } from "@/contexts/AuthProvider";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
/* ---------------- helpers ---------------- */
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
function sortNewest(a, b) {
    return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}
function fmtDT(v) {
    try {
        if (!v)
            return "-";
        if (v instanceof Timestamp)
            return v.toDate().toLocaleString();
        if (typeof v?.toDate === "function")
            return v.toDate().toLocaleString();
        const d = new Date(v);
        return Number.isFinite(d.getTime()) ? d.toLocaleString() : "-";
    }
    catch {
        return "-";
    }
}
/* ---------- pagination ---------- */
const PAGE_SIZE = 10;
function Pager({ page, pageCount, onPage, }) {
    if (pageCount <= 1)
        return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    return (_jsxs("div", { className: "flex items-center justify-end gap-2 px-1 py-3", children: [_jsx("button", { className: "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40", disabled: page <= 1, onClick: () => onPage(page - 1), children: "Prev" }), pages.map((p) => (_jsx("button", { onClick: () => onPage(p), className: `rounded-md px-3 py-1.5 text-sm ${p === page
                    ? "bg-indigo-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`, children: p }, p))), _jsx("button", { className: "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40", disabled: page >= pageCount, onClick: () => onPage(page + 1), children: "Next" })] }));
}
/* ---------------- component ---------------- */
export default function StartPrintPage() {
    const [tab, setTab] = useState("all");
    const [jobs, setJobs] = useState([]);
    const [notice, setNotice] = useState(null);
    const [userInfo, setUserInfo] = useState({});
    // pagination state
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const isAdmin = user?.email === "bimsbike@gmail.com";
    const adminUid = user?.uid ?? "admin-unknown";
    const navigate = useNavigate();
    // fetch + sort newest
    async function refresh() {
        if (!user)
            return;
        setNotice(null);
        try {
            let data = [];
            if (tab === "all") {
                const allStatuses = [
                    "submitted",
                    "quoted",
                    "approved",
                    "processing",
                    "completed",
                    "cancelled",
                ];
                data = isAdmin
                    ? await listJobsByStatuses(allStatuses)
                    : await listMyJobsByStatuses(user.uid, allStatuses);
            }
            else if (tab === "processing") {
                data = isAdmin
                    ? await listJobsByStatuses(["approved", "processing"])
                    : await listMyJobsByStatuses(user.uid, ["approved", "processing"]);
            }
            else {
                data = isAdmin
                    ? await listJobsByStatus(tab, 500)
                    : await listMyJobsByStatus(user.uid, tab, 500);
            }
            setJobs((data || []).slice().sort(sortNewest));
            setPage(1); // reset to first page on refresh/tab change
        }
        catch (e) {
            setNotice(e?.message ?? String(e));
        }
    }
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, isAdmin, user?.uid]);
    // fetch user profiles for display names
    useEffect(() => {
        let cancelled = false;
        async function fetchUser(uid) {
            if (cancelled)
                return;
            if (userInfo[uid])
                return;
            try {
                const snap = await getDoc(doc(db, "users", uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (!cancelled)
                        setUserInfo((prev) => ({ ...prev, [uid]: data }));
                }
            }
            catch {
                /* ignore */
            }
        }
        jobs.forEach((j) => fetchUser(j.userId));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobs]);
    function renderUser(uid) {
        const info = userInfo[uid];
        return info?.displayName || info?.email || uid;
    }
    // USER: Approve (charge & move to processing bucket)
    async function handleApprove(jobId) {
        if (!user)
            return;
        try {
            await userSetDecision(jobId, user.uid, "approved");
            // reduce race with transaction reads
            for (let i = 0; i < 6; i++) {
                const snap = await getDoc(doc(db, "printJobs", jobId));
                const fresh = snap.data();
                if (fresh?.userDecision?.state === "approved")
                    break;
                await new Promise((r) => setTimeout(r, 150));
            }
            await approveJobAndCharge(jobId, user.uid);
            alert("Approved and queued! We’ve reserved your hours/filament.");
            setTab("processing");
            await refresh();
        }
        catch (e) {
            const msg = String(e?.message ?? e);
            if (msg.includes("INSUFFICIENT_HOURS")) {
                alert("Insufficient hour balance. Please top-up your wallet.");
                navigate("/dashboard/topup");
            }
            else if (msg.includes("INSUFFICIENT_FILAMENT")) {
                alert("Insufficient filament balance. Please top-up your wallet.");
                navigate("/dashboard/topup");
            }
            else if (msg.includes("User has not approved")) {
                alert("Please try again in a moment.");
            }
            else {
                alert("Error approving job: " + msg);
            }
            await refresh();
        }
    }
    async function handleCancel(jobId) {
        if (!user)
            return;
        try {
            await userCancelJob(jobId, user.uid);
            alert("Job cancelled.");
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
        catch (e) {
            alert("Error: " + (e?.message ?? String(e)));
        }
    }
    const tabBtn = (t) => `px-3 py-2 rounded-xl border transition ${tab === t
        ? "bg-white text-black border-white/0"
        : "text-white border-white/20 hover:bg-white/10"}`;
    // derived pagination
    const pageCount = useMemo(() => Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)), [jobs.length]);
    const pagedJobs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return jobs.slice(start, start + PAGE_SIZE);
    }, [jobs, page]);
    return (_jsxs("div", { className: "max-w-5xl mx-auto p-4 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "My Print Status" }), notice && (_jsx("div", { className: "rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-2 text-sm", children: notice })), _jsx("div", { className: "flex gap-2 flex-wrap", children: ["all", "submitted", "quoted", "processing", "completed", "cancelled"].map((t) => (_jsx("button", { onClick: () => setTab(t), className: tabBtn(t), type: "button", children: t }, t))) }), _jsx(Pager, { page: page, pageCount: pageCount, onPage: setPage }), _jsxs("div", { className: "space-y-6", children: [pagedJobs.map((job) => (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-slate-900/40 shadow-inner", children: [_jsxs("div", { className: "flex items-start justify-between px-5 py-4 border-b border-white/10", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "font-semibold text-white", children: ["Job ", _jsxs("span", { className: "text-indigo-300", children: ["#", job.id] })] }), _jsxs("div", { className: "text-xs text-slate-300", children: ["User: ", renderUser(job.userId), _jsx("span", { className: "mx-2", children: "\u2022" }), "Requested: ", _jsx("span", { className: "text-slate-200", children: fmtDT(job.createdAt) })] }), _jsxs("a", { href: job.model.publicUrl, target: "_blank", rel: "noreferrer", className: "text-sm underline text-indigo-300 hover:text-indigo-200", children: ["Download model (", job.model.filename, ")"] })] }), _jsxs("div", { className: "text-sm text-slate-300", children: ["Status:", " ", _jsx("span", { className: "inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-slate-100", children: job.status })] })] }), _jsxs("div", { className: "p-5 space-y-4", children: [_jsxs("div", { className: "text-sm grid md:grid-cols-2 gap-2 text-slate-200", children: [_jsxs("p", { children: [_jsx("strong", { children: "Quantity:" }), " ", job.quantity] }), job.settings?.filamentType && (_jsxs("p", { children: [_jsx("strong", { children: "Filament Type:" }), " ", job.settings.filamentType] })), job.settings?.color && (_jsxs("p", { children: [_jsx("strong", { children: "Color:" }), " ", job.settings.color] })), job.settings?.preset === "custom" && (_jsxs(_Fragment, { children: [job.settings.infillPercent !== undefined && (_jsxs("p", { children: [_jsx("strong", { children: "Infill %:" }), " ", job.settings.infillPercent] })), job.settings.wallLoops !== undefined && (_jsxs("p", { children: [_jsx("strong", { children: "Wall Loops:" }), " ", job.settings.wallLoops] }))] })), job.notes && (_jsxs("p", { className: "md:col-span-2 break-words max-w-full", children: [_jsx("strong", { children: "User Notes:" }), " ", job.notes] }))] }), job.quote && (_jsxs("div", { className: "rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4", children: [_jsx("div", { className: "mb-2 text-sm font-semibold text-indigo-200", children: "Admin Estimate" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-200", children: [_jsxs("p", { children: [_jsx("strong", { children: "Estimated Hours:" }), " ", job.quote.hours != null ? (_jsxs(_Fragment, { children: [Math.floor(job.quote.hours), " Hours :", " ", Math.round((job.quote.hours - Math.floor(job.quote.hours)) * 60), " Minutes"] })) : ("-")] }), _jsxs("p", { children: [_jsx("strong", { children: "Estimated Filament:" }), " ", job.quote.grams, " g"] }), typeof job.quote.queuePosition === "number" && (_jsxs("p", { children: [_jsx("strong", { children: "Queue Position:" }), " ", job.quote.queuePosition] })), job.quote.notes && (_jsxs("p", { className: "sm:col-span-3 break-words max-w-full", children: [_jsx("strong", { children: "Admin Notes:" }), " ", job.quote.notes] }))] })] })), isAdmin && job.status === "submitted" && tab !== "processing" && (_jsx(AdminQuoteForm, { jobId: job.id, adminUid: adminUid, onSaved: () => setTab("quoted") })), !isAdmin && (tab === "quoted" || job.status === "quoted") && job.quote && (_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { onClick: () => handleApprove(job.id), className: "rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700", children: "Approve & Continue" }), _jsx("button", { onClick: () => handleCancel(job.id), className: "rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700", children: "Cancel Job" })] })), isAdmin &&
                                        (tab === "processing" ||
                                            job.status === "approved" ||
                                            job.status === "processing") && (_jsx(StartPrintToolbar, { jobId: job.id, onChanged: () => refresh() })), !isAdmin && !job.quote && job.status === "submitted" && (_jsx("div", { className: "text-sm text-slate-300", children: "Waiting for admin to quote your job. You\u2019ll get hours/filament estimate here." }))] })] }, job.id))), !pagedJobs.length && !notice && (_jsx("p", { className: "text-sm text-gray-400", children: "No jobs in this bucket yet." }))] }), _jsx(Pager, { page: page, pageCount: pageCount, onPage: setPage })] }));
}
