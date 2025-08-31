// src/routes/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // go to dashboard after signup
    } catch (err: any) {
      setError(err?.message || "Failed to register.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/70 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">Create Account</h1>

        {error && (
          <p className="mb-4 rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
