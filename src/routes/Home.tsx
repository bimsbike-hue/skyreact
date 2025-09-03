// src/routes/Home.tsx
import React from "react";
import TopNav from "../components/Navbar"; // <-- ✅ import Navbar (TopNav)

export default function Home() {
  return (
    <>
      <TopNav />
      <main className="p-6 text-white">
        <h1 className="text-3xl font-bold">Welcome to Sky3D</h1>
        <p className="mt-4 text-gray-400">
          This is the home page. Use the navigation above to go to your dashboard.
        </p>
      </main>
    </>
  );
}
