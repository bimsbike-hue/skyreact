// src/components/CreateJobForm.tsx
import React, { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { uploadModelToSupabase } from "@/lib/upload";
import { createPrintJob } from "@/lib/createJob";

type Props = { onCreated?: (jobId: string) => void };

const allowed = ".stl,.3mf,.obj,.step,.stp";

export default function CreateJobForm({ onCreated }: Props) {
  const { user } = useAuth();

  // required
  const [file, setFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // filament
  const [filamentType, setFilamentType] = useState<"PLA" | "TPU">("PLA");
  const [color, setColor] = useState<"Black" | "Grey" | "White">("Black");

  // print settings
  const [preset, setPreset] = useState<"default" | "custom">("default");
  const [infillPercent, setInfillPercent] = useState<string>("15");
  const [wallLoops, setWallLoops] = useState<string>("2");
  const [layerHeightMm, setLayerHeightMm] = useState<string>("0.2");

  // misc
  const [notes, setNotes] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  function toNum(v: string) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setError("Please sign in.");
    if (!file) return setError("Please choose a 3D model file.");
    if (quantity < 1) return setError("Quantity must be at least 1.");

    // validate custom numbers if chosen
    if (preset === "custom") {
      const inf = toNum(infillPercent);
      const wl = toNum(wallLoops);
      if (isNaN(inf) || inf < 0 || inf > 100) {
        setError("Infill % must be a number between 0 and 100.");
        return;
      }
      if (isNaN(wl) || wl < 0 || wl > 100) {
        setError("Wall Loops must be between 0 and 100.");
        return;
      }
    }

    setBusy(true);
    setError(null);

    try {
      const up = await uploadModelToSupabase(file, user.uid);
      const jobId = await createPrintJob({
        userId: user.uid,
        model: up,
        quantity,
        settings:
          preset === "default"
            ? { preset: "default", filamentType, color }
            : {
                preset: "custom",
                filamentType,
                color,
                infillPercent: toNum(infillPercent),
                wallLoops: toNum(wallLoops),
                layerHeightMm: toNum(layerHeightMm),
              },
        notes: notes || undefined,
      });

      // reset form
      setQuantity(1);
      setPreset("default");
      setNotes("");
      setColor("Black");
      setFilamentType("PLA");
      setInfillPercent("15");
      setWallLoops("2");
      setLayerHeightMm("0.2");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";

      onCreated?.(jobId);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  const label = "text-sm text-slate-200";
  const input =
    "w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white/5 border border-white/10 p-4"
    >
      <h2 className="text-xl font-semibold text-white">Create Print Job</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* File */}
        <label className="flex flex-col gap-2">
          <span className={label}>3D Model File</span>
          <input
            ref={fileInput}
            type="file"
            accept={allowed}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded border border-white/20 bg-white/5 p-2 file:mr-3 file:rounded file:border-0 file:bg-black file:text-white"
          />
          <span className="text-xs text-white/60">
            Allowed: {allowed.replaceAll(",", ", ")}
          </span>
        </label>

        {/* Quantity */}
        <label className="flex flex-col gap-2">
          <span className={label}>Quantity</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value || "1"))}
            className={input}
          />
        </label>

        {/* Filament */}
        <label className="flex flex-col gap-2">
          <span className={label}>Filament Type</span>
          <select
            value={filamentType}
            onChange={(e) => setFilamentType(e.target.value as "PLA" | "TPU")}
            className={input}
          >
            <option value="PLA">PLA</option>
            <option value="TPU">TPU</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>Filament Color</span>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value as "Black" | "Grey" | "White")}
            className={input}
          >
            <option value="Black">Black</option>
            <option value="Grey">Grey</option>
            <option value="White">White</option>
          </select>
        </label>
      </div>

      {/* Print Settings */}
      <div className="space-y-2">
        <div className={label}>Print Settings</div>
        <div className="flex items-center gap-6 text-sm text-slate-200">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={preset === "default"}
              onChange={() => setPreset("default")}
            />
            Default
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={preset === "custom"}
              onChange={() => setPreset("custom")}
            />
            Custom
          </label>
        </div>

        {/* Only show custom options when selected */}
        {preset === "custom" && (
          <div className="grid md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className={label}>Infill %</span>
              <input
                className={input}
                inputMode="numeric"
                placeholder="e.g. 15"
                value={infillPercent}
                onChange={(e) => setInfillPercent(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>Wall Loops</span>
              <input
                className={input}
                inputMode="numeric"
                placeholder="e.g. 2"
                value={wallLoops}
                onChange={(e) => setWallLoops(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
  
              
            </label>
          </div>
        )}

        <p className="text-xs text-slate-400">
          For other settings please put them in the notes below.
        </p>
      </div>

      {/* Notes */}
      <label className="flex flex-col gap-2">
        <span className={label}>Notes (optional)</span>
        <textarea
          rows={3}
          className={input}
          placeholder="Any special instructions?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        disabled={busy}
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? "Submitting..." : "Submit Job"}
      </button>
    </form>
  );
}
