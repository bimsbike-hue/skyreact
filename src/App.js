// src/App.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthProvider";
export default function App() {
    const { user } = useAuth();
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-5xl mx-auto p-6 text-white", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Sky3D" }), _jsx("p", { className: "mt-2 text-slate-300", children: "Welcome to Sky3D. Use the dashboard to top-up and manage your prints." }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx(Link, { to: "/dashboard", className: "px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700", children: "Go to Dashboard" }), !user && (_jsx(Link, { to: "/login", className: "px-4 py-2 rounded bg-slate-700 hover:bg-slate-600", children: "Login" }))] })] })] }));
}
