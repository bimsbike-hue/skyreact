import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/TopNavbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
export default function TopNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    async function handleLogout() {
        await logout();
        navigate("/login");
    }
    const linkBase = "px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10";
    const linkActive = "bg-indigo-600 text-white hover:bg-indigo-600";
    return (_jsx("nav", { className: "sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b1220]/90 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [_jsx("div", { className: "text-white font-semibold", children: "Sky3D" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(NavLink, { to: "/", className: ({ isActive }) => (isActive ? `${linkBase} ${linkActive}` : linkBase), children: "Home" }), _jsx(NavLink, { to: "/dashboard", className: ({ isActive }) => (isActive ? `${linkBase} ${linkActive}` : linkBase), children: "Dashboard" }), user && (_jsx("button", { onClick: handleLogout, className: "ml-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700", children: "Logout" }))] })] }) }));
}
