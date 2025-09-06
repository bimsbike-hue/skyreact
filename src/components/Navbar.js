import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const navLink = "block px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-300";
    const isActive = (p) => pathname === p ? "text-white" : "text-slate-300";
    async function handleLogout() {
        try {
            await logout();
            setOpen(false);
            navigate("/login");
        }
        catch (err) {
            console.error("Logout failed:", err);
        }
    }
    function closeMobile() {
        setOpen(false);
    }
    return (_jsxs("nav", { className: "bg-slate-900 text-white sticky top-0 z-40 shadow", children: [_jsx("div", { className: "mx-auto max-w-6xl px-4", children: _jsxs("div", { className: "flex h-16 items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-xl font-bold", onClick: closeMobile, children: "Sky3D" }), _jsxs("div", { className: "hidden md:flex items-center space-x-6", children: [_jsx(Link, { to: "/", className: `${navLink} ${isActive("/")}`, children: "Home" }), _jsx(Link, { to: "/dashboard", className: `${navLink} ${isActive("/dashboard")}`, children: "Dashboard" }), !user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: `${navLink} ${isActive("/login")}`, children: "Login" }), _jsx(Link, { to: "/signup", className: "px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700", children: "Sign Up" })] })) : (_jsx("button", { onClick: handleLogout, className: "px-3 py-2 rounded-md text-sm font-medium bg-slate-700 hover:bg-slate-600", children: "Logout" }))] }), _jsx("button", { className: "md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:text-white focus:outline-none", "aria-label": "Toggle menu", "aria-expanded": open, onClick: () => setOpen((v) => !v), children: open ? (
                            // X
                            _jsx("svg", { className: "h-6 w-6", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })) : (
                            // Bars
                            _jsx("svg", { className: "h-6 w-6", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h16M4 18h16" }) })) })] }) }), open && (_jsx("div", { className: "md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur", children: _jsxs("div", { className: "space-y-1 px-4 py-3", children: [_jsx(Link, { to: "/", onClick: closeMobile, className: `${navLink} ${isActive("/")}`, children: "Home" }), _jsx(Link, { to: "/dashboard", onClick: closeMobile, className: `${navLink} ${isActive("/dashboard")}`, children: "Dashboard" }), !user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", onClick: closeMobile, className: `${navLink} ${isActive("/login")}`, children: "Login" }), _jsx(Link, { to: "/signup", onClick: closeMobile, className: "block px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700", children: "Sign Up" })] })) : (_jsx("button", { onClick: handleLogout, className: "w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-slate-700 hover:bg-slate-600", children: "Logout" }))] }) }))] }));
}
