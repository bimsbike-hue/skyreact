import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          PRINT YOUR IDEAS
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Rent 3D printers weekly/monthly. Upload design, choose filament, track status.
        </p>

        <div className="mt-8 flex gap-3">
          {user ? (
            <Link
              to="/dashboard/overview"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Get Started
            </Link>
          )}
          <a
            href="#features"
            className="inline-flex items-center rounded-md bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
