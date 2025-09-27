// src/routes/Specification.tsx
import React from "react";
import Navbar from "@/components/Navbar";

type SpecRow = { label: string; value: string };

const printerSpecs: SpecRow[] = [
  { label: "Printer Models", value: "Bambu Lab A1" },
  { label: "Build Volume", value: "256 × 256 × 256 mm (Bambu A1)" },
  { label: "Nozzle Diameter", value: "0.4 mm (standard)" },
  { label: "Layer Height", value: "0.1 – 0.28 mm (default 0.2 mm)" },
  { label: "Infill Density", value: "5% – 100% (default 15–20%)" },
  { label: "Perimeters / Walls", value: "2 – 5 (default 3 walls)" },
  {
    label: "Max Print Speed",
    value: "Bambu Lab A1: up to 500 mm/s • Others: 150–200 mm/s",
  },
  { label: "Supported Materials", value: "PLA and TPU (shore 95A)" },
  {
    label: "Color Options",
    value: "PLA: White / Black / Gray • TPU: White / Gray / Black",
  },
  {
    label: "Tolerances",
    value: "±0.2–0.4 mm depending on size & geometry",
  },
];

const filamentSpecs: SpecRow[] = [
  { label: "Brand", value: "SUNLU Professional Filament (PLA+, TPU)" },
  {
    label: "PLA (Polylactic Acid)",
    value: "High toughness, low warp, consistent diameter ±0.02 mm",
  },
  {
    label: "TPU (Flexible)",
    value: "Rubber-like, impact resistant; shore hardness 95A",
  },
  {
    label: "Recommended Nozzle Temp",
    value: "PLA+ 200–215 °C • TPU 215–230 °C",
  },
  {
    label: "Bed Temp",
    value: "PLA+ 50–60 °C • TPU 40–60 °C (glue stick recommended)",
  },
  { label: "Filament Diameter", value: "1.75 mm" },
  { label: "Spool Weight", value: "1 kg per roll (net)" },
  {
    label: "Use Cases",
    value: "PLA+: prototypes, functional parts • TPU: gaskets, phone cases, dampers",
  },
];

function SpecTable({ title, rows }: { title: string; rows: SpecRow[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <dl className="divide-y divide-white/10">
        {rows.map((r, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3">
            <dt className="text-slate-300">{r.label}</dt>
            <dd className="sm:col-span-2 text-slate-100">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function Specification() {
  return (
    <>
      <Navbar />

      <section className="relative min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
        {/* soft animated glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 md:px-8 py-10 space-y-6">
          <header>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Specifications
            </h1>
            <p className="text-slate-300 mt-2">
              At Sky3D, we use professional-grade printers like the{" "}
              <span className="font-semibold text-indigo-300">Bambu Lab A1</span>{" "}
              and high-quality <span className="font-semibold text-indigo-300">SUNLU</span>{" "}
              filaments to ensure smooth, accurate, and durable prints.
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-6">
            <SpecTable title="Printer Specifications" rows={printerSpecs} />
            <SpecTable title="Filament Specifications (SUNLU)" rows={filamentSpecs} />
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5">
            <h3 className="text-white font-semibold mb-2">Tips for Best Results</h3>
            <ul className="list-disc pl-5 text-slate-200 space-y-1">
              <li>
                Prefer <span className="font-medium">STL</span> or{" "}
                <span className="font-medium">3MF</span> files with watertight geometry.
              </li>
              <li>
                Indicate preferred strength by specifying infill % or wall loops in the job notes.
              </li>
              <li>
                For TPU, avoid sharp internal corners — add small fillets to improve strength.
              </li>
              <li>
                Provide critical dimensions if tolerances are important; we’ll double-check before
                shipping.
              </li>
            </ul>
          </div>
        </main>
      </section>
    </>
  );
}
