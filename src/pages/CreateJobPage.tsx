// src/pages/CreateJobPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import CreateJobForm from "@/components/CreateJobForm";

type UserProfile = {
  displayName?: string;
  address?: string;
  phone?: string; // WhatsApp / phone
  email?: string;
  createdAt?: any;
  updatedAt?: any;
};

export default function CreateJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Live-load user profile for delivery info
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // Seed a minimal doc for older accounts
          await setDoc(
            ref,
            {
              email: user.email ?? "",
              displayName: user.displayName ?? "",
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
          setProfile({
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            address: "",
            phone: "",
          });
        } else {
          const data = snap.data() as UserProfile;
          setProfile({
            displayName: data.displayName ?? user.displayName ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            email: data.email ?? user.email ?? "",
          });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [user?.uid]);

  function isIncomplete(p?: UserProfile | null) {
    if (!p) return true;
    return !p.displayName?.trim() || !p.address?.trim() || !p.phone?.trim();
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-white">
        Please sign in to create a print job.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Delivery details / Profile summary */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-semibold">Delivery Details</h2>
            <p className="text-sm text-slate-400">
              We’ll use this info for delivery and contacting you.
            </p>
          </div>
          <Link
            to="/dashboard/profile"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
          >
            Edit Profile
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-3 text-sm text-slate-400">Loading…</div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <Field label="Name" value={profile?.displayName} />
            <Field label="WhatsApp / Phone" value={profile?.phone} />
            <div className="sm:col-span-2">
              <Field label="Address" value={profile?.address} multiline />
            </div>
          </div>
        )}

        {/* Incomplete warning */}
        {!loading && isIncomplete(profile) && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Your profile looks incomplete. Please fill in{" "}
            <strong>Name</strong>, <strong>Address</strong>, and{" "}
            <strong>WhatsApp/Phone</strong> before scheduling delivery.
          </div>
        )}
      </section>

      {/* Create job form */}
      <CreateJobForm
        onCreated={(jobId) => {
          // Success message + send user to status page
          alert(
            "Your job has been submitted. Please wait for the admin to give a quote in the 'quoted' tab."
          );
          navigate("/dashboard/start-print");
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  const empty = !value || !value.trim();
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 text-slate-100 ${
          multiline ? "whitespace-pre-wrap break-words" : "truncate"
        }`}
      >
        {empty ? <span className="text-slate-500">— not set —</span> : value}
      </div>
    </div>
  );
}
