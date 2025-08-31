import type { ReactNode } from "react";

export default function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 p-6 shadow-lg">
      {children}
    </div>
  );
}
