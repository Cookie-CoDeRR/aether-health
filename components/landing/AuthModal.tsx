"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate auth login
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    onClose();
    router.push("/triage");
  };

  const handleGuestEnter = () => {
    onClose();
    router.push("/triage");
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-4">
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

        {/* Tab selector */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#132A38] p-1 font-mono text-xs">
          <button
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
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
            className="w-full rounded-xl bg-[#E8674A] py-3 text-xs font-semibold text-[#0A1620] hover:brightness-110 disabled:opacity-50 transition-all shadow-md mt-2"
          >
            {isSubmitting
              ? "Authenticating..."
              : tab === "signin"
              ? "Sign In & Enter Dashboard →"
              : "Register & Get Started →"}
          </button>
        </form>

        <div className="relative border-t border-[rgba(246,241,233,0.09)] pt-4 text-center">
          <button
            onClick={handleGuestEnter}
            className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] py-2.5 text-xs font-mono text-[#B9C4CC] hover:text-[#F6F1E9] hover:border-[#4F9D8C] transition-all"
          >
            🚀 Continue as Demo Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
