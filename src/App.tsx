// src/App.tsx
"use client";

import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthProvider";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Navbar must NOT render a BrowserRouter either */}
      <Navbar />

      <main className="max-w-5xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold">Sky3D</h1>
        <p className="mt-2 text-slate-300">
          Welcome to Sky3D. Use the dashboard to top-up and manage your prints.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>

          {!user && (
            <Link
              to="/login"
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
            >
              Login
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
