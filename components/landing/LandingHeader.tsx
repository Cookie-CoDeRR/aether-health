"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

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
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleQuickGoogleSignIn}
          className="flex items-center gap-2 rounded-xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] px-3.5 py-2 text-xs font-bold text-[#064E3B] transition-all shadow-2xs"
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
          className="hidden sm:inline-flex rounded-xl bg-[#064E3B] hover:bg-[#043327] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
        >
          Get Started →
        </button>
      </div>
    </header>
  );
}
