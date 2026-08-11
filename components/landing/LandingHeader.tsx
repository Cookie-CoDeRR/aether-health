"use client";

import Link from "next/link";

interface LandingHeaderProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export default function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(246,241,233,0.09)] bg-[#0A1620]/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8674A] font-serif text-lg font-bold text-[#0A1620] shadow-md group-hover:scale-105 transition-transform">
          Æ
        </div>
        <div>
          <div className="font-serif text-lg font-medium tracking-tight text-[#F6F1E9]">
            AETHER
          </div>
          <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-[#7C8A93]">
            Health Navigation
          </div>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#B9C4CC]">
        <a href="#overview" className="hover:text-[#E8674A] transition-colors">
          Capabilities
        </a>
        <a href="#analytics" className="hover:text-[#E8674A] transition-colors">
          Why AETHER
        </a>
        <a href="#disclaimer" className="hover:text-[#E8674A] transition-colors">
          Notice
        </a>
      </nav>

      {/* Auth Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onOpenAuth("signin")}
          className="rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-4 py-2 text-xs font-mono font-medium text-[#F6F1E9] hover:border-[#E8674A] transition-all"
        >
          Sign In
        </button>

        <button
          onClick={() => onOpenAuth("signup")}
          className="rounded-xl bg-[#E8674A] px-4.5 py-2 text-xs font-mono font-semibold text-[#0A1620] hover:brightness-110 transition-all shadow-md"
        >
          Sign Up / Get Started →
        </button>
      </div>
    </header>
  );
}
