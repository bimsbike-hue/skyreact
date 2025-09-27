// src/routes/Profile.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

type UserProfile = {
  displayName?: string;
  address?: string;
  phone?: string; // WhatsApp/Phone
  email?: string;
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<UserProfile>({
    displayName: "",
    address: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setForm({
            displayName: data.displayName ?? user.displayName ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            email: data.email ?? user.email ?? "",
          });
        } else {
          setDoc(
            ref,
            {
              email: user.email ?? "",
              displayName: user.displayName ?? "",
              createdAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
          setForm({
            displayName: user.displayName ?? "",
            address: "",
            phone: "",
            email: user.email ?? "",
          });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    setOk(false);

    if (!form.displayName?.trim()) {
      setErr("Name is required.");
      return;
    }
    if (!form.address?.trim()) {
      setErr("Address is required.");
      return;
    }
    if (!form.phone?.trim()) {
      setErr("WhatsApp/Phone number is required.");
      return;
    }

    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        displayName: form.displayName!.trim(),
        address: form.address!.trim(),
        phone: form.phone!.trim(),
        updatedAt: serverTimestamp(),
      });

      await updateProfile(user, { displayName: form.displayName!.trim() });

      setOk(true);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  const label = "text-sm text-slate-200";
  const input =
    "w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const card =
    "rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-black/10";

  if (!user) {
    return (
      <main className="p-6 text-white">
        Please sign in to view your profile.
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Centered container for title + card */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <header>
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
          <p className="text-slate-400">
            Update your personal information and delivery details here.
          </p>
        </header>

        <form onSubmit={save} className={`${card} space-y-4`}>
          <div>
            <label className={label}>Email</label>
            <input className={`${input} opacity-60`} value={form.email ?? ""} disabled />
          </div>

          <div>
            <label className={label}>Name</label>
            <input
              className={input}
              placeholder="Your full name"
              value={form.displayName ?? ""}
              onChange={(e) => setField("displayName", e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Address</label>
            <textarea
              rows={3}
              className={input}
              placeholder="Street, city, province, postal code"
              value={form.address ?? ""}
              onChange={(e) => setField("address", e.target.value)}
            />
          </div>

          <div>
            <label className={label}>No HP (WhatsApp preferred)</label>
            <input
              className={input}
              placeholder="+62 812-xxx-xxxx"
              value={form.phone ?? ""}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </div>

          {err && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              Profile saved.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/change-password")}
              className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
