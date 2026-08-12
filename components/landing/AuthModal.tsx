"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
}: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { signInWithGmail } = useSettings();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGmail();
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_auth_active", "true");
      }
      onClose();
      router.push("/triage");
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google. Please check popup permissions.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    // Simulate auth login & persist session
    await new Promise((r) => setTimeout(r, 400));
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_auth_active", "true");
      if (email) {
        localStorage.setItem("aether_user_email", email);
        localStorage.setItem("aether_user_name", email.split("@")[0]);
      }
    }
    setIsSubmitting(false);
    onClose();
    router.push("/triage");
  };

  const handleGuestEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_auth_active", "true");
    }
    onClose();
    router.push("/triage");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-5 text-[#F6F1E9]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8674A] font-serif text-base font-bold text-[#0A1620]">
              Æ
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                {tab === "signin" ? "Sign In to AETHER" : "Create AETHER Account"}
              </h3>
              <p className="text-xs text-[#7C8A93]">Healthcare Navigation Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7C8A93] hover:text-[#F6F1E9] hover:bg-[#132A38] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* PROMINENT GOOGLE / GMAIL LOGIN BUTTON */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[rgba(246,241,233,0.2)] bg-[#132A38] hover:bg-[#163447] p-3 text-xs font-mono font-bold text-[#F6F1E9] transition-all shadow-md group disabled:opacity-50"
          >
            {/* Google Colorful G Logo */}
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
            <span>
              {isGoogleSubmitting
                ? "Connecting to Google..."
                : tab === "signin"
                ? "Continue with Google / Gmail"
                : "Sign Up with Google / Gmail"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[rgba(246,241,233,0.09)]" />
          <span className="absolute bg-[#0F2130] px-3 font-mono text-[10px] uppercase text-[#7C8A93]">
            or use email
          </span>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#132A38] p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`rounded-lg py-2 font-medium transition-colors ${
              tab === "signin"
                ? "bg-[#E8674A] text-[#0A1620] font-bold"
                : "text-[#B9C4CC] hover:text-[#F6F1E9]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-lg py-2 font-medium transition-colors ${
              tab === "signup"
                ? "bg-[#E8674A] text-[#0A1620] font-bold"
                : "text-[#B9C4CC] hover:text-[#F6F1E9]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {authError && (
          <div className="rounded-xl border border-[#D14343] bg-[#D14343]/10 p-2.5 text-xs text-[#D14343] text-center">
            {authError}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#7C8A93] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#7C8A93] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#E8674A] py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-110 disabled:opacity-50 transition-all shadow-md mt-1"
          >
            {isSubmitting
              ? "Authenticating..."
              : tab === "signin"
              ? "Sign In & Enter Dashboard →"
              : "Register & Get Started →"}
          </button>
        </form>

        <div className="relative border-t border-[rgba(246,241,233,0.09)] pt-3 text-center">
          <button
            type="button"
            onClick={handleGuestEnter}
            className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] py-2 text-xs font-mono text-[#B9C4CC] hover:text-[#F6F1E9] hover:border-[#4F9D8C] transition-all"
          >
            🚀 Continue as Demo Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
