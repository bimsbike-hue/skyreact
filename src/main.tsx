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
import ChangePassword from "./routes/ChangePassword";  // user-initiated change (in dashboard)
import ResetPassword from "./routes/ResetPassword";    // forgot-password (public)

/* Extra public pages */
import Guide from "./routes/Guide";            // ✅ printing guide/tutorial
import Specification from "./routes/Specification"; // ✅ printer & filament specs

/* Auth provider / guard */
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";

/* Print module */
import StartPrintPage from "./pages/StartPrintPage";
import CreateJobPage from "./pages/CreateJobPage";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/specs" element={<Specification />} />

          {/* Private area (everything below requires auth) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* default nested route */}
            <Route index element={<Navigate to="overview" replace />} />

            {/* user tabs */}
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="topup" element={<TopUpPage />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payment" element={<Payment />} />

            {/* print module */}
            <Route path="new-print" element={<CreateJobPage />} />
            <Route path="start-print" element={<StartPrintPage />} />

            {/* change password (inside dashboard) */}
            <Route path="change-password" element={<ChangePassword />} />

            {/* admin-only pages */}
            <Route
              path="admin-dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-users"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-users/:uid"
              element={
                <ProtectedRoute adminOnly>
                  <AdminUserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-history"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPurchaseHistory />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
