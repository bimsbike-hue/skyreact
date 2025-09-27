import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { adminStartPrint, adminCompletePrint, adminCancelPrint, adminMarkError, } from "@/lib/printJobs";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
export default function StartPrintToolbar({ jobId, onChanged }) {
    const [saving, setSaving] = useState(false);
    const [job, setJob] = useState(null);
    // Live subscribe so we can know current status (to hide/show Complete)
    useEffect(() => {
        const ref = doc(db, "printJobs", jobId);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const d = snap.data();
                setJob({
                    status: d.status,
                    quote: d.quote ?? {},
                    locked: d.locked ?? {},
                });
            }
            else {
                setJob(null);
            }
        });
        return () => unsub();
    }, [jobId]);
    async function handleStart() {
        try {
            setSaving(true);
            // You can replace "default-printer" with a real printer id if you have one
            await adminStartPrint(jobId, "default-printer");
            onChanged?.();
        }
        catch (e) {
            alert(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleComplete() {
        try {
            setSaving(true);
            // Ensure we have the latest data (in case subscription lagged)
            const snap = await getDoc(doc(db, "printJobs", jobId));
            const d = (snap.exists() ? snap.data() : {});
            const hours = Number(d?.locked?.hours ?? d?.quote?.hours ?? 0) || 0;
            const grams = Number(d?.locked?.grams ?? d?.quote?.grams ?? 0) || 0;
            await adminCompletePrint(jobId, { hours, grams });
            onChanged?.();
        }
        catch (e) {
            alert(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleCancel() {
        if (!confirm("Cancel this job?"))
            return;
        try {
            setSaving(true);
            await adminCancelPrint(jobId);
            onChanged?.();
        }
        catch (e) {
            alert(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    async function handleError() {
        const reason = prompt("Enter error/cancel reason (optional):") ?? "";
        try {
            setSaving(true);
            await adminMarkError(jobId, reason);
            onChanged?.();
        }
        catch (e) {
            alert(e?.message ?? String(e));
        }
        finally {
            setSaving(false);
        }
    }
    const isApproved = job?.status === "approved";
    const isProcessing = job?.status === "processing";
    return (_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { disabled: saving || !isApproved, onClick: handleStart, className: `rounded-lg px-4 py-2 text-white ${isApproved
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600/40 cursor-not-allowed"}`, children: "Start" }), isProcessing && (_jsx("button", { disabled: saving, onClick: handleComplete, className: "rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50", children: "Complete" })), _jsx("button", { disabled: saving, onClick: handleCancel, className: "rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50", children: "Cancel" }), _jsx("button", { disabled: saving, onClick: handleError, className: "rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50", children: "Mark Error" })] }));
}
