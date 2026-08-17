"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { X, ShieldCheck } from "lucide-react";

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
      if (typeof window !== "undefined" && tab === "signup") {
        // Clear any old records so new user starts completely fresh with a new template
        localStorage.removeItem("aether_triage_chat_messages");
        localStorage.removeItem("aether_uploaded_reports");
        localStorage.removeItem("aether_medications");
        localStorage.removeItem("aether_timeline_events");
        localStorage.removeItem("aether_onboarding_completed");
        localStorage.setItem(
          "aether_medical_history",
          "New patient profile created. Please add your known allergies, chronic conditions, or past medical notes in Settings."
        );
      }
      await signInWithGmail();
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_auth_active", "true");
      }
      onClose();
      router.push("/triage");
    } catch (err: any) {
      if (err.message && err.message.includes("unauthorized-domain")) {
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_auth_active", "true");
        }
        onClose();
        router.push("/triage");
      } else {
        setAuthError(err.message || "Failed to sign in with Google. Please check permissions.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    if (typeof window !== "undefined") {
      // Clear past records so new user starts completely fresh with clean template
      localStorage.removeItem("aether_triage_chat_messages");
      localStorage.removeItem("aether_uploaded_reports");
      localStorage.removeItem("aether_medications");
      localStorage.removeItem("aether_timeline_events");
      localStorage.removeItem("aether_onboarding_completed"); // Fires 3D guide tour!
      
      const newTemplateHistory =
        "New patient profile created. Please add your known allergies, chronic conditions, or past medical notes in Settings.";
      localStorage.setItem("aether_medical_history", newTemplateHistory);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064E3B]/40 backdrop-blur-xs p-4 animate-fade-in text-[#064E3B]">
      <div className="w-full max-w-md rounded-3xl border border-[#064E3B]/20 bg-white p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] font-serif text-lg font-bold text-white shadow-soft">
              Æ
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {tab === "signin" ? "Sign In to Aether" : "Create Patient Account"}
              </h3>
              <p className="text-xs text-[#064E3B]/70 font-medium">Personal Health Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#064E3B]/70 hover:text-[#064E3B] hover:bg-[#F9FBF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Login Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] p-3 text-xs font-bold text-[#064E3B] transition-all shadow-xs disabled:opacity-50 min-tap-target"
          >
            <span>
              {isGoogleSubmitting
                ? "Connecting to Google..."
                : tab === "signin"
                ? "Continue with Google"
                : "Sign Up with Google"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[#064E3B]/15" />
          <span className="absolute bg-white px-3 text-[11px] font-bold text-[#064E3B]/60 uppercase">
            or with email
          </span>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F9FBF9] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`rounded-xl py-2 transition-all ${
              tab === "signin"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-xl py-2 transition-all ${
              tab === "signup"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {authError && (
          <div className="rounded-2xl border border-[#064E3B]/30 bg-[#F9FBF9] p-3 text-xs text-[#064E3B] font-bold text-center">
            {authError}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#064E3B] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#064E3B] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mt-1 min-tap-target"
          >
            {isSubmitting
              ? "Entering Dashboard..."
              : tab === "signin"
              ? "Sign In & Enter Dashboard →"
              : "Register & Get Started →"}
          </button>
        </form>

        <div className="border-t border-[#064E3B]/15 pt-3 text-center">
          <button
            type="button"
            onClick={handleGuestEnter}
            className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] py-2.5 text-xs font-bold text-[#064E3B] transition-all min-tap-target"
          >
            ✦ Explore as Demo Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
