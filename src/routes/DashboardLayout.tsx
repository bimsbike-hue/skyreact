// src/routes/DashboardLayout.tsx
"use client";

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function DashboardLayout() {
  const { user } = useAuth();

  // Base sidebar items
  const items: { to: string; label: string }[] = [
    { to: "/dashboard/overview", label: "Overview" },
    { to: "/dashboard/topup", label: "Top-Up" },
    { to: "/dashboard/orders", label: "My Orders" },
    { to: "/dashboard/subscriptions", label: "Subscriptions" },
    { to: "/dashboard/profile", label: "Profile" },
  ];

  // Show Admin Panel only for the admin email
  if (user?.email === "bimsbike@gmail.com") {
    // insert near the top (after Overview) or move where you prefer
    items.splice(1, 0, { to: "/dashboard/admin", label: "Admin Panel" });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block w-full text-left px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
