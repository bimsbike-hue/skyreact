import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(getAuth(app));
      // if you were inside /dashboard, send the user home or to login
      navigate("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-white" : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-wider">
          Sky3D
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink
            to={user ? "/dashboard/overview" : "/login"}
            className={linkClass}
          >
            Dashboard
          </NavLink>

          {user ? (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
          )}
        </nav>

        {/* mobile toggler */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="i-[hamburger]">
            {/* simple bars */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="#e5e7eb" strokeWidth="2" />
            </svg>
          </span>
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95">
          <div className="px-4 py-3 flex flex-col gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${
                  isActive && location.pathname === "/"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:text-white"
                }`
              }
              onClick={() => setOpen(false)}
              end
            >
              Home
            </NavLink>
            <NavLink
              to={user ? "/dashboard/overview" : "/login"}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
                }`
              }
              onClick={() => setOpen(false)}
            >
              Dashboard
            </NavLink>

            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="mt-1 rounded bg-slate-800 hover:bg-slate-700 px-3 py-2 text-left text-slate-100"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-1 rounded bg-blue-600 hover:bg-blue-500 px-3 py-2 text-left text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
