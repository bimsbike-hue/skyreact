import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/Profile.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        displayName: "",
        address: "",
        phone: "",
        email: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        if (!user)
            return;
        const ref = doc(db, "users", user.uid);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setForm({
                    displayName: data.displayName ?? user.displayName ?? "",
                    address: data.address ?? "",
                    phone: data.phone ?? "",
                    email: data.email ?? user.email ?? "",
                });
            }
            else {
                setDoc(ref, {
                    email: user.email ?? "",
                    displayName: user.displayName ?? "",
                    createdAt: serverTimestamp(),
                }, { merge: true }).catch(() => { });
                setForm({
                    displayName: user.displayName ?? "",
                    address: "",
                    phone: "",
                    email: user.email ?? "",
                });
            }
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps
    function setField(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }
    async function save(e) {
        e.preventDefault();
        if (!user)
            return;
        setErr(null);
        setOk(false);
        if (!form.displayName?.trim()) {
            setErr("Name is required.");
            return;
        }
        if (!form.address?.trim()) {
            setErr("Address is required.");
            return;
        }
        if (!form.phone?.trim()) {
            setErr("WhatsApp/Phone number is required.");
            return;
        }
        setSaving(true);
        try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, {
                displayName: form.displayName.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
                updatedAt: serverTimestamp(),
            });
            await updateProfile(user, { displayName: form.displayName.trim() });
            setOk(true);
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    const label = "text-sm text-slate-200";
    const input = "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    const card = "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";
    if (!user) {
        return (_jsx("main", { className: "p-6 text-white", children: "Please sign in to view your profile." }));
    }
    return (_jsx("main", { className: "space-y-6", children: _jsxs("div", { className: "max-w-3xl mx-auto w-full space-y-4", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-2xl font-semibold text-white", children: "Profile" }), _jsx("p", { className: "text-slate-400", children: "Update your personal information and delivery details here." })] }), _jsxs("form", { onSubmit: save, className: `${card} space-y-4`, children: [_jsxs("div", { children: [_jsx("label", { className: label, children: "Email" }), _jsx("input", { className: `${input} opacity-60`, value: form.email ?? "", disabled: true })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Name" }), _jsx("input", { className: input, placeholder: "Your full name", value: form.displayName ?? "", onChange: (e) => setField("displayName", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Address" }), _jsx("textarea", { rows: 3, className: input, placeholder: "Street, city, province, postal code", value: form.address ?? "", onChange: (e) => setField("address", e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "No HP (WhatsApp preferred)" }), _jsx("input", { className: input, placeholder: "+62 812-xxx-xxxx", value: form.phone ?? "", onChange: (e) => setField("phone", e.target.value) })] }), err && (_jsx("div", { className: "rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200", children: err })), ok && (_jsx("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200", children: "Profile saved." })), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("button", { type: "submit", disabled: saving || loading, className: "rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50", children: saving ? "Saving…" : "Save Changes" }), _jsx("button", { type: "button", onClick: () => navigate("/dashboard/change-password"), className: "rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600", children: "Change Password" })] })] })] }) }));
}
