import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Failed to login");
      console.error("login error", e);
    } finally {
      setBusy(false);
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={onSubmit} className="w-[420px] rounded-xl bg-slate-800/80 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-4">Login</h1>

        {err && <div className="mb-3 rounded bg-red-500/20 text-red-200 px-3 py-2 text-sm">{err}</div>}

        <input
          className="w-full mb-3 rounded-md bg-slate-700 text-white px-3 py-2 outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 rounded-md bg-slate-700 text-white px-3 py-2 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={busy}
          className="w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition"
        >
          {busy ? "Signing in…" : "Login"}
        </button>

        <div className="text-center mt-3 text-sm">
          <Link to="/" className="text-slate-300 hover:underline">Back to home</Link>{" · "}
          <Link to="/signup" className="text-slate-300 hover:underline">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
