import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";

type UserRow = {
  id: string;
  email?: string;
  displayName?: string;
  name?: string;
  address?: string;
  phone?: string;
  createdAt?: any;
};

export default function AdminUserList() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: UserRow[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
      setUsers(rows);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter((u) =>
      [u.email, u.displayName, u.name, u.phone, u.address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(f))
    );
  }, [filter, users]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">User List</h1>
        <div className="text-sm text-slate-400">{filtered.length} users</div>
      </div>

      <div className="flex gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search name, email, phone, address…"
          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full bg-slate-900/40">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Action</th>{/* NEW */}
            </tr>
          </thead>
          <tbody className="text-sm text-slate-200">
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  {u.name || u.displayName || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-4 py-3">{u.email || <span className="text-slate-500">—</span>}</td>
                <td className="px-4 py-3">{u.phone || <span className="text-slate-500">—</span>}</td>
                <td className="px-4 py-3 max-w-[26rem]">
                  <div className="truncate" title={u.address || ""}>
                    {u.address || <span className="text-slate-500">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.id}</td>
                <td className="px-4 py-3">
                  <Link
                    to={u.id} // nested: /dashboard/admin-users/:uid
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
