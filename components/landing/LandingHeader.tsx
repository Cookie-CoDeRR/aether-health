"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

import { Stethoscope } from "lucide-react";

interface LandingHeaderProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export default function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const { signInWithGmail } = useSettings();
  const router = useRouter();

  const handleQuickGoogleSignIn = async () => {
    try {
      await signInWithGmail();
      router.push("/triage");
    } catch (err: any) {
      alert(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#064E3B]/15 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] font-serif text-lg font-bold text-white shadow-soft group-hover:scale-105 transition-transform">
          Æ
        </div>
        <div>
          <div className="font-serif text-lg font-bold tracking-tight text-[#064E3B]">
            Aether Health
          </div>
          <div className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#064E3B]/70">
            Patient Telemetry
          </div>
        </div>
      </Link>

      {/* Navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#064E3B]/80">
        <a href="#overview" className="hover:text-[#064E3B] transition-colors">
          Telemetry OS
        </a>
        <a href="#overview" className="hover:text-[#064E3B] transition-colors">
          Emergency Radar
        </a>
        <a href="#overview" className="hover:text-[#064E3B] transition-colors">
          Clinical Guidance
        </a>
      </nav>

      {/* Auth Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href="/doctor"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/70 hover:bg-emerald-100/80 px-3 py-2 text-xs font-bold text-emerald-900 transition-all shadow-2xs"
        >
          <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Doctor Portal</span>
        </Link>

        <button
          onClick={handleQuickGoogleSignIn}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] px-3.5 py-2 text-xs font-bold text-[#064E3B] transition-all shadow-2xs"
        >
          <span>Google Sync</span>
        </button>

        <button
          onClick={() => onOpenAuth("signin")}
          className="rounded-xl border border-[#064E3B]/30 bg-white hover:bg-[#064E3B]/5 px-3.5 py-2 text-xs font-bold text-[#064E3B] transition-all"
        >
          Sign In
        </button>

        <button
          onClick={() => onOpenAuth("signup")}
          className="rounded-xl bg-[#064E3B] hover:bg-[#043327] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
        >
          Get Started →
        </button>
      </div>
    </header>
  );
}
