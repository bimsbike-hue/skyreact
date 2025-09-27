import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/MyJobsPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { listMyJobsByStatus } from "@/lib/printJobs";
export default function MyJobsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState("submitted");
    const [jobs, setJobs] = useState([]);
    const [notice, setNotice] = useState(null);
    useEffect(() => {
        let cancelled = false;
        if (!user)
            return;
        (async () => {
            try {
                setNotice(null);
                const data = await listMyJobsByStatus(user.uid, tab, 50);
                if (!cancelled)
                    setJobs(data);
            }
            catch (e) {
                if (!cancelled)
                    setNotice(e?.message ?? String(e));
            }
        })();
        return () => { cancelled = true; };
    }, [tab, user]);
    return (_jsxs("div", { className: "max-w-5xl mx-auto p-4 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("h1", { className: "text-2xl font-bold", children: "My Jobs" }) }), notice && (_jsx("div", { className: "rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-2 text-sm", children: notice })), _jsx("div", { className: "flex gap-2", children: ["submitted", "quoted", "approved", "processing"].map(t => (_jsx("button", { onClick: () => setTab(t), className: "px-3 py-2 rounded-xl border " + (t === tab ? "bg-white text-black" : "text-white"), children: t }, t))) }), _jsxs("div", { className: "space-y-6", children: [jobs.map(job => (_jsx("div", { className: "rounded-2xl border p-4 bg-gray-50/5 space-y-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "font-semibold text-white", children: ["Job #", job.id] }), _jsxs("div", { className: "text-sm text-gray-300", children: ["Qty: ", job.quantity] }), _jsxs("div", { className: "text-sm text-gray-300", children: ["Settings: ", job.settings?.preset ?? "default"] }), _jsx("a", { href: job.model.publicUrl, target: "_blank", className: "text-sm underline", children: "Download model" })] }), _jsxs("div", { className: "text-sm text-gray-200", children: ["Status: ", _jsx("span", { className: "font-medium", children: job.status })] })] }) }, job.id))), !jobs.length && !notice && (_jsx("p", { className: "text-sm text-gray-400", children: "No jobs in this bucket yet." }))] })] }));
}
