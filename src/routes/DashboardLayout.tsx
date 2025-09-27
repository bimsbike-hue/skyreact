// src/routes/DashboardLayout.tsx
"use client";

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const tabBase =
  "w-full text-left px-4 py-3 rounded-xl ring-1 ring-white/10 bg-white/5 hover:bg-white/10 " +
  "text-slate-200 hover:text-white transition";
const tabActive =
  "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30";

function SideItem({
  to,
  children,
}: {
  to: string; // RELATIVE path under /dashboard/*
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `${tabBase} ${isActive ? tabActive : ""}`}
    >
      {children}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user } = useAuth();
  const isAdmin = user?.email === "bimsbike@gmail.com";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background to match Home */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* soft glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-200" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 mx-auto max-w-screen-2xl grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6 px-6 md:px-8 py-8">
          {/* Sidebar */}
          <aside className="space-y-3">
            {!isAdmin && (
              <>
                <SideItem to="overview">Overview</SideItem>
                <SideItem to="topup">Top-Up</SideItem>
                <SideItem to="purchase-history">Purchase History</SideItem>
                <SideItem to="profile">Profile</SideItem>
                <div className="h-px bg-white/10 my-2" />
                <SideItem to="new-print">New Job</SideItem>
                <SideItem to="start-print">My Print Status</SideItem>
              </>
            )}

            {isAdmin && (
              <>
                <div className="uppercase text-[11px] tracking-wider text-slate-400 px-1">
                  Admin
                </div>
                <SideItem to="admin-dashboard">Admin Dashboard</SideItem>
                <SideItem to="admin-users">User List</SideItem>
                <SideItem to="start-print">Users Print Status</SideItem>
                <SideItem to="admin">Top-Up Approvals</SideItem>
                <SideItem to="admin-history">All Purchases</SideItem>
              </>
            )}
          </aside>

          {/* Nested content */}
          <section className="min-h-[60vh]">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
