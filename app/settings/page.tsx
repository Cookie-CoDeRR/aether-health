"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import {
  User,
  ShieldCheck,
  Globe,
  Key,
  Copy,
  Check,
  Terminal,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Heart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

type SettingsTab = "appearance" | "profile" | "language" | "integrations";

const COMMON_ALLERGIES = [
  "Penicillin",
  "Sulfa Drugs",
  "Aspirin / NSAIDs",
  "Asthma",
  "Type 2 Diabetes",
  "Hypertension",
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    userId,
    userName,
    userEmail,
    userPhoto,
    isGmailAuthenticated,
    signInWithGmail,
    signOutGmail,
    setUserName,
    medicalHistory,
    setMedicalHistory,
    hospitalApiKey,
    generateNewApiKey,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutGmail();
    } catch (err) {
      console.warn("Sign out warning:", err);
    } finally {
      router.push("/");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(hospitalApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGmailConnect = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGmail();
    } catch (err: any) {
      alert(`Gmail Sign-In Error: ${err.message || "Failed to sign in with Google."}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const toggleAllergyChip = (chip: string) => {
    if (medicalHistory.includes(chip)) {
      const updated = medicalHistory
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s.toLowerCase() !== chip.toLowerCase())
        .join(", ");
      setMedicalHistory(updated);
    } else {
      const updated = medicalHistory.trim()
        ? `${medicalHistory.trim()}, ${chip}`
        : chip;
      setMedicalHistory(updated);
    }
  };

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto text-[#064E3B] dark:text-[#ECFDF5] w-full pb-44 sm:pb-52 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064E3B]/15 dark:border-white/10 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 dark:text-[#10B981] mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences & Account</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
            Settings
          </h1>
        </div>

        {/* User Identity, 3D Guide & Sign Out Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("aether-open-guide"))}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs cursor-pointer min-tap-target"
            title="Explore 3D Interactive Page Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
            <span className="hidden sm:inline">3D Guide</span>
          </button>

          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/10 px-3.5 py-1.5 text-xs shadow-2xs">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="h-6 w-6 rounded-full object-cover border border-[#064E3B]/30" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] font-bold text-[10px]">
                {userName[0]}
              </div>
            )}
            <div className="min-w-0">
              <span className="block font-bold text-[#064E3B] dark:text-[#ECFDF5] truncate max-w-[140px]">{userName}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all shadow-2xs cursor-pointer min-tap-target"
            title="Sign out and return to landing page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Segmented Category Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "appearance", label: "Appearance", icon: <Sun className="w-4 h-4" /> },
          { id: "profile", label: "Patient Profile", icon: <User className="w-4 h-4" /> },
          { id: "language", label: "Language", icon: <Globe className="w-4 h-4" /> },
          { id: "integrations", label: "Integrations & API", icon: <Key className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all min-tap-target cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-soft"
                : "bg-white dark:bg-[#0B1D17] border border-[#064E3B]/20 dark:border-white/10 text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#F9FBF9] dark:hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: APPEARANCE & THEME ================= */}
      {activeTab === "appearance" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Theme & Lighting
              </h3>
              <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                Select your clinical interface lighting preference
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all min-tap-target overflow-hidden cursor-pointer ${
                  theme === "dark"
                    ? "border-[#10B981] bg-[#0F241E] text-[#ECFDF5] font-bold shadow-md ring-2 ring-[#10B981]/40"
                    : "border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E]/40 text-[#064E3B] dark:text-[#ECFDF5]/70 hover:bg-white dark:hover:bg-[#0F241E]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#081511] text-emerald-400 border border-white/15 shadow-sm">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === "dark" && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#10B981] text-[#042F24]">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <span className="block text-sm font-bold">Obsidian Forest (Dark Mode)</span>
                  <span className="block text-xs text-[#A7F3D0]/80 font-normal">
                    Deep emerald glassmorphism with glowing bioluminescent animations.
                  </span>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all min-tap-target overflow-hidden cursor-pointer ${
                  theme === "light"
                    ? "border-[#064E3B] bg-white text-[#064E3B] font-bold shadow-md ring-2 ring-[#064E3B]/30"
                    : "border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E]/40 text-[#064E3B] dark:text-[#ECFDF5]/70 hover:bg-white dark:hover:bg-[#0F241E]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9FBF9] text-amber-500 border border-[#064E3B]/20 shadow-sm">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === "light" && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#064E3B] text-white">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <span className="block text-sm font-bold">Botanical Ivory (Light Mode)</span>
                  <span className="block text-xs text-[#064E3B]/70 dark:text-white/50 font-normal">
                    Bright crisp ivory canvas with organic botanical branch styling.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive 3D System Guide Replay Card */}
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Interactive 3D System Tour
                  </h3>
                  <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                    Explore what each page and feature in Aether does with interactive 3D telemetry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("aether-open-guide"))}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] font-bold text-xs px-5 py-2.5 transition-all shadow-soft hover:scale-105 active:scale-95 cursor-pointer min-tap-target shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Replay 3D Tour</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PATIENT PROFILE ================= */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Patient Medical Identity
                </h3>
                <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                  Pre-populates clinical context during emergency triage
                </p>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-soft min-tap-target shrink-0 cursor-pointer"
              >
                {isSaved ? "✓ Saved" : "Save Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1.5">
                  Patient Health ID (ABDM)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={userId}
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 py-2.5 text-xs text-[#064E3B]/70 dark:text-white/60 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] font-bold transition-all"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Allergies & Medical Conditions Chips */}
            <div className="space-y-2 pt-2 border-t border-[#064E3B]/10 dark:border-white/10">
              <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Quick Allergy & Health Profile Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((tag) => {
                  const isSelected = medicalHistory.toLowerCase().includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleAllergyChip(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border min-tap-target cursor-pointer ${
                        isSelected
                          ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] border-[#064E3B] dark:border-[#10B981] shadow-2xs"
                          : "bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#ECFDF5] border-[#064E3B]/20 dark:border-white/15 hover:bg-white dark:hover:bg-white/10"
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1.5">
                Custom Notes & Medical History
              </label>
              <textarea
                rows={3}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Penicillin allergy, mild seasonal asthma, past appendectomy..."
                className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] leading-relaxed focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
              />
            </div>
          </div>

          {/* Account Session & Exit to Landing Page */}
          <div className="rounded-3xl border border-rose-500/20 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-rose-950 dark:text-rose-100">
                    Sign Out & Return Home
                  </h3>
                  <p className="text-xs text-rose-800/70 dark:text-rose-300/70">
                    End your active session and return to the main landing page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer min-tap-target"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Return Home</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 3: LANGUAGE ================= */}
      {activeTab === "language" && (
        <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-5 shadow-xs animate-fade-in">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              Preferred Language
            </h3>
            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
              Select your language for clinical guidance and symptoms triage
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all min-tap-target cursor-pointer ${
                  language === lang.code
                    ? "border-[#064E3B] dark:border-[#10B981] bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#10B981] font-bold shadow-soft ring-1 ring-emerald-500/20"
                    : "border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] text-[#064E3B]/80 dark:text-[#ECFDF5]/80 hover:bg-[#F9FBF9] dark:hover:bg-white/5"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <span className="block text-xs font-bold leading-tight">{lang.nativeName}</span>
                  <span className="block text-[11px] text-[#064E3B]/60 dark:text-white/40 mt-0.5">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: INTEGRATIONS & API ================= */}
      {activeTab === "integrations" && (
        <div className="space-y-4 animate-fade-in">
          {/* Google Sync Card */}
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Google Cloud Health Sync
                  </h3>
                  <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                    Sync prescriptions and reports across all authenticated devices
                  </p>
                </div>
              </div>

              {!isGmailAuthenticated ? (
                <button
                  onClick={handleGmailConnect}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white dark:hover:bg-[#132D26] px-4 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-xs min-tap-target disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                  </svg>
                  <span>{isSigningIn ? "Connecting..." : "Connect Google Account"}</span>
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out & Disconnect</span>
                </button>
              )}
            </div>
          </div>

          {/* Hospital Webhook API Key */}
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Hospital Webhook API Key
                  </h3>
                  <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                    Use for EHR system integrations and remote doctor dispatch
                  </p>
                </div>
              </div>

              <Link
                href="/actions"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#064E3B] dark:text-[#10B981] hover:underline"
              >
                <span>Actions Center</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 py-2.5 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 flex items-center justify-between font-mono text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                <span>{showKey ? hospitalApiKey : "••••••••••••••••••••••••••••••••"}</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] text-[#064E3B] dark:text-[#10B981] hover:underline font-bold ml-2"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyKey}
                className="rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-4 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] font-bold transition-all"
              >
                {copiedKey ? "✓ Copied" : "Copy"}
              </button>

              <button
                type="button"
                onClick={generateNewApiKey}
                className="rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4 py-2.5 text-xs font-bold text-white dark:text-[#042F24] transition-all"
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
