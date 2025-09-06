import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
export default function TopNav() {
    const { user, logout } = useAuth();
    const linkClass = ({ isActive }) => "px-3 py-2 rounded-md text-sm font-medium " +
        (isActive ? "bg-indigo-600 text-white" : "text-gray-200 hover:bg-gray-700");
    return (_jsx("header", { className: "bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-white/10", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-3 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-xl font-bold text-white", children: "Sky3D" }), _jsxs("nav", { className: "flex gap-2", children: [_jsx(NavLink, { to: "/", className: linkClass, end: true, children: "Home" }), _jsx(NavLink, { to: "/dashboard", className: linkClass, children: "Dashboard" }), !user && _jsx(NavLink, { to: "/login", className: linkClass, children: "Login" }), !user && (_jsx("a", { href: "#", className: "px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white", onClick: (e) => e.preventDefault(), children: "Sign Up" })), user && (_jsx("button", { onClick: logout, className: "px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700", children: "Logout" }))] })] }) }));
}
