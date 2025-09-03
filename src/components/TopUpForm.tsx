"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { createTopUpRequest } from "../lib/wallet";
import { PRICE_IDR, calcTopupTotalIDR } from "../lib/pricing";

export default function TopUpForm() {
  const { user } = useAuth();
  const [hours, setHours] = useState(0);
  const [grams, setGrams] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const total = useMemo(() => calcTopupTotalIDR(hours, grams), [hours, grams]);

  async function submit() {
    if (!user) { alert("Please sign in"); return; }
    if (hours <= 0 && grams <= 0) { alert("Choose at least one quantity"); return; }

    setBusy(true);
    try {
      const id = await createTopUpRequest(user.uid, { hours, grams, amountIDR: total, note });
      alert(`Top-up submitted.\nID: ${id}\nPlease pay manually and include this ID; admin will approve.`);
      setHours(0); setGrams(0); setNote("");
    } catch (e:any) {
      alert(e.message || "Failed to submit top-up");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <h3 className="text-lg font-semibold">Top-Up Wallet</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label={`Hours (Rp ${PRICE_IDR.hour.toLocaleString("id-ID")}/hr)`}>
          <input
            type="number" min={0} step="0.5" value={hours}
            onChange={(e)=>setHours(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" />
        </Field>

        <Field label={`Filament (Rp ${PRICE_IDR.filamentPerGram.toLocaleString("id-ID")}/g)`}>
          <input
            type="number" min={0} step="10" value={grams}
            onChange={(e)=>setGrams(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" />
        </Field>

        <Field label="Note (optional)">
          <input
            value={note} onChange={(e)=>setNote(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none" />
        </Field>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-300">
          Total:&nbsp;<span className="text-xl font-bold">Rp {total.toLocaleString("id-ID")}</span>
        </div>
        <button
          onClick={submit}
          disabled={busy || !user}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Checkout (Manual Payment)"}
        </button>
      </div>
    </div>
  );
}

function Field({label, children}:{label:string; children:React.ReactNode}) {
  return (
    <label className="block space-y-1">
      <div className="text-sm text-gray-300">{label}</div>
      {children}
    </label>
  );
}
