// src/routes/TopUp.tsx
"use client";

import { useMemo, useState } from "react";
import { createTopUpRequest, formatIDR } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const HOUR_PACKS = [
  { label: "1 Hour", hours: 1, price: 25000 },
  { label: "5 Hours", hours: 5, price: 120000 },
  { label: "10 Hours", hours: 10, price: 200000 },
];

const MATERIALS: Array<{ material: "PLA" | "TPU"; pricePerKg: number }> = [
  { material: "PLA", pricePerKg: 170000 },
  { material: "TPU", pricePerKg: 240000 },
];
const GRAMS = [100, 500, 1000] as const;
const COLORS = ["White", "Black", "Gray"] as const;

type Line = {
  material: "PLA" | "TPU";
  grams: typeof GRAMS[number];
  color: typeof COLORS[number];
};

export default function TopUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hours selection — -1 means "none selected"
  const [hourIdx, setHourIdx] = useState<number>(-1);

  // Filament lines
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState("");

  const hourPrice = hourIdx >= 0 ? HOUR_PACKS[hourIdx].price : 0;
  const hours = hourIdx >= 0 ? HOUR_PACKS[hourIdx].hours : 0;

  const itemsPrice = useMemo(() => {
    return lines.reduce((sum, ln) => {
      const perKg =
        MATERIALS.find((m) => m.material === ln.material)?.pricePerKg ?? 0;
      const base = (perKg / 1000) * ln.grams;
      return sum + Math.round(base * 1.2); // 20% margin
    }, 0);
  }, [lines]);

  const total = hourPrice + itemsPrice;

  function addLine() {
    setLines((prev) => [
      ...prev,
      { material: "PLA", grams: 100, color: "White" },
    ]);
  }
  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((ln, idx) => (idx === i ? { ...ln, ...patch } : ln)));
  }

  async function submit() {
    if (!user) return;
    if (hours === 0 && lines.length === 0) {
      alert("Please select hours or add at least one filament.");
      return;
    }

    await createTopUpRequest(user.uid, {
      userEmail: user.email,
      userName: user.displayName ?? undefined,
      hours,
      items: lines,
      amountIDR: total,
      note,
    });

    // Go to payment instructions
    navigate("/dashboard/payment");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Top-Up Wallet</h1>

      {/* Hours */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
        <div className="text-slate-300 mb-2 flex items-center justify-between">
          <span>Hour Balance</span>
          <button
            onClick={() => setHourIdx(-1)}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Clear hours
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOUR_PACKS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setHourIdx(i)}
              className={`rounded-lg border px-4 py-3 text-left ${
                hourIdx === i
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-200"
                  : "border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800"
              }`}
            >
              <div className="font-semibold">{p.label}</div>
              <div className="text-sm">{formatIDR(p.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filament lines */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-300">Add Filament</h3>
          <button
            onClick={addLine}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm"
          >
            + Add Filament
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-slate-400 text-sm">No filaments added.</p>
        ) : (
          <div className="space-y-3">
            {lines.map((ln, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
              >
                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={ln.material}
                  onChange={(e) =>
                    updateLine(i, { material: e.target.value as Line["material"] })
                  }
                >
                  {MATERIALS.map((m) => (
                    <option key={m.material} value={m.material}>
                      {m.material}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={ln.grams}
                  onChange={(e) =>
                    updateLine(i, { grams: Number(e.target.value) as Line["grams"] })
                  }
                >
                  {GRAMS.map((g) => (
                    <option key={g} value={g}>
                      {g} g
                    </option>
                  ))}
                </select>

                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={ln.color}
                  onChange={(e) =>
                    updateLine(i, { color: e.target.value as Line["color"] })
                  }
                >
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeLine(i)}
                  className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment summary */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-3">
        <div className="text-slate-200">
        </div>
        <input
          placeholder="Note (optional)"
          className="w-full rounded bg-slate-800 text-white p-2 border border-slate-700"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="text-slate-300">Total:</div>
          <div className="text-xl font-bold text-white">{formatIDR(total)}</div>
        </div>
        <button
          onClick={submit}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Submit
        </button>
      </div>
    </section>
  );
}
