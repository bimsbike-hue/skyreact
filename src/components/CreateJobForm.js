import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/CreateJobForm.tsx
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { uploadModelToSupabase } from "@/lib/upload";
import { createPrintJob } from "@/lib/createJob";
const allowed = ".stl,.3mf,.obj,.step,.stp";
export default function CreateJobForm({ onCreated }) {
    const { user } = useAuth();
    // required
    const [file, setFile] = useState(null);
    const [quantity, setQuantity] = useState(1);
    // filament
    const [filamentType, setFilamentType] = useState("PLA");
    const [color, setColor] = useState("Black");
    // print settings
    const [preset, setPreset] = useState("default");
    const [infillPercent, setInfillPercent] = useState("15");
    const [wallLoops, setWallLoops] = useState("2");
    const [layerHeightMm, setLayerHeightMm] = useState("0.2");
    // misc
    const [notes, setNotes] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const fileInput = useRef(null);
    function toNum(v) {
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!user)
            return setError("Please sign in.");
        if (!file)
            return setError("Please choose a 3D model file.");
        if (quantity < 1)
            return setError("Quantity must be at least 1.");
        // validate custom numbers if chosen
        if (preset === "custom") {
            const inf = toNum(infillPercent);
            const wl = toNum(wallLoops);
            if (isNaN(inf) || inf < 0 || inf > 100) {
                setError("Infill % must be a number between 0 and 100.");
                return;
            }
            if (isNaN(wl) || wl < 0 || wl > 100) {
                setError("Wall Loops must be between 0 and 100.");
                return;
            }
        }
        setBusy(true);
        setError(null);
        try {
            const up = await uploadModelToSupabase(file, user.uid);
            const jobId = await createPrintJob({
                userId: user.uid,
                model: up,
                quantity,
                settings: preset === "default"
                    ? { preset: "default", filamentType, color }
                    : {
                        preset: "custom",
                        filamentType,
                        color,
                        infillPercent: toNum(infillPercent),
                        wallLoops: toNum(wallLoops),
                        layerHeightMm: toNum(layerHeightMm),
                    },
                notes: notes || undefined,
            });
            // reset form
            setQuantity(1);
            setPreset("default");
            setNotes("");
            setColor("Black");
            setFilamentType("PLA");
            setInfillPercent("15");
            setWallLoops("2");
            setLayerHeightMm("0.2");
            setFile(null);
            if (fileInput.current)
                fileInput.current.value = "";
            onCreated?.(jobId);
        }
        catch (err) {
            setError(err?.message ?? String(err));
        }
        finally {
            setBusy(false);
        }
    }
    const label = "text-sm text-slate-200";
    const input = "w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 rounded-2xl bg-white/5 border border-white/10 p-4", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: "Create Print Job" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "3D Model File" }), _jsx("input", { ref: fileInput, type: "file", accept: allowed, onChange: (e) => setFile(e.target.files?.[0] ?? null), className: "block w-full rounded border border-white/20 bg-white/5 p-2 file:mr-3 file:rounded file:border-0 file:bg-black file:text-white" }), _jsxs("span", { className: "text-xs text-white/60", children: ["Allowed: ", allowed.split(",").join(", ")] })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Quantity" }), _jsx("input", { type: "number", min: 1, value: quantity, onChange: (e) => setQuantity(parseInt(e.target.value || "1")), className: input })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Filament Type" }), _jsxs("select", { value: filamentType, onChange: (e) => setFilamentType(e.target.value), className: input, children: [_jsx("option", { value: "PLA", children: "PLA" }), _jsx("option", { value: "TPU", children: "TPU" })] })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Filament Color" }), _jsxs("select", { value: color, onChange: (e) => setColor(e.target.value), className: input, children: [_jsx("option", { value: "Black", children: "Black" }), _jsx("option", { value: "Grey", children: "Grey" }), _jsx("option", { value: "White", children: "White" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: label, children: "Print Settings" }), _jsxs("div", { className: "flex items-center gap-6 text-sm text-slate-200", children: [_jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: preset === "default", onChange: () => setPreset("default") }), "Default"] }), _jsxs("label", { className: "inline-flex items-center gap-2", children: [_jsx("input", { type: "radio", checked: preset === "custom", onChange: () => setPreset("custom") }), "Custom"] })] }), preset === "custom" && (_jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Infill %" }), _jsx("input", { className: input, inputMode: "numeric", placeholder: "e.g. 15", value: infillPercent, onChange: (e) => setInfillPercent(e.target.value) })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Wall Loops" }), _jsx("input", { className: input, inputMode: "numeric", placeholder: "e.g. 2", value: wallLoops, onChange: (e) => setWallLoops(e.target.value) })] }), _jsx("label", { className: "flex flex-col gap-2" })] })), _jsx("p", { className: "text-xs text-slate-400", children: "For other settings please put them in the notes below." })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: label, children: "Notes (optional)" }), _jsx("textarea", { rows: 3, className: input, placeholder: "Any special instructions?", value: notes, onChange: (e) => setNotes(e.target.value) })] }), error && (_jsx("div", { className: "rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200", children: error })), _jsx("button", { disabled: busy, className: "px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50", children: busy ? "Submitting..." : "Submit Job" })] }));
}
