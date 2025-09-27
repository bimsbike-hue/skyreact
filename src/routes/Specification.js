import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Navbar from "@/components/Navbar";
const printerSpecs = [
    { label: "Printer Models", value: "Bambu Lab A1" },
    { label: "Build Volume", value: "256 × 256 × 256 mm (Bambu A1)" },
    { label: "Nozzle Diameter", value: "0.4 mm (standard)" },
    { label: "Layer Height", value: "0.1 – 0.28 mm (default 0.2 mm)" },
    { label: "Infill Density", value: "5% – 100% (default 15–20%)" },
    { label: "Perimeters / Walls", value: "2 – 5 (default 3 walls)" },
    {
        label: "Max Print Speed",
        value: "Bambu Lab A1: up to 500 mm/s • Others: 150–200 mm/s",
    },
    { label: "Supported Materials", value: "PLA and TPU (shore 95A)" },
    {
        label: "Color Options",
        value: "PLA: White / Black / Gray • TPU: White / Gray / Black",
    },
    {
        label: "Tolerances",
        value: "±0.2–0.4 mm depending on size & geometry",
    },
];
const filamentSpecs = [
    { label: "Brand", value: "SUNLU Professional Filament (PLA+, TPU)" },
    {
        label: "PLA (Polylactic Acid)",
        value: "High toughness, low warp, consistent diameter ±0.02 mm",
    },
    {
        label: "TPU (Flexible)",
        value: "Rubber-like, impact resistant; shore hardness 95A",
    },
    {
        label: "Recommended Nozzle Temp",
        value: "PLA+ 200–215 °C • TPU 215–230 °C",
    },
    {
        label: "Bed Temp",
        value: "PLA+ 50–60 °C • TPU 40–60 °C (glue stick recommended)",
    },
    { label: "Filament Diameter", value: "1.75 mm" },
    { label: "Spool Weight", value: "1 kg per roll (net)" },
    {
        label: "Use Cases",
        value: "PLA+: prototypes, functional parts • TPU: gaskets, phone cases, dampers",
    },
];
function SpecTable({ title, rows }) {
    return (_jsxs("section", { className: "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: title }), _jsx("dl", { className: "divide-y divide-white/10", children: rows.map((r, idx) => (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 py-3", children: [_jsx("dt", { className: "text-slate-300", children: r.label }), _jsx("dd", { className: "sm:col-span-2 text-slate-100", children: r.value })] }, idx))) })] }));
}
export default function Specification() {
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("section", { className: "relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden", children: [_jsxs("div", { className: "pointer-events-none absolute inset-0", children: [_jsx("div", { className: "absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" }), _jsx("div", { className: "absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" })] }), _jsxs("main", { className: "relative z-10 mx-auto w-full max-w-screen-2xl px-6 md:px-8 py-10 space-y-6", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-white", children: "Specifications" }), _jsxs("p", { className: "text-slate-300 mt-2", children: ["At Sky3D, we use professional-grade printers like the", " ", _jsx("span", { className: "font-semibold text-indigo-300", children: "Bambu Lab A1" }), " ", "and high-quality ", _jsx("span", { className: "font-semibold text-indigo-300", children: "SUNLU" }), " ", "filaments to ensure smooth, accurate, and durable prints."] })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsx(SpecTable, { title: "Printer Specifications", rows: printerSpecs }), _jsx(SpecTable, { title: "Filament Specifications (SUNLU)", rows: filamentSpecs })] }), _jsxs("div", { className: "rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5", children: [_jsx("h3", { className: "text-white font-semibold mb-2", children: "Tips for Best Results" }), _jsxs("ul", { className: "list-disc pl-5 text-slate-200 space-y-1", children: [_jsxs("li", { children: ["Prefer ", _jsx("span", { className: "font-medium", children: "STL" }), " or", " ", _jsx("span", { className: "font-medium", children: "3MF" }), " files with watertight geometry."] }), _jsx("li", { children: "Indicate preferred strength by specifying infill % or wall loops in the job notes." }), _jsx("li", { children: "For TPU, avoid sharp internal corners \u2014 add small fillets to improve strength." }), _jsx("li", { children: "Provide critical dimensions if tolerances are important; we\u2019ll double-check before shipping." })] })] })] })] })] }));
}
