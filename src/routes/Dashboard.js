// src/routes/Dashboard.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import Navbar from "../components/Navbar";
export default function Dashboard() {
    const { user } = useAuth();
    const isAdmin = user?.email === "bimsbike@gmail.com";
    if (!user) {
        return (_jsx("main", { className: "p-6 max-w-6xl mx-auto text-white", children: "Please sign in to view the dashboard." }));
    }
    const itemBase = "block w-full text-left px-4 py-3 rounded-lg transition bg-gray-800 text-white hover:bg-gray-700";
    const itemActive = "block w-full text-left px-4 py-3 rounded-lg transition bg-indigo-600 text-white";
    const links = [
        { to: "overview", label: "Overview", end: true },
        { to: "topup", label: "Top-Up" },
        { to: "history", label: "Purchase History" },
        { to: "profile", label: "Profile" },
        ...(isAdmin
            ? [
                { to: "admin-history", label: "User Purchase History" },
                { to: "admin", label: "Admin Panel" },
            ]
            : []),
    ];
    return (_jsxs("div", { className: "min-h-screen bg-[#0b1220]", children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-6", children: [_jsx("aside", { className: "w-full lg:w-1/4 space-y-3", children: links.map((l) => (_jsx(NavLink, { to: l.to, end: l.end, className: ({ isActive }) => (isActive ? itemActive : itemBase), children: l.label }, l.to))) }), _jsx("main", { className: "flex-1 space-y-6", children: _jsx(Outlet, {}) })] })] }));
}
