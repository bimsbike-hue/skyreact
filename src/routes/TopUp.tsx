// src/routes/TopUp.tsx
"use client";

import { useMemo, useState } from "react";
import { createTopUpRequest, formatIDR } from "../lib/wallet";
import { useAuth } from "../contexts/AuthProvider";

const HOUR_PACKS = [
  { label: "None", hours: 0, price: 0 },
  { label: "1 Hour", hours: 1, price: 25000 },
  { label: "5 Hours", hours: 5, price: 120000 },
  { label: "10 Hours", hours: 10, price: 200000 },
];

const MATERIALS = [
  { material: "PLA" as const, pricePerKg: 170000 },
  { material: "TPU" as const, pricePerKg: 240000 },
];

const COLORS = ["White", "Black", "Gray"] as const;
const GRAMS = [100, 500, 1000] as const;

type FilamentItem = {
  material: "PLA" | "TPU";
  color: "White" | "Black" | "Gray";
  grams: number;
};

export default function TopUpPage() {
  const { user } = useAuth();

  const [hourIdx, setHourIdx] = useState(0);
  const [items, setItems] = useState<FilamentItem[]>([]);
  const [note, setNote] = useState("");

  const hourPack = HOUR_PACKS[hourIdx];

  const filamentTotal = useMemo(() => {
    const baseFor = (m: "PLA" | "TPU") =>
      m === "PLA" ? MATERIALS[0].pricePerKg : MATERIALS[1].pricePerKg;
    const sum = items.reduce((acc, it) => {
      const base = (baseFor(it.material) / 1000) * it.grams;
      return acc + base;
    }, 0);
    return Math.round(sum * 1.2); // 20% margin
  }, [items]);

  const total = hourPack.price + filamentTotal;

  function addItem() {
    setItems((arr) => [
      ...arr,
      { material: "PLA", color: "White", grams: 100 },
    ]);
  }
  function updateItem(i: number, patch: Partial<FilamentItem>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeItem(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!user) return alert("Please sign in first.");

    await createTopUpRequest(user.uid, {
      userEmail: user.email,
      userName: user.displayName,
      hours: hourPack.hours,
      items,                // <— multiple filaments in *one* request
      amountIDR: total,
      note,
    });

    alert("Submitted! Continue payment on the Payment page. Admin will approve after verifying.");
    setItems([]);
    setHourIdx(0);
    setNote("");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Top-Up Wallet</h1>

      {/* Hours */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
        <div className="text-slate-300 mb-2">Hour Balance</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

      {/* Filaments */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-slate-300">Filaments</div>
          <button
            onClick={addItem}
            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm"
          >
            + Add another filament
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-slate-500">No filaments selected.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={it.material}
                  onChange={(e) => updateItem(i, { material: e.target.value as any })}
                >
                  {MATERIALS.map((m) => (
                    <option key={m.material} value={m.material}>
                      {m.material}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={it.grams}
                  onChange={(e) => updateItem(i, { grams: Number(e.target.value) })}
                >
                  {GRAMS.map((g) => (
                    <option key={g} value={g}>
                      {g} g
                    </option>
                  ))}
                </select>

                <select
                  className="rounded bg-slate-800 text-white p-2 border border-slate-700"
                  value={it.color}
                  onChange={(e) => updateItem(i, { color: e.target.value as any })}
                >
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeItem(i)}
                  className="rounded bg-rose-700 hover:bg-rose-600 text-white text-sm px-3"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note + Total + Submit */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-3">
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
          Submit & Continue to Payment
        </button>
      </div>
    </section>
  );
}
