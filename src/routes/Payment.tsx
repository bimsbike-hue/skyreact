// src/routes/Payment.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const navigate = useNavigate();
  const card =
    "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";

  function goToHistory() {
    navigate("/dashboard/purchase-history");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Payment</h1>
        <p className="text-slate-400 text-sm">
          Please transfer the total to the bank account below. Your top-up will
          be applied automatically once verified.
        </p>
      </header>

      <div className={`${card} space-y-4`}>
        <h2 className="text-lg font-semibold text-white">Bank Transfer</h2>

        <div className="rounded-xl ring-1 ring-white/10 bg-black/30 px-4 py-3 space-y-1 text-slate-200">
          <p>
            BCA : <span className="font-bold">5271041536</span>
          </p>
          <p>
            A/N : <span className="font-bold">Bima Pratama Putra</span>
          </p>
        </div>

        <button
          onClick={goToHistory}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          View my purchase history
        </button>
      </div>
    </div>
  );
}
