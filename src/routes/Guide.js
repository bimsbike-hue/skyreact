import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import TopNav from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
export default function Guide() {
    return (_jsxs(_Fragment, { children: [_jsx(TopNav, {}), _jsxs("section", { className: "relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" }), _jsx("div", { className: "absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" })] }), _jsxs("main", { className: "relative z-10 mx-auto w-full max-w-5xl px-6 py-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "text-center", children: [_jsxs("h1", { className: "text-4xl md:text-5xl font-extrabold text-white", children: ["How to Print with ", _jsx("span", { className: "text-indigo-400", children: "Sky3D" })] }), _jsx("p", { className: "mt-3 text-slate-300", children: "Follow these simple steps to submit and track your 3D print." })] }), _jsx("div", { className: "mt-10 grid md:grid-cols-2 gap-6", children: [
                                    {
                                        title: "1. Create an Account / Login",
                                        body: "Sign up or log in to your Sky3D dashboard. Keep your profile updated for delivery.",
                                    },
                                    {
                                        title: "2. Prepare Your Model",
                                        body: "We accept STL/3MF. Keep size reasonable, walls ≥ 0.8mm, and ensure model is manifold.",
                                    },
                                    {
                                        title: "3. Start a New Job",
                                        body: "Go to Dashboard → New Job. Upload your file, choose material and color, add notes (strength, finish).",
                                    },
                                    {
                                        title: "4. Get a Quote",
                                        body: "We’ll estimate hours and filament. You’ll see it under “My Print Status → Quoted”.",
                                    },
                                    {
                                        title: "5. Approve & Queue",
                                        body: "Approve the quote to reserve hours/filament. Your job moves to Processing.",
                                    },
                                    {
                                        title: "6. Track Progress",
                                        body: "Check “My Print Status”. You’ll see current status and any admin notes.",
                                    },
                                ].map((s, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * i + 0.2 }, className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: s.title }), _jsx("p", { className: "text-slate-300 mt-2", children: s.body })] }, s.title))) }), _jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.8 }, className: "mt-10 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-6", children: [_jsx("h3", { className: "text-white font-semibold text-xl", children: "Pro Tips" }), _jsxs("ul", { className: "mt-3 list-disc pl-5 text-slate-200 space-y-1", children: [_jsx("li", { children: "Prefer fillets over sharp corners for stronger parts." }), _jsx("li", { children: "Keep overhangs \u2264 60\u00B0 or expect supports." }), _jsx("li", { children: "Use simple text/embossing \u2265 1mm height for readability." }), _jsx("li", { children: "Double-check dimensions and orientation before upload." })] })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1.0 }, className: "mt-10 flex flex-wrap items-center justify-center gap-4", children: [_jsx(Link, { to: "/dashboard/new-print", className: "px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105", children: "Start New Print" }), _jsx(Link, { to: "/specs", className: "px-6 py-3 border border-white/30 hover:border-white text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105", children: "View Printer & Filament Specs" })] })] })] })] }));
}
