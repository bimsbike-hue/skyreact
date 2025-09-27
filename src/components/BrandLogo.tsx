// src/components/BrandLogo.tsx
import React from "react";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Replace with your actual SVG or image if you have one */}
      <img
        src="/logo-sky3d.svg"
        alt="Sky3D"
        className="h-8 w-8 rounded-lg object-contain"
      />
      <span className="text-xl font-bold text-white tracking-tight">
        Sky3D
      </span>
    </div>
  );
}
