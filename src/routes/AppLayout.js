import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/AppLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
export default function AppLayout() {
    const location = useLocation();
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100", children: [_jsx(Navbar, {}), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.main, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8", children: _jsx(Outlet, {}) }, location.pathname) })] }));
}
