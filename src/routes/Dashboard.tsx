// src/routes/Dashboard.tsx
"use client";

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.email === "bimsbike@gmail.com";

  if (!user) {
    return (
      <main className="p-6 max-w-6xl mx-auto text-white">
        Please sign in to view the dashboard.
      </main>
    );
  }

  const itemBase =
    "block w-full text-left px-4 py-3 rounded-lg transition bg-gray-800 text-white hover:bg-gray-700";
  const itemActive = "block w-full text-left px-4 py-3 rounded-lg transition bg-indigo-600 text-white";

  const links = [
    { to: "overview", label: "Overview", end: true },
    { to: "topup", label: "Top-Up" },
    { to: "history", label: "Purchase History" },
    { to: "profile", label: "Profile" },
    ...(isAdmin
      ? [
          { to: "admin-history", label: "User Purchase History" },
          { to: "admin", label: "Admin Panel" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Top navbar visible on all dashboard pages */}
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end as boolean | undefined}
              className={({ isActive }) => (isActive ? itemActive : itemBase)}
            >
              {l.label}
            </NavLink>
          ))}
        </aside>

        {/* Main content (nested routes render here) */}
        <main className="flex-1 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
