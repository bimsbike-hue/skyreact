"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import TopNav from "@/components/Navbar";
import { motion } from "framer-motion";
export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            navigate("/dashboard", { replace: true });
        }
        catch (e) {
            setErr(e?.message ?? "Failed to sign in.");
        }
        finally {
            setBusy(false);
        }
    }
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    return (_jsxs(_Fragment, { children: [_jsx(TopNav, {}), _jsxs("div", { className: "relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" })] }), _jsx(motion.main, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 w-full max-w-md px-6", children: _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Welcome back" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Sign in to continue to your dashboard." }), err && (_jsx("div", { className: "mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: err })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx("input", { type: "email", className: input, placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", required: true }), _jsx("input", { type: "password", className: input, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true }), _jsx("button", { type: "submit", disabled: busy, className: "w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50", children: busy ? "Signing in…" : "Sign In" })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-slate-400", children: [_jsx(Link, { to: "/reset-password", className: "hover:text-white", children: "Forgot password?" }), _jsx(Link, { to: "/signup", className: "hover:text-white", children: "Create account" })] })] }) })] })] }));
}
