"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import TopNav from "@/components/Navbar";
import { motion } from "framer-motion";
export default function Register() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [accept, setAccept] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        if (!accept) {
            setErr("You must accept the Terms of Service & Customer Consent.");
            return;
        }
        if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
        }
        setBusy(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            if (displayName.trim()) {
                await updateProfile(cred.user, { displayName: displayName.trim() });
            }
            await setDoc(doc(db, "users", cred.user.uid), {
                email: email.trim(),
                displayName: displayName.trim(),
                createdAt: serverTimestamp(),
                termsAccepted: true,
                consentAt: serverTimestamp(),
            });
            navigate("/dashboard", { replace: true });
        }
        catch (e) {
            setErr(e?.message ?? "Failed to create account.");
        }
        finally {
            setBusy(false);
        }
    }
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    return (_jsxs(_Fragment, { children: [_jsx(TopNav, {}), _jsxs("div", { className: "relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" })] }), _jsx(motion.main, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "relative z-10 w-full max-w-md px-6", children: _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-1", children: "Create account" }), _jsx("p", { className: "text-slate-400 mb-6", children: "Get started with Sky3D and print your first project." }), err && (_jsx("div", { className: "mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: err })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx("input", { type: "text", className: input, placeholder: "Full name", value: displayName, onChange: (e) => setDisplayName(e.target.value), required: true }), _jsx("input", { type: "email", className: input, placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", required: true }), _jsx("input", { type: "password", className: input, placeholder: "Create password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password", required: true }), _jsx("input", { type: "password", className: input, placeholder: "Confirm password", value: confirm, onChange: (e) => setConfirm(e.target.value), autoComplete: "new-password", required: true }), _jsxs("label", { className: "flex items-start gap-3 text-sm text-slate-300", children: [_jsx("input", { type: "checkbox", checked: accept, onChange: (e) => setAccept(e.target.checked), className: "mt-1 h-4 w-4 rounded border-slate-500 bg-slate-800" }), _jsxs("span", { children: ["I agree to the", " ", _jsx(Link, { to: "/terms", className: "text-indigo-300 hover:text-indigo-200 underline", children: "Terms of Service" }), " ", "and", " ", _jsx(Link, { to: "/terms#consent", className: "text-indigo-300 hover:text-indigo-200 underline", children: "Customer Consent" }), "."] })] }), _jsx("button", { type: "submit", disabled: busy, className: "w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50", children: busy ? "Creating…" : "Create Account" })] }), _jsx("div", { className: "mt-4 flex items-center justify-between text-sm text-slate-400", children: _jsx(Link, { to: "/login", className: "hover:text-white", children: "Already have an account? Login" }) })] }) })] })] }));
}
