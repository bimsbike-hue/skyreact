import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loggingOut, setLoggingOut] = useState(false);
    const isDashboard = location.pathname.startsWith("/dashboard");
    const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
    async function handleLogout() {
        try {
            setLoggingOut(true);
            await signOut(auth);
            navigate("/login", { replace: true });
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoggingOut(false);
        }
    }
    return (_jsx("nav", { className: "sticky top-0 z-40 bg-[#0b1220] border-b border-white/10", children: _jsxs("div", { className: "mx-auto w-full max-w-screen-2xl px-8 py-3 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-xl font-bold text-white", children: "Sky3D" }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsx(Link, { className: "text-slate-300 hover:text-white transition", to: "/", children: "Home" }), user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/dashboard", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition", children: "Dashboard" }), _jsx("button", { onClick: handleLogout, disabled: loggingOut, className: "text-slate-300 hover:text-white transition disabled:opacity-60", children: loggingOut ? "Signing out…" : "Logout" }), isDashboard && (_jsxs("span", { className: "ml-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium text-sm", children: ["\uD83D\uDC4B Hi, ", displayName, "!"] }))] })) : (_jsx(Link, { to: "/login", className: "text-slate-300 hover:text-white transition", children: "Login" }))] })] }) }));
}
