import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#0b1220] border-b border-white/10">
      {/* Wider shared container to reduce side margins on big screens */}
      <div className="mx-auto w-full max-w-screen-2xl px-8 py-3 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="text-xl font-bold text-white">
          Sky3D
        </Link>

        {/* Right: Nav */}
        <div className="flex items-center gap-6">
          <Link className="text-slate-300 hover:text-white transition" to="/">
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-slate-300 hover:text-white transition disabled:opacity-60"
              >
                {loggingOut ? "Signing out…" : "Logout"}
              </button>

              {isDashboard && (
                <span className="ml-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium text-sm">
                  👋 Hi, {displayName}!
                </span>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
