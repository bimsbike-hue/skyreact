// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";

// Dashboard + nested pages
import Dashboard from "./routes/Dashboard";
import DashboardOverview from "./routes/DashboardOverview";
import TopUpPage from "./routes/TopUp";
import PurchaseHistory from "./routes/PurchaseHistory";
import Profile from "./routes/Profile";

// Admin pages (only if you have these files)
import AdminPanel from "./routes/AdminPanel";
import AdminPurchaseHistory from "./routes/AdminPurchaseHistory";

// Auth pages
import Login from "./routes/Login";
// ⬇️ your Register lives under /routers (not /routes)
import Register from "./routes/Register";

// Auth provider / guard
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      {/* The ONLY router in the app */}
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          {/* Keep /signup path so Login.tsx's Link to="/signup" works */}
          <Route path="/signup" element={<Register />} />

          {/* Private area */}
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
            <Route path="history" element={<PurchaseHistory />} />
            <Route path="profile" element={<Profile />} />

            {/* admin tabs (keep only pages you actually have) */}
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
