"use client";

import React from "react";

export default function InteractiveSpotlight() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Subtle Static Ambient Corner Glows (Zero mouse tracking) */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-400/8 blur-3xl pointer-events-none"
      />
      <div
        className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-teal-500/5 dark:bg-emerald-500/8 blur-3xl pointer-events-none"
      />
    </div>
  );
}
