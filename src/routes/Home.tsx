import React from "react";
import TopNav from "../components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <TopNav />

      {/* Animated Gradient Background */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden">
        {/* Soft animated glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-500" />
        </div>

        {/* Content */}
        <main className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6"
          >
            Print Your Ideas with <span className="text-indigo-400">Sky3D</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-lg text-slate-300 mb-10"
          >
            Affordable, fast, and reliable 3D printing service. Upload your
            model, choose your material, and watch your creation come to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/guide"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105"
            >
              📖 Learn How to Print
            </Link>
            <Link
              to="/specs"
              className="px-6 py-3 border border-white/30 hover:border-white text-white font-medium rounded-xl shadow-lg transition transform hover:scale-105"
            >
              🛠️ See Specifications
            </Link>
          </motion.div>
        </main>
      </div>
    </>
  );
}
