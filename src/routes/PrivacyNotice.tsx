// src/routes/PrivacyNotice.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyNotice() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 text-slate-200">
      <h1 className="text-3xl font-bold text-white">Customer Data & Privacy Notice</h1>
      <p className="text-sm text-slate-400">Version v1.0 — 2025-09-20</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">What we collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Account data (name, email, phone, address).</li>
          <li>Order details and uploaded models’ metadata.</li>
          <li>Operational logs (timestamps, device/user-agent).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">How we use it</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>To process orders, provide quotes, and ship results.</li>
          <li>To prevent fraud and abuse and ensure platform security.</li>
          <li>To analyze usage and improve our services.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Sharing</h2>
        <p>
          We share only what’s necessary with service providers (e.g., payment,
          storage, shipping). We do not sell personal data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Your choices</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Access and update your profile information.</li>
          <li>Request deletion of your account (legal/financial holds may apply).</li>
          <li>Contact support for questions or objections.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Retention</h2>
        <p>
          We retain data for as long as needed for service, legal, and tax
          obligations. Backups may persist for a limited period.
        </p>
      </section>

      <div className="pt-4">
        <Link to="/signup" className="text-indigo-300 underline">
          Return to Sign Up
        </Link>
      </div>
    </main>
  );
}
