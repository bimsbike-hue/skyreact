// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navLink =
    "block px-3 py-2 rounded-md text-sm font-medium hover:text-indigo-300";
  const isActive = (p: string) =>
    pathname === p ? "text-white" : "text-slate-300";

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function closeMobile() {
    setOpen(false);
  }

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="text-xl font-bold" onClick={closeMobile}>
            Sky3D
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`${navLink} ${isActive("/")}`}>
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`${navLink} ${isActive("/dashboard")}`}
            >
              Dashboard
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className={`${navLink} ${isActive("/login")}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-slate-700 hover:bg-slate-600"
              >
                Logout
              </button>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              // X
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Bars
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur">
          <div className="space-y-1 px-4 py-3">
            <Link
              to="/"
              onClick={closeMobile}
              className={`${navLink} ${isActive("/")}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              onClick={closeMobile}
              className={`${navLink} ${isActive("/dashboard")}`}
            >
              Dashboard
            </Link>

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={`${navLink} ${isActive("/login")}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobile}
                  className="block px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-slate-700 hover:bg-slate-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
