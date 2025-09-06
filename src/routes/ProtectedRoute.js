import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider"; // adjust if your AuthProvider is elsewhere
export default function ProtectedRoute() {
    const { user } = useAuth();
    if (!user) {
        // if no user logged in → redirect to /login
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // if authenticated → show child routes
    return _jsx(Outlet, {});
}
