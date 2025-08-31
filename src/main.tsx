// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import AppLayout from "./routes/AppLayout";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import DashboardLayout from "./routes/DashboardLayout";
import DashboardOverview from "./routes/DashboardOverview";
import Orders from "./routes/Orders";
import Subscriptions from "./routes/Subscriptions";
import Profile from "./routes/Profile";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";
import "./styles.css";

// Smooth global animation
const GLOBAL_TRANSITION = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
};

// Simple 404 page
function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-200">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">404 – Page not found</h1>
        <a href="/" className="text-blue-400 hover:underline">Go home</a>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/signup", element: <Navigate to="/register" replace /> }, // 👈 alias

      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: "overview", element: <DashboardOverview /> },
          { path: "orders", element: <Orders /> },
          { path: "subscriptions", element: <Subscriptions /> },
          { path: "profile", element: <Profile /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig transition={GLOBAL_TRANSITION} reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MotionConfig>
  </React.StrictMode>
);
