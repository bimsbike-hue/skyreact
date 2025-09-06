// src/routes/DashboardLayout.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
export default function DashboardLayout() {
    const { user } = useAuth();
    // Base sidebar items
    const items = [
        { to: "/dashboard/overview", label: "Overview" },
        { to: "/dashboard/topup", label: "Top-Up" },
        { to: "/dashboard/orders", label: "My Orders" },
        { to: "/dashboard/subscriptions", label: "Subscriptions" },
        { to: "/dashboard/profile", label: "Profile" },
    ];
    // Show Admin Panel only for the admin email
    if (user?.email === "bimsbike@gmail.com") {
        // insert near the top (after Overview) or move where you prefer
        items.splice(1, 0, { to: "/dashboard/admin", label: "Admin Panel" });
    }
    return (_jsxs("div", { className: "flex flex-col lg:flex-row gap-6 p-6", children: [_jsx("aside", { className: "w-full lg:w-1/4 space-y-2", children: items.map((item) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => `block w-full text-left px-4 py-2 rounded-lg transition ${isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-white hover:bg-gray-700"}`, children: item.label }, item.to))) }), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) })] }));
}
