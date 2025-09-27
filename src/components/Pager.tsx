// src/components/Pager.tsx
import React from "react";

type Props = {
  page: number;               // 1-based
  total: number;              // total items (optional if you're doing cursor-only)
  pageSize: number;           // items per page
  onPageChange: (next: number) => void;
  compact?: boolean;
};

export default function Pager({ page, total, pageSize, onPageChange, compact }: Props) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / pageSize));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const btn =
    "rounded-lg px-3 py-1 text-sm border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10";
  const pill =
    "px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-slate-200";

  return (
    <div className={`mt-3 flex items-center gap-2 ${compact ? "" : "justify-end"}`}>
      <button className={btn} disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>
      <span className={pill}>
        Page <span className="tabular-nums">{page}</span>
        {pageCount ? (
          <>
            {" "}
            of <span className="tabular-nums">{pageCount}</span>
          </>
        ) : null}
      </span>
      <button className={btn} disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
