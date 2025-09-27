import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/ChangePassword.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, } from "firebase/auth";
export default function ChangePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(null);
    const canSubmit = useMemo(() => {
        if (busy)
            return false;
        return currentPw.length >= 1 && newPw.length >= 6 && newPw === confirmPw;
    }, [busy, currentPw, newPw, confirmPw]);
    async function handleSubmit(e) {
        e.preventDefault();
        setErr(null);
        setOk(null);
        if (!user) {
            setErr("You must be signed in to change your password.");
            return;
        }
        if (!user.email) {
            setErr("This account is not using email/password sign-in.");
            return;
        }
        if (newPw !== confirmPw) {
            setErr("New password and confirmation do not match.");
            return;
        }
        if (newPw.length < 6) {
            setErr("New password must be at least 6 characters long.");
            return;
        }
        setBusy(true);
        try {
            // Reauthenticate with the current password
            const cred = EmailAuthProvider.credential(user.email, currentPw);
            await reauthenticateWithCredential(user, cred);
            // Update to the new password
            await updatePassword(user, newPw);
            setOk("Password updated successfully.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        }
        catch (e) {
            // Friendly messages for common errors
            const msg = (e?.message || "").toLowerCase();
            if (msg.includes("auth/wrong-password")) {
                setErr("Your current password is incorrect.");
            }
            else if (msg.includes("auth/weak-password")) {
                setErr("New password is too weak. Please use at least 6 characters.");
            }
            else if (msg.includes("requires-recent-login")) {
                setErr("For security, please sign in again and try changing the password.");
            }
            else {
                setErr(e?.message ?? "Failed to change password.");
            }
        }
        finally {
            setBusy(false);
        }
    }
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    return (_jsxs("div", { className: "max-w-xl mx-auto p-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-6", children: "Change Password" }), _jsxs("form", { onSubmit: handleSubmit, className: "rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm text-slate-200", children: "Current Password" }), _jsx("input", { type: "password", autoComplete: "current-password", className: input, value: currentPw, onChange: (e) => setCurrentPw(e.target.value), placeholder: "Enter current password" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm text-slate-200", children: "New Password" }), _jsx("input", { type: "password", autoComplete: "new-password", className: input, value: newPw, onChange: (e) => setNewPw(e.target.value), placeholder: "At least 6 characters" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm text-slate-200", children: "Confirm New Password" }), _jsx("input", { type: "password", autoComplete: "new-password", className: input, value: confirmPw, onChange: (e) => setConfirmPw(e.target.value), placeholder: "Re-enter new password" })] }), err && (_jsx("div", { className: "rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: err })), ok && (_jsx("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200", children: ok })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", disabled: !canSubmit, className: "rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50", children: busy ? "Updating…" : "Update Password" }), _jsx("button", { type: "button", onClick: () => navigate("/dashboard/profile"), className: "rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700", children: "Cancel" })] })] })] }));
}
