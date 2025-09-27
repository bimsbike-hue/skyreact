import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/CreateJobPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import CreateJobForm from "@/components/CreateJobForm";
export default function CreateJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // Live-load user profile for delivery info
    useEffect(() => {
        if (!user)
            return;
        const ref = doc(db, "users", user.uid);
        const unsub = onSnapshot(ref, async (snap) => {
            if (!snap.exists()) {
                // Seed a minimal doc for older accounts
                await setDoc(ref, {
                    email: user.email ?? "",
                    displayName: user.displayName ?? "",
                    createdAt: serverTimestamp(),
                }, { merge: true });
                setProfile({
                    email: user.email ?? "",
                    displayName: user.displayName ?? "",
                    address: "",
                    phone: "",
                });
            }
            else {
                const data = snap.data();
                setProfile({
                    displayName: data.displayName ?? user.displayName ?? "",
                    address: data.address ?? "",
                    phone: data.phone ?? "",
                    email: data.email ?? user.email ?? "",
                });
            }
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [user?.uid]);
    function isIncomplete(p) {
        if (!p)
            return true;
        return !p.displayName?.trim() || !p.address?.trim() || !p.phone?.trim();
    }
    if (!user) {
        return (_jsx("div", { className: "max-w-3xl mx-auto p-4 text-white", children: "Please sign in to create a print job." }));
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-4 space-y-4", children: [_jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-white font-semibold", children: "Delivery Details" }), _jsx("p", { className: "text-sm text-slate-400", children: "We\u2019ll use this info for delivery and contacting you." })] }), _jsx(Link, { to: "/dashboard/profile", className: "rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700", children: "Edit Profile" })] }), loading ? (_jsx("div", { className: "mt-3 text-sm text-slate-400", children: "Loading\u2026" })) : (_jsxs("div", { className: "mt-3 grid sm:grid-cols-2 gap-3 text-sm", children: [_jsx(Field, { label: "Name", value: profile?.displayName }), _jsx(Field, { label: "WhatsApp / Phone", value: profile?.phone }), _jsx("div", { className: "sm:col-span-2", children: _jsx(Field, { label: "Address", value: profile?.address, multiline: true }) })] })), !loading && isIncomplete(profile) && (_jsxs("div", { className: "mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200", children: ["Your profile looks incomplete. Please fill in", " ", _jsx("strong", { children: "Name" }), ", ", _jsx("strong", { children: "Address" }), ", and", " ", _jsx("strong", { children: "WhatsApp/Phone" }), " before scheduling delivery."] }))] }), _jsx(CreateJobForm, { onCreated: (jobId) => {
                    // Success message + send user to status page
                    alert("Your job has been submitted. Please wait for the admin to give a quote in the 'quoted' tab.");
                    navigate("/dashboard/start-print");
                } })] }));
}
function Field({ label, value, multiline, }) {
    const empty = !value || !value.trim();
    return (_jsxs("div", { className: "rounded-lg border border-white/10 bg-slate-900/50 p-3", children: [_jsx("div", { className: "text-[11px] uppercase tracking-wide text-slate-400", children: label }), _jsx("div", { className: `mt-1 text-slate-100 ${multiline ? "whitespace-pre-wrap break-words" : "truncate"}`, children: empty ? _jsx("span", { className: "text-slate-500", children: "\u2014 not set \u2014" }) : value })] }));
}
