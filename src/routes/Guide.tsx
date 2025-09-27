import React from "react";
import TopNav from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Guide() {
  return (
    <>
      <TopNav />

      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* Animated soft glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              How to Print with <span className="text-indigo-400">Sky3D</span>
            </h1>
            <p className="mt-3 text-slate-300">
              Follow these simple steps to submit and track your 3D print.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {[
              {
                title: "1. Create an Account / Login",
                body:
                  "Sign up or log in to your Sky3D dashboard. Keep your profile updated for delivery.",
              },
              {
                title: "2. Prepare Your Model",
                body:
                  "We accept STL/3MF. Keep size reasonable, walls ≥ 0.8mm, and ensure model is manifold.",
              },
              {
                title: "3. Start a New Job",
                body:
                  "Go to Dashboard → New Job. Upload your file, choose material and color, add notes (strength, finish).",
              },
              {
                title: "4. Get a Quote",
                body:
                  "We’ll estimate hours and filament. You’ll see it under “My Print Status → Quoted”.",
              },
              {
                title: "5. Approve & Queue",
                body:
                  "Approve the quote to reserve hours/filament. Your job moves to Processing.",
              },
              {
                title: "6. Track Progress",
                body:
                  "Check “My Print Status”. You’ll see current status and any admin notes.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
              >
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                <p className="text-slate-300 mt-2">{s.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-6"
          >
            <h3 className="text-white font-semibold text-xl">Pro Tips</h3>
            <ul className="mt-3 list-disc pl-5 text-slate-200 space-y-1">
              <li>Prefer fillets over sharp corners for stronger parts.</li>
              <li>Keep overhangs ≤ 60° or expect supports.</li>
              <li>Use simple text/embossing ≥ 1mm height for readability.</li>
              <li>Double-check dimensions and orientation before upload.</li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/dashboard/new-print"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Start New Print
            </Link>
            <Link
              to="/specs"
              className="px-6 py-3 border border-white/30 hover:border-white text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105"
            >
              View Printer & Filament Specs
            </Link>
          </motion.div>
        </main>
      </section>
    </>
  );
}
