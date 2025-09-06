import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/routes/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import Navbar from "../components/Navbar";
export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        }
        catch (err) {
            setError(err?.message || "Failed to log in");
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs("main", { className: "p-6 max-w-md mx-auto text-white", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Login" }), error && (_jsx("p", { className: "mb-3 rounded bg-red-500/20 px-3 py-2 text-sm text-red-400", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 rounded bg-gray-800 text-white", required: true }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 rounded bg-gray-800 text-white", required: true }), _jsx("button", { type: "submit", className: "w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition", children: "Sign In" })] }), _jsxs("p", { className: "mt-4 text-gray-400", children: ["Don\u2019t have an account?", " ", _jsx(Link, { to: "/signup", className: "text-indigo-400 hover:underline", children: "Sign Up" })] })] })] }));
}
