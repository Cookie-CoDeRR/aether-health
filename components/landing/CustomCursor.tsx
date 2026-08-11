"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest(".interactive-card") ||
          target.closest(".interactive-hover"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Instant Precision Dot Cursor */}
      <div
        className="fixed top-0 left-0 z-50 pointer-events-none rounded-full bg-[#E8674A] transition-transform duration-75 ease-out shadow-[0_0_10px_#E8674A]"
        style={{
          width: isHovered ? "10px" : "6px",
          height: isHovered ? "10px" : "6px",
          transform: `translate3d(${pos.x - (isHovered ? 5 : 3)}px, ${pos.y - (isHovered ? 5 : 3)}px, 0)`,
        }}
      />

      {/* Fast Ring Follower */}
      <div
        className={`fixed top-0 left-0 z-40 pointer-events-none rounded-full border transition-all duration-150 ease-out ${
          isHovered
            ? "border-[#00F0FF] bg-[#00F0FF]/10 scale-125 shadow-[0_0_16px_rgba(0,240,255,0.3)]"
            : "border-[#E8674A]/40 bg-transparent"
        }`}
        style={{
          width: "28px",
          height: "28px",
          transform: `translate3d(${pos.x - 14}px, ${pos.y - 14}px, 0)`,
        }}
      />
    </>
  );
}
