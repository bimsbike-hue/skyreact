// src/routes/TopUp.tsx
"use client";

import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { createTopUpRequest, formatIDR } from "../lib/wallet";

/** ----- Pricing presets ----- */
const HOUR_PACKS = [
  { label: "1 Hour", hours: 1, price: 25_000 },
  { label: "5 Hours", hours: 5, price: 120_000 },
  { label: "10 Hours", hours: 10, price: 200_000 },
] as const;

const FILAMENT_MATERIALS = [
  { key: "PLA" as const, label: "PLA", pricePerKg: 170_000 },
  { key: "TPU" as const, label: "TPU", pricePerKg: 240_000 },
] as const;

const FILAMENT_GRAMS = [100, 200, 500, 1000] as const;
const FILAMENT_COLORS = ["White", "Black", "Gray"] as const;

/** ----- Page ----- */
export default function TopUpPage() {
  const { user } = useAuth();

  // Hours selection
  const [hourIndex, setHourIndex] = useState<number>(0); // default to 1 hour

  // Filament selection
  const [addFilament, setAddFilament] = useState(false);
  const [matIndex, setMatIndex] = useState<number>(0);
  const [gramIndex, setGramIndex] = useState<number>(0);
  const [colorIndex, setColorIndex] = useState<number>(0);

  // Misc
  const [note, setNote] = useState("");

  const hourPrice = HOUR_PACKS[hourIndex].price;

  // Filament pricing (include 20% margin)
  const filamentPrice = useMemo(() => {
    if (!addFilament) return 0;
    const material = FILAMENT_MATERIALS[matIndex];
    const grams = FILAMENT_GRAMS[gramIndex];
    const base = (material.pricePerKg / 1000) * grams; // price per gram * grams
    return Math.round(base * 1.2); // +20% margin
  }, [addFilament, matIndex, gramIndex]);

  const total = hourPrice + filamentPrice;

  async function submit() {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    const filament = addFilament
      ? {
          material: FILAMENT_MATERIALS[matIndex].key,
          grams: FILAMENT_GRAMS[gramIndex],
          color: FILAMENT_COLORS[colorIndex],
        }
      : undefined;

    await createTopUpRequest(user.uid, {
      userEmail: user.email ?? "",
      userName: user.displayName ?? "",
      hours: HOUR_PACKS[hourIndex].hours,
      filament,
      amountIDR: total,
      note,
    });

    alert(
      "Top-up submitted.\nPlease transfer the amount and wait for admin approval."
    );
    setNote("");
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Top-Up Wallet</h1>

      {/* Hours */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5">
        <div className="text-slate-300 mb-3">Hour Balance</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HOUR_PACKS.map((p, idx) => {
            const active = hourIndex === idx;
            return (
              <button
                key={p.label}
                onClick={() => setHourIndex(idx)}
                className={`rounded-xl px-4 py-4 text-left transition border ${
                  active
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                    : "bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                }`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className="text-sm">{formatIDR(p.price)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Filament */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 space-y-4">
        <label className="inline-flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            className="accent-indigo-500"
            checked={addFilament}
            onChange={(e) => setAddFilament(e.target.checked)}
          />
          Add Filament
        </label>

        {addFilament && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={matIndex}
              onChange={(e) => setMatIndex(Number(e.target.value))}
              className="rounded-lg bg-slate-800 text-white p-2 border border-slate-700"
            >
              {FILAMENT_MATERIALS.map((m, i) => (
                <option key={m.key} value={i}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={gramIndex}
              onChange={(e) => setGramIndex(Number(e.target.value))}
              className="rounded-lg bg-slate-800 text-white p-2 border border-slate-700"
            >
              {FILAMENT_GRAMS.map((g, i) => (
                <option key={g} value={i}>
                  {g} g
                </option>
              ))}
            </select>

            <select
              value={colorIndex}
              onChange={(e) => setColorIndex(Number(e.target.value))}
              className="rounded-lg bg-slate-800 text-white p-2 border border-slate-700"
            >
              {FILAMENT_COLORS.map((c, i) => (
                <option key={c} value={i}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Payment & Submit */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 space-y-4">
        <div className="text-slate-300">Bank Transfer</div>
        <div className="text-slate-200">
          BCA : <b>5271041536</b> — A/N <b>Bima Pratama Putra</b>
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full rounded-lg bg-slate-800 text-white p-3 border border-slate-700"
        />

        <div className="flex items-center justify-between">
          <div className="text-slate-300">
            Total{" "}
            <span className="text-slate-400 text-sm">
              (hours {formatIDR(hourPrice)}
              {addFilament ? ` + filament ${formatIDR(filamentPrice)}` : ""})
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{formatIDR(total)}</div>
        </div>

        <button
          onClick={submit}
          disabled={!user || total <= 0}
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          Submit &amp; Pay Manually
        </button>
      </div>
    </section>
  );
}
