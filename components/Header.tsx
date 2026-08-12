"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  pageTitle?: string;
  sessionEyebrow?: string;
}

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  pageTitle = "Symptom Triage",
  sessionEyebrow = "Session · Active Telemetry",
}: HeaderProps) {
  const {
    userId,
    userName,
    userEmail,
    userPhoto,
    isGmailAuthenticated,
    signInWithGmail,
    signOutGmail,
    theme,
    setTheme,
    language,
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
    <div className="relative flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] px-4 sm:px-9 py-4 bg-[#0F2130]/50 backdrop-blur-md z-30">
      {/* Left Title & Session Eyebrow */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-mono font-medium mb-0.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span>{sessionEyebrow}</span>
        </div>
        <h1 className="font-serif text-[20px] sm:text-[22px] font-medium tracking-[0.01em] text-[#F6F1E9]">
          {pageTitle}
        </h1>
      </div>

      {/* Right Controls & User Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gmail Sign In Button (When not connected) */}
        {!isGmailAuthenticated ? (
          <button
            onClick={handleGmailSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-2 rounded-full border border-[#4F9D8C]/40 bg-[#0F2130] px-3.5 py-1.5 text-xs font-mono font-bold text-[#F6F1E9] hover:bg-[#4F9D8C]/20 hover:border-[#4F9D8C] transition-all shadow-md shrink-0"
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
            <span className="hidden sm:inline">
              {isSigningIn ? "Connecting Gmail..." : "Sign in with Gmail"}
            </span>
            <span className="sm:hidden">{isSigningIn ? "..." : "Gmail Login"}</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-[#4F9D8C]/40 bg-[#4F9D8C]/15 px-3 py-1 text-[11px] font-mono text-[#4F9D8C] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D8C] animate-ping" />
            <span>✓ Gmail Connected</span>
          </div>
        )}

        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] text-[#B9C4CC] hover:text-[#F6F1E9] lg:hidden"
          aria-label="Toggle Navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 12h16M4 6h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* User Profile Badge Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-1.5 sm:pr-3.5 hover:border-[#E8674A]/50 transition-all shadow-md"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover border border-[#4F9D8C]"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8674A] font-serif text-xs font-bold text-[#0A1620]">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <span className="block font-medium text-xs text-[#F6F1E9] leading-none truncate max-w-[110px]">
                {userName}
              </span>
              <span className="block text-[10px] font-mono text-[#7C8A93] mt-0.5 truncate max-w-[110px]">
                {userEmail || `${userId.substring(0, 10)}...`}
              </span>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-[#7C8A93] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-4 shadow-2xl space-y-3 font-mono text-xs animate-fade-in">
                {/* Header Profile Info */}
                <div className="border-b border-[rgba(246,241,233,0.09)] pb-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F6F1E9] font-sans text-sm truncate">{userName}</span>
                    {isGmailAuthenticated ? (
                      <span className="rounded bg-[#4F9D8C]/20 text-[#4F9D8C] text-[9px] px-1.5 py-0.5 font-bold uppercase shrink-0">
                        Gmail Verified
                      </span>
                    ) : (
                      <span className="rounded bg-[#E8674A]/20 text-[#E8674A] text-[9px] px-1.5 py-0.5 font-bold uppercase shrink-0">
                        Guest
                      </span>
                    )}
                  </div>

                  {userEmail && (
                    <div className="text-[11px] text-[#4F9D8C] truncate font-mono">
                      📧 {userEmail}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#7C8A93] pt-0.5">
                    <span className="truncate">{userId}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-[#E8674A] hover:underline font-bold ml-1 shrink-0"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Gmail Login Action */}
                {!isGmailAuthenticated ? (
                  <button
                    onClick={handleGmailSignIn}
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white p-2.5 font-bold transition-all shadow-sm"
                  >
                    <span>🔑 Sign in with Gmail</span>
                  </button>
                ) : (
                  <div className="rounded-xl border border-[#4F9D8C]/30 bg-[#4F9D8C]/10 p-2.5 text-[11px] text-[#4F9D8C] font-semibold flex items-center justify-between">
                    <span>Account Synced via Firebase</span>
                    <button
                      onClick={async () => {
                        await signOutGmail();
                        setDropdownOpen(false);
                      }}
                      className="text-[#E8674A] hover:underline font-bold"
                    >
                      Disconnect
                    </button>
                  </div>
                )}

                {/* Quick Preferences */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7C8A93]">Theme:</span>
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="rounded bg-[#132A38] px-2.5 py-1 text-[#F6F1E9] hover:border-[#E8674A] border border-[rgba(246,241,233,0.09)]"
                    >
                      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7C8A93]">Language:</span>
                    <span className="text-[#4F9D8C] uppercase font-bold">{language}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[rgba(246,241,233,0.09)] space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg p-2 text-[#B9C4CC] hover:bg-[#132A38] hover:text-[#F6F1E9] transition-colors"
                  >
                    <span>⚙️</span>
                    <span>System Settings</span>
                  </Link>

                  <button
                    onClick={async () => {
                      await signOutGmail();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-lg p-2 text-[#E8674A] hover:bg-[#E8674A]/10 transition-colors text-left font-mono"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
