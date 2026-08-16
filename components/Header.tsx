"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { Menu, X, ShieldCheck, PhoneCall, ChevronDown, User, LogOut, Settings as SettingsIcon } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  pageTitle?: string;
  sessionEyebrow?: string;
}

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  pageTitle = "Care Today",
  sessionEyebrow,
}: HeaderProps) {
  const {
    userId,
    userName,
    userEmail,
    userPhoto,
    isGmailAuthenticated,
    signInWithGmail,
    signOutGmail,
  } = useSettings();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "AR";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGmailSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGmail();
    } catch (err: any) {
      alert(`Gmail Sign-In Error: ${err.message || "Failed to log in with Google."}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="relative flex items-center justify-between border-b border-[#064E3B]/15 bg-white px-4 sm:px-8 py-3.5 z-30 shadow-xs text-[#064E3B]">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#064E3B]/20 bg-[#F9FBF9] text-[#064E3B] hover:bg-[#064E3B]/5 transition-colors lg:hidden min-tap-target"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          {sessionEyebrow && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 mb-0.5">
              {sessionEyebrow}
            </div>
          )}
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#064E3B]">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Controls & Patient Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emergency Hotline Quick Access Pill */}
        <a
          href="tel:108"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#F9FBF9] border border-[#064E3B]/30 px-3.5 py-1.5 text-xs font-bold text-[#064E3B] hover:bg-[#064E3B] hover:text-white transition-colors shadow-2xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Emergency 108 / 112</span>
        </a>

        {/* Gmail Verification Pill */}
        {!isGmailAuthenticated ? (
          <button
            onClick={handleGmailSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-white hover:bg-[#F9FBF9] px-3.5 py-1.5 text-xs font-bold text-[#064E3B] transition-all shadow-2xs shrink-0 min-tap-target"
          >
            <span className="hidden sm:inline">
              {isSigningIn ? "Connecting..." : "Sync Account"}
            </span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#F9FBF9] border border-[#064E3B]/20 px-3 py-1 text-xs text-[#064E3B] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
            <span>Account Synced</span>
          </div>
        )}

        {/* User Profile Badge Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full border border-[#064E3B]/20 bg-white p-1 sm:pr-3 hover:border-[#064E3B] transition-all shadow-2xs min-tap-target"
            aria-label="User Profile Menu"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover border border-[#064E3B]"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#064E3B] font-sans text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <span className="block font-bold text-xs text-[#064E3B] leading-none truncate max-w-[120px]">
                {userName}
              </span>
              <span className="block text-[11px] text-[#064E3B]/70 mt-0.5 truncate max-w-[120px]">
                {userEmail || "Patient"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#064E3B]/70 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[#064E3B]/20 bg-white p-4 shadow-xl space-y-3 text-xs animate-fade-in text-[#064E3B]">
                {/* Header Profile Info */}
                <div className="border-b border-[#064E3B]/15 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#064E3B] text-sm truncate">{userName}</span>
                    <span className="rounded-full bg-[#F9FBF9] border border-[#064E3B]/20 text-[#064E3B] text-[10px] px-2 py-0.5 font-bold">
                      Patient
                    </span>
                  </div>

                  {userEmail && (
                    <div className="text-[11px] text-[#064E3B]/70 truncate">
                      {userEmail}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#064E3B]/60 pt-1">
                    <span className="truncate font-mono">ID: {userId.substring(0, 14)}...</span>
                    <button
                      onClick={handleCopyId}
                      className="text-[#064E3B] hover:underline font-bold ml-1 shrink-0"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-1 pt-1">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 text-[#064E3B] hover:bg-[#F9FBF9] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#064E3B]/70" />
                    <span className="font-bold">Settings & Profile</span>
                  </Link>

                  {isGmailAuthenticated && (
                    <button
                      onClick={async () => {
                        await signOutGmail();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl p-2.5 text-[#064E3B] hover:bg-[#F9FBF9] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-bold">Disconnect Account</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
