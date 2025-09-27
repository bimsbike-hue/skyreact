import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
export default function Payment() {
    const navigate = useNavigate();
    const card = "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";
    function goToHistory() {
        navigate("/dashboard/purchase-history");
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Payment" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Please transfer the total to the bank account below. Your top-up will be applied automatically once verified." })] }), _jsxs("div", { className: `${card} space-y-4`, children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Bank Transfer" }), _jsxs("div", { className: "rounded-xl ring-1 ring-white/10 bg-black/30 px-4 py-3 space-y-1 text-slate-200", children: [_jsxs("p", { children: ["BCA : ", _jsx("span", { className: "font-bold", children: "5271041536" })] }), _jsxs("p", { children: ["A/N : ", _jsx("span", { className: "font-bold", children: "Bima Pratama Putra" })] })] }), _jsx("button", { onClick: goToHistory, className: "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm", children: "View my purchase history" })] })] }));
}
