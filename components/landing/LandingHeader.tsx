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
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(246,241,233,0.09)] bg-[#0A1620]/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between transition-colors">
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
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleQuickGoogleSignIn}
          className="flex items-center gap-2 rounded-xl border border-[#4F9D8C]/40 bg-[#132A38] px-3.5 py-2 text-xs font-mono font-bold text-[#F6F1E9] hover:bg-[#4F9D8C]/20 hover:border-[#4F9D8C] transition-all shadow-md"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
            />
          </svg>
          <span className="hidden sm:inline">Google Login</span>
        </button>

        <button
          onClick={() => onOpenAuth("signin")}
          className="rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2 text-xs font-mono font-medium text-[#F6F1E9] hover:border-[#E8674A] transition-all"
        >
          Sign In
        </button>

        <button
          onClick={() => onOpenAuth("signup")}
          className="hidden sm:inline-flex rounded-xl bg-[#E8674A] px-4 py-2 text-xs font-mono font-semibold text-[#0A1620] hover:brightness-110 transition-all shadow-md"
        >
          Sign Up →
        </button>
      </div>
    </header>
  );
}
