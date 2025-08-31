import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider"; // adjust if your AuthProvider is elsewhere

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    // if no user logged in → redirect to /login
    return <Navigate to="/login" replace />;
  }

  // if authenticated → show child routes
  return <Outlet />;
}
