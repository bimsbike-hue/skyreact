import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="flex items-center justify-between p-4 bg-black">
        <Link to="/" className="text-xl font-bold">Sky3D</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 px-3 py-1 rounded">Login</Link>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
