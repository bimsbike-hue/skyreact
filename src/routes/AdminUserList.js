import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";
export default function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const rows = [];
            snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
            setUsers(rows);
        });
        return unsub;
    }, []);
    const filtered = useMemo(() => {
        const f = filter.trim().toLowerCase();
        if (!f)
            return users;
        return users.filter((u) => [u.email, u.displayName, u.name, u.phone, u.address]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(f)));
    }, [filter, users]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold text-white", children: "User List" }), _jsxs("div", { className: "text-sm text-slate-400", children: [filtered.length, " users"] })] }), _jsx("div", { className: "flex gap-2", children: _jsx("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "Search name, email, phone, address\u2026", className: "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" }) }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-white/10", children: _jsxs("table", { className: "min-w-full bg-slate-900/40", children: [_jsx("thead", { className: "text-left text-xs uppercase tracking-wide text-slate-400", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "Name" }), _jsx("th", { className: "px-4 py-3", children: "Email" }), _jsx("th", { className: "px-4 py-3", children: "Phone" }), _jsx("th", { className: "px-4 py-3", children: "Address" }), _jsx("th", { className: "px-4 py-3", children: "User ID" }), _jsx("th", { className: "px-4 py-3", children: "Action" })] }) }), _jsxs("tbody", { className: "text-sm text-slate-200", children: [filtered.map((u) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { className: "px-4 py-3", children: u.name || u.displayName || _jsx("span", { className: "text-slate-500", children: "\u2014" }) }), _jsx("td", { className: "px-4 py-3", children: u.email || _jsx("span", { className: "text-slate-500", children: "\u2014" }) }), _jsx("td", { className: "px-4 py-3", children: u.phone || _jsx("span", { className: "text-slate-500", children: "\u2014" }) }), _jsx("td", { className: "px-4 py-3 max-w-[26rem]", children: _jsx("div", { className: "truncate", title: u.address || "", children: u.address || _jsx("span", { className: "text-slate-500", children: "\u2014" }) }) }), _jsx("td", { className: "px-4 py-3 text-slate-400", children: u.id }), _jsx("td", { className: "px-4 py-3", children: _jsx(Link, { to: u.id, className: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700", children: "Details" }) })] }, u.id))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "px-4 py-6 text-slate-400", colSpan: 6, children: "No users found." }) }))] })] }) })] }));
}
