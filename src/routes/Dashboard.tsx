// src/routes/Dashboard.tsx
"use client";

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import Navbar from "@/components/Navbar";

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

  /** Shared styles (glass buttons) */
  const itemBase =
    "block w-full text-left px-4 py-3 rounded-xl transition ring-1 ring-white/10 " +
    "bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white";
  const itemActive =
    "block w-full text-left px-4 py-3 rounded-xl transition " +
    "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30";

  // Regular user sidebar items
  const userLinks = !isAdmin
    ? [
        { to: "overview", label: "Overview", end: true },
        { to: "topup", label: "Top-Up" },
        { to: "purchase-history", label: "Purchase History" },
        { to: "profile", label: "Profile" },
        { to: "new-print", label: "New Job" },
        { to: "start-print", label: "My Print Status" },
      ]
    : [];

  // Admin sidebar items
  const adminLinks = isAdmin
    ? [
        { to: "admin-dashboard", label: "Admin Dashboard" },
        { to: "admin-users", label: "User List" },
        { to: "start-print", label: "Users Print Status" },
        { to: "admin", label: "Top-Up Approvals" },
        { to: "admin-history", label: "User Purchase History" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top navbar (already styled) */}
      <Navbar />

      {/* Animated gradient background to match Home.tsx */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* soft glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-500" />
        </div>

        {/* Content grid */}
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-3">
            {!isAdmin &&
              userLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end as boolean | undefined}
                  className={({ isActive }) => (isActive ? itemActive : itemBase)}
                >
                  {l.label}
                </NavLink>
              ))}

            {isAdmin && (
              <>
                <div className="mt-2 text-[11px] uppercase tracking-wider text-slate-400 px-1">
                  Admin
                </div>
                {adminLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) => (isActive ? itemActive : itemBase)}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </>
            )}
          </aside>

          {/* Main content (glass container look is managed inside each page already) */}
          <main className="min-h-[60vh] space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
