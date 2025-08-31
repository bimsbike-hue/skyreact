import { NavLink, Outlet } from "react-router-dom";


export default function DashboardLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Side menu */}
      <aside className="lg:col-span-3 space-y-4">
        <NavLink
          to="/dashboard/overview"
          className={({ isActive }) =>
            `block rounded-xl px-5 py-4 bg-slate-800/60 hover:bg-slate-800
             border ${isActive ? "border-blue-500" : "border-slate-700/60"}`
          }
        >
          Overview
        </NavLink>
        <NavLink
          to="/dashboard/orders"
          className={({ isActive }) =>
            `block rounded-xl px-5 py-4 bg-slate-800/60 hover:bg-slate-800
             border ${isActive ? "border-blue-500" : "border-slate-700/60"}`
          }
        >
          My Orders
        </NavLink>
        <NavLink
          to="/dashboard/subscriptions"
          className={({ isActive }) =>
            `block rounded-xl px-5 py-4 bg-slate-800/60 hover:bg-slate-800
             border ${isActive ? "border-blue-500" : "border-slate-700/60"}`
          }
        >
          Subscriptions
        </NavLink>
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `block rounded-xl px-5 py-4 bg-slate-800/60 hover:bg-slate-800
             border ${isActive ? "border-blue-500" : "border-slate-700/60"}`
          }
        >
          Profile
        </NavLink>
      </aside>

      {/* Content */}
      <section className="lg:col-span-9">
        <Outlet />
      </section>
    </div>
  );
}
