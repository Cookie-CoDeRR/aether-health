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
  const { userId, userName, theme, setTheme, language, t } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="relative flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] px-6 py-4 sm:px-9 bg-[#0F2130]/50 backdrop-blur-md z-30">
      {/* Left Title & Session Eyebrow */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-mono font-medium mb-0.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span>{sessionEyebrow}</span>
        </div>
        <h1 className="font-serif text-[22px] font-medium tracking-[0.01em] text-[#F6F1E9]">
          {pageTitle}
        </h1>
      </div>

      {/* Right Controls & User Profile Badge */}
      <div className="flex items-center gap-3">
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
            className="flex items-center gap-3 rounded-full border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-1.5 pr-4 hover:border-[#E8674A]/50 transition-all shadow-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8674A] font-serif text-xs font-bold text-[#0A1620]">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-medium text-xs text-[#F6F1E9] leading-none">
                {userName}
              </span>
              <span className="block text-[10px] font-mono text-[#7C8A93] mt-0.5">
                {userId.substring(0, 14)}...
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
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-4 shadow-2xl space-y-3 font-mono text-xs animate-fade-in">
                {/* Header Profile Info */}
                <div className="border-b border-[rgba(246,241,233,0.09)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F6F1E9] font-sans text-sm">{userName}</span>
                    <span className="rounded bg-[#4F9D8C]/20 text-[#4F9D8C] text-[9px] px-1.5 py-0.5 font-bold uppercase">
                      Patient
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#7C8A93]">
                    <span className="truncate">{userId}</span>
                    <button
                      onClick={handleCopyId}
                      className="text-[#E8674A] hover:underline font-bold ml-1 shrink-0"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Quick Preferences */}
                <div className="space-y-2">
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

                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg p-2 text-[#E8674A] hover:bg-[#E8674A]/10 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
