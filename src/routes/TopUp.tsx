// src/routes/TopUp.tsx
"use client";

import { useMemo, useState } from "react";
import { createTopUpRequest, formatIDR } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const HOUR_PACKS = [
  { label: "1 Hour", hours: 1, price: 25_000 },
  { label: "5 Hours", hours: 5, price: 120_000 },
  { label: "10 Hours", hours: 10, price: 200_000 },
];

const MATERIALS: Array<{ material: "PLA" | "TPU"; pricePerKg: number }> = [
  { material: "PLA", pricePerKg: 170_000 },
  { material: "TPU", pricePerKg: 240_000 },
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

  const lineCost = (ln: Line) => {
    const perKg = MATERIALS.find((m) => m.material === ln.material)?.pricePerKg ?? 0;
    const base = (perKg / 1000) * ln.grams;
    return Math.round(base * 1.2); // 20% margin
  };

  const itemsPrice = useMemo(
    () => lines.reduce((sum, ln) => sum + lineCost(ln), 0),
    [lines]
  );

  const total = hourPrice + itemsPrice;

  function addLine() {
    setLines((prev) => [...prev, { material: "PLA", grams: 100, color: "White" }]);
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

    navigate("/dashboard/payment");
  }

  const card =
    "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";
  const label = "text-sm text-slate-300";
  const select =
    "rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const btnSecondary =
    "px-3 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-white text-sm transition";
  const btnPrimary =
    "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition";

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Top-Up Wallet</h1>
        <p className="text-slate-400 text-sm">
          Buy print hours or add filament balance to your wallet.
        </p>
      </header>

      {/* Hours */}
      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <div className={label}>Hour Balance</div>
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
              className={`rounded-xl px-4 py-3 text-left ring-1 transition ${
                hourIdx === i
                  ? "ring-indigo-400/40 bg-indigo-600/20 text-indigo-100"
                  : "ring-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <div className="font-semibold">{p.label}</div>
              <div className="text-sm">{formatIDR(p.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filament lines */}
      <div className={`${card} space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Filament</h3>
          <button onClick={addLine} className={btnSecondary}>
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
                className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-3 items-center"
              >
                <select
                  className={select}
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
                  className={select}
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
                  className={select}
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

                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-300 min-w-[100px]">
                    {formatIDR(lineCost(ln))}
                  </div>
                  <button onClick={() => removeLine(i)} className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment summary */}
      <div className={`${card} space-y-4`}>
        <div className="grid gap-2 text-sm text-slate-200">
          <div className="flex justify-between">
            <span>Hours</span>
            <span className="tabular-nums">
              {hours} {hours === 1 ? "Hour" : "Hours"} {hours ? `— ${formatIDR(hourPrice)}` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Filament</span>
            <span className="tabular-nums">{formatIDR(itemsPrice)}</span>
          </div>
        </div>

        <input
          placeholder="Note (optional)"
          className="w-full rounded-lg bg-slate-900/60 text-white px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <div className="text-slate-300">Total</div>
          <div className="text-xl font-bold text-white">{formatIDR(total)}</div>
        </div>

        <button
          onClick={submit}
          disabled={total <= 0}
          className={`${btnPrimary} disabled:opacity-50`}
        >
          Submit Top-Up
        </button>

        <p className="text-xs text-slate-400">
          After submitting, you’ll see payment instructions. Your wallet will be
          credited once the admin verifies your transfer.
        </p>
      </div>
    </section>
  );
}
