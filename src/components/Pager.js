import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export default function Pager({ page, total, pageSize, onPageChange, compact }) {
    const pageCount = Math.max(1, Math.ceil((total || 0) / pageSize));
    const canPrev = page > 1;
    const canNext = page < pageCount;
    const btn = "rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10";
    const pill = "px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-slate-200";
    return (_jsxs("div", { className: `mt-3 flex items-center gap-2 ${compact ? "" : "justify-end"}`, children: [_jsx("button", { className: btn, disabled: !canPrev, onClick: () => onPageChange(page - 1), children: "Prev" }), _jsxs("span", { className: pill, children: ["Page ", _jsx("span", { className: "tabular-nums", children: page }), pageCount ? (_jsxs(_Fragment, { children: [" ", "of ", _jsx("span", { className: "tabular-nums", children: pageCount })] })) : null] }), _jsx("button", { className: btn, disabled: !canNext, onClick: () => onPageChange(page + 1), children: "Next" })] }));
}
