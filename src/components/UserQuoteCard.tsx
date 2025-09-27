// src/components/UserQuoteCard.tsx
import React, { useState } from "react";
import { approveJobAndCharge, userSetDecision } from "@/lib/printJobs";

type Props = {
  jobId: string;
  uid: string;
  quote: { hours: number; grams: number; amountIDR: number; queuePosition?: number; notes?: string };
};

export default function UserQuoteCard({ jobId, uid, quote }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onApprove() {
    setLoading("approve"); setError(null);
    try {
      await userSetDecision(jobId, uid, "approved");
      await approveJobAndCharge(jobId, uid);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(null);
    }
  }

  async function onChanges() {
    setLoading("changes"); setError(null);
    try {
      await userSetDecision(jobId, uid, "changes_requested");
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(null);
    }
  }

  async function onCancel() {
    setLoading("cancel"); setError(null);
    try {
      await userSetDecision(jobId, uid, "cancelled");
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-2 bg-white">
      <h3 className="text-lg font-semibold">Your Quote</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Hours</div><div className="font-medium">{quote.hours}</div>
        <div>Filament</div><div className="font-medium">{quote.grams} g</div>
        <div>Price</div><div className="font-medium">IDR {quote.amountIDR.toLocaleString()}</div>
        {quote.queuePosition != null && (<><div>Queue</div><div className="font-medium">#{quote.queuePosition}</div></>)}
        {quote.notes && (<><div className="col-span-2 text-gray-600">{quote.notes}</div></>)}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button onClick={onApprove} disabled={loading!==null} className="px-4 py-2 rounded-xl bg-black text-white">
          {loading==="approve" ? "Approving..." : "Approve & Charge Wallet"}
        </button>
        <button onClick={onChanges} disabled={loading!==null} className="px-4 py-2 rounded-xl border">
          {loading==="changes" ? "Sending..." : "Request changes"}
        </button>
        <button onClick={onCancel} disabled={loading!==null} className="px-4 py-2 rounded-xl border">
          {loading==="cancel" ? "Cancelling..." : "Cancel"}
        </button>
      </div>
    </div>
  );
}
