import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "../contexts/WalletProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance } = useWallet();

  const handleLogout = async () => {
    await signOut(getAuth(app));
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-white" : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-wider">
          Sky3D
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
		  <NavLink to="/shop" className={linkClass}>Shop</NavLink>
          <NavLink to={user ? "/dashboard/overview" : "/login"} className={linkClass}>
            Dashboard
          </NavLink>
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile toggler */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          aria-label="Toggle menu"
        >
          {/* simple animated burger */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <motion.path
              d="M3 6h18"
              stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"
              animate={{ d: open ? "M6 6 L18 18" : "M3 6h18" }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M3 12h18"
              stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M3 18h18"
              stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"
              animate={{ d: open ? "M6 18 L18 6" : "M3 18h18" }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t border-slate-800 bg-slate-900/95"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              <NavLink to="/" onClick={() => setOpen(false)} className={linkClass} end>
                Home
              </NavLink>
              <NavLink
                to={user ? "/dashboard/overview" : "/login"}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
			   <NavLink to="/shop" className={linkClass}>Shop</NavLink>
                Dashboard
              </NavLink>
              {user ? (
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="mt-1 rounded bg-slate-800 hover:bg-slate-700 px-3 py-2 text-left text-slate-100 transition"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded bg-blue-600 hover:bg-blue-500 px-3 py-2 text-left text-white transition"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
