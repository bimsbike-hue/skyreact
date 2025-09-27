import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/ResetPassword.tsx
import { useState } from "react";
import TopNav from "../components/Navbar";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [ok, setOk] = useState(null);
    const [err, setErr] = useState(null);
    async function handleSubmit(e) {
        e.preventDefault();
        setOk(null);
        setErr(null);
        const trimmed = email.trim();
        if (!trimmed) {
            setErr("Please enter your email.");
            return;
        }
        setBusy(true);
        try {
            await sendPasswordResetEmail(auth, trimmed);
            setOk("If that email address exists in our system, a reset link has been sent.");
        }
        catch (e) {
            setErr(e?.message ?? "Failed to send reset email. Please try again.");
        }
        finally {
            setBusy(false);
        }
    }
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900", children: [_jsx(TopNav, {}), _jsxs("div", { className: "relative min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden", children: [_jsxs(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.2 }, children: [_jsx(motion.div, { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl", animate: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }, transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl", animate: { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }, transition: { duration: 10, repeat: Infinity, ease: "easeInOut" } }), _jsx(motion.div, { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl", animate: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" } })] }), _jsx(motion.main, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: "easeOut" }, className: "relative z-10 w-full max-w-md px-4", children: _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl p-6 space-y-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.6 }, children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Reset Password" }), _jsx("p", { className: "text-slate-300 text-sm", children: "Enter the email you used to sign up. We\u2019ll send you a password reset link." })] }), err && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: err })), ok && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200", children: ok })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsx(motion.input, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.3 }, type: "email", className: input, placeholder: "your@email.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: busy }), _jsx(motion.button, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.4 }, type: "submit", disabled: busy, className: "w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 transition", children: busy ? "Sending…" : "Send Reset Link" })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, className: "flex items-center justify-between text-sm text-slate-400", children: [_jsx(Link, { to: "/login", className: "hover:text-white transition", children: "Back to Login" }), _jsx(Link, { to: "/signup", className: "hover:text-white transition", children: "Create account" })] })] }) })] })] }));
}
