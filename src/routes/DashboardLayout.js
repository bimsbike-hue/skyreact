// src/routes/DashboardLayout.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
const tabBase = "w-full text-left px-4 py-3 rounded-xl ring-1 ring-white/10 bg-white/5 hover:bg-white/10 " +
    "text-slate-200 hover:text-white transition";
const tabActive = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30";
function SideItem({ to, children, }) {
    return (_jsx(NavLink, { to: to, end: true, className: ({ isActive }) => `${tabBase} ${isActive ? tabActive : ""}`, children: children }));
}
export default function DashboardLayout() {
    const { user } = useAuth();
    const isAdmin = user?.email === "bimsbike@gmail.com";
    return (_jsx("div", { className: "min-h-screen bg-slate-950", children: _jsxs("div", { className: "relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" }), _jsx("div", { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-500" })] }), _jsxs("div", { className: "relative z-10 mx-auto max-w-screen-2xl grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6 px-6 md:px-8 py-8", children: [_jsxs("aside", { className: "space-y-3", children: [!isAdmin && (_jsxs(_Fragment, { children: [_jsx(SideItem, { to: "overview", children: "Overview" }), _jsx(SideItem, { to: "topup", children: "Top-Up" }), _jsx(SideItem, { to: "purchase-history", children: "Purchase History" }), _jsx(SideItem, { to: "profile", children: "Profile" }), _jsx("div", { className: "h-px bg-white/10 my-2" }), _jsx(SideItem, { to: "new-print", children: "New Job" }), _jsx(SideItem, { to: "start-print", children: "My Print Status" })] })), isAdmin && (_jsxs(_Fragment, { children: [_jsx("div", { className: "uppercase text-[11px] tracking-wider text-slate-400 px-1", children: "Admin" }), _jsx(SideItem, { to: "admin-dashboard", children: "Admin Dashboard" }), _jsx(SideItem, { to: "admin-users", children: "User List" }), _jsx(SideItem, { to: "start-print", children: "Users Print Status" }), _jsx(SideItem, { to: "admin", children: "Top-Up Approvals" }), _jsx(SideItem, { to: "admin-history", children: "All Purchases" })] }))] }), _jsx("section", { className: "min-h-[60vh]", children: _jsx(Outlet, {}) })] })] }) }));
}
