import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function TopNav() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    "px-3 py-2 rounded-md text-sm font-medium " +
    (isActive ? "bg-indigo-600 text-white" : "text-gray-200 hover:bg-gray-700");

  return (
    <header className="bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">Sky3D</Link>

        <nav className="flex gap-2">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          {!user && <NavLink to="/login" className={linkClass}>Login</NavLink>}
          {!user && (
            <a
              href="#"
              className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white"
              onClick={(e) => e.preventDefault()}
            >
              Sign Up
            </a>
          )}
          {user && (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
