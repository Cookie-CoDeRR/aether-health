"use client";

import { useEffect, useRef } from "react";

export default function InteractiveSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      containerRef.current.style.setProperty("--x", `${x}px`);
      containerRef.current.style.setProperty("--y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={
        {
          "--x": "50vw",
          "--y": "30vh",
        } as React.CSSProperties
      }
    >
      {/* Subtle Forest Green 32px Grid Canvas */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(6, 78, 59, 0.09) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Dynamic Cursor-Tracking Spotlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(650px circle at var(--x) var(--y), rgba(6, 78, 59, 0.08), transparent 70%)",
        }}
      />
    </div>
  );
}
