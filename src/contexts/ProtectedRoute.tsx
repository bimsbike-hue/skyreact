import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While Firebase checks the session, avoid flicker
  if (loading) return null; // or a spinner component

  // Not logged in → send to login, remember where they came from
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in → render nested protected routes
  return <Outlet />;
}
