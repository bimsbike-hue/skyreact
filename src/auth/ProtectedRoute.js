import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// src/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
export default function ProtectedRoute({ children, adminOnly = false, }) {
    const { user, loading } = useAuth();
    if (loading)
        return null; // or a spinner
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (adminOnly && user.email !== "bimsbike@gmail.com") {
        return _jsx(Navigate, { to: "/dashboard/overview", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
