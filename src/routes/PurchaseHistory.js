import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/PurchaseHistory.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query, startAfter, where, Timestamp, } from "firebase/firestore";
import Pager from "@/components/Pager";
const PAGE_SIZE = 8;
const fmtIDR = (n) => typeof n === "number" ? `Rp ${n.toLocaleString("id-ID")}` : "-";
export default function PurchaseHistory() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [cursors, setCursors] = useState([null]);
    async function loadPage(p) {
        if (!user)
            return;
        setLoading(true);
        try {
            const base = collection(db, "topups");
            const baseQ = query(base, where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(PAGE_SIZE + 1));
            const cursor = cursors[p - 1] || null;
            const qy = cursor ? query(baseQ, startAfter(cursor)) : baseQ;
            const snap = await getDocs(qy);
            const docs = snap.docs.slice(0, PAGE_SIZE);
            const nextCursor = snap.docs.length > PAGE_SIZE ? snap.docs[PAGE_SIZE - 1] : null;
            setRows(docs.map((d) => ({ id: d.id, ...d.data() })));
            const newCursors = [...cursors];
            if (!newCursors[p])
                newCursors[p] = docs[docs.length - 1] || newCursors[p - 1] || null;
            if (nextCursor && !newCursors[p + 1])
                newCursors[p + 1] = nextCursor;
            setCursors(newCursors);
            setTotal((p - 1) * PAGE_SIZE + docs.length + (nextCursor ? PAGE_SIZE : 0));
            setPage(p);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);
    function formatDate(v) {
        try {
            const d = v instanceof Timestamp ? v.toDate() : typeof v?.toDate === "function" ? v.toDate() : new Date(v);
            return d.toLocaleString();
        }
        catch {
            return "";
        }
    }
    const card = "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-xl font-semibold text-white", children: "Purchase History" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Your submitted top-ups and their statuses." })] }), _jsxs("div", { className: card, children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-slate-300", children: [_jsx("th", { className: "py-2", children: "Created" }), _jsx("th", { className: "py-2", children: "Hours" }), _jsx("th", { className: "py-2", children: "Filament (g)" }), _jsx("th", { className: "py-2", children: "Amount" }), _jsx("th", { className: "py-2", children: "Status" })] }) }), _jsxs("tbody", { className: "text-slate-200", children: [rows.map((r) => (_jsxs("tr", { className: "border-t border-white/5", children: [_jsx("td", { className: "py-2", children: formatDate(r.createdAt) }), _jsx("td", { className: "py-2 tabular-nums", children: r.hours ?? 0 }), _jsx("td", { className: "py-2 tabular-nums", children: r.grams ?? 0 }), _jsx("td", { className: "py-2 tabular-nums", children: fmtIDR(r.amountIDR ?? r.amount) }), _jsx("td", { className: "py-2", children: _jsx("span", { className: `rounded-md px-2 py-0.5 text-xs uppercase tracking-wide ring-1 ${r.status === "approved"
                                                            ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/30"
                                                            : r.status === "pending"
                                                                ? "bg-amber-500/10 text-amber-200 ring-amber-400/30"
                                                                : "bg-rose-500/10 text-rose-200 ring-rose-400/30"}`, children: r.status }) })] }, r.id))), !loading && rows.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "py-8 text-center text-slate-400", children: "No records." }) }))] })] }) }), _jsx(Pager, { page: page, total: total, pageSize: PAGE_SIZE, onPageChange: loadPage })] })] }));
}
