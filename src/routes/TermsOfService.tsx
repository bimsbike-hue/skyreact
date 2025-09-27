// src/routes/TermsOfService.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 text-slate-200">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="text-sm text-slate-400">Version v1.0 — 2025-09-20</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1) Service</h2>
        <p>
          Sky3D provides 3D printing and related services on a best-effort basis.
          Lead times, colors, and finishes are estimates. Minor visual variations
          are normal and do not constitute defects.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2) User Content</h2>
        <p>
          You represent you own or have permission to print any uploaded models.
          You must not upload unlawful, infringing, or dangerous designs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3) Quotes & Payment</h2>
        <p>
          Quotes are estimates based on time and material. By approving a quote
          you authorize us to charge your wallet/balance. Failed, reversed, or
          fraudulent payments may result in suspension and recovery actions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4) Shipping & Risk</h2>
        <p>
          Risk of loss transfers to you upon hand-off to courier. Courier delays
          and handling are outside our control. We’ll provide reasonable support
          for claims where available.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5) Warranties</h2>
        <p>
          Service is provided “as is” without warranties. To the maximum extent
          permitted by law, Sky3D disclaims implied warranties and limits its
          liability to the amount you paid for the affected order.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6) Indemnity</h2>
        <p>
          You agree to defend and indemnify Sky3D from claims arising out of your
          models, instructions, or use of the service, including IP and product-liability
          claims.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7) Changes</h2>
        <p>
          We may update these terms with notice on the site. Continued use after
          updates constitutes acceptance.
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
