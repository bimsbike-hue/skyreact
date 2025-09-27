import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
/* Dashboard shell + nested pages */
import Dashboard from "./routes/Dashboard";
import DashboardOverview from "./routes/DashboardOverview";
import TopUpPage from "./routes/TopUp";
import PurchaseHistory from "./routes/PurchaseHistory";
import Profile from "./routes/Profile";
import Payment from "./routes/Payment";
/* Admin pages */
import AdminPanel from "./routes/AdminPanel";
import AdminPurchaseHistory from "./routes/AdminPurchaseHistory";
import AdminDashboard from "./routes/AdminDashboard";
import AdminUserList from "./routes/AdminUserList";
import AdminUserDetail from "./routes/AdminUserDetail";
/* Auth pages */
import Login from "./routes/Login";
import Register from "./routes/Register";
/* Password flows */
import ChangePassword from "./routes/ChangePassword"; // user-initiated change (in dashboard)
import ResetPassword from "./routes/ResetPassword"; // forgot-password (public)
/* Extra public pages */
import Guide from "./routes/Guide"; // ✅ printing guide/tutorial
import Specification from "./routes/Specification"; // ✅ printer & filament specs
/* Auth provider / guard */
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";
/* Print module */
import StartPrintPage from "./pages/StartPrintPage";
import CreateJobPage from "./pages/CreateJobPage";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(App, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Register, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsx(Route, { path: "/guide", element: _jsx(Guide, {}) }), _jsx(Route, { path: "/specs", element: _jsx(Specification, {}) }), _jsxs(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "overview", replace: true }) }), _jsx(Route, { path: "overview", element: _jsx(DashboardOverview, {}) }), _jsx(Route, { path: "topup", element: _jsx(TopUpPage, {}) }), _jsx(Route, { path: "purchase-history", element: _jsx(PurchaseHistory, {}) }), _jsx(Route, { path: "profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "payment", element: _jsx(Payment, {}) }), _jsx(Route, { path: "new-print", element: _jsx(CreateJobPage, {}) }), _jsx(Route, { path: "start-print", element: _jsx(StartPrintPage, {}) }), _jsx(Route, { path: "change-password", element: _jsx(ChangePassword, {}) }), _jsx(Route, { path: "admin-dashboard", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "admin-users", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AdminUserList, {}) }) }), _jsx(Route, { path: "admin-users/:uid", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AdminUserDetail, {}) }) }), _jsx(Route, { path: "admin", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AdminPanel, {}) }) }), _jsx(Route, { path: "admin-history", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AdminPurchaseHistory, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }) }));
