"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import ActionsGrid from "@/components/actions/ActionsGrid";
import {
  User,
  ShieldCheck,
  Globe,
  Key,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Terminal,
  Activity,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const {
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
    t,
  } = useSettings();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDevDrawerOpen, setIsDevDrawerOpen] = useState(false);

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

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto text-[#1E293B] w-full">
      {/* Page Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1E5D57] mb-1">
          Patient Preferences & Profile
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1E293B]">
          Settings & Profile
        </h1>
        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
          Manage your patient identity, language preferences, and personal health context for AI triage.
        </p>
      </div>

      {/* Account & Google Sync Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-4 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4F1] text-[#1E5D57]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#1E293B]">
                Account Synchronization
              </h3>
              <p className="text-xs text-[#64748B]">
                Securely sync health history across your devices
              </p>
            </div>
          </div>

          {!isGmailAuthenticated ? (
            <button
              onClick={handleGmailConnect}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] hover:bg-white hover:border-[#1E5D57] px-4 py-2 text-xs font-semibold text-[#1E293B] transition-all shadow-xs min-tap-target disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>{isSigningIn ? "Connecting..." : "Sync with Google"}</span>
            </button>
          ) : (
            <button
              onClick={signOutGmail}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#FDE6E2] bg-[#FEF4F2] hover:bg-[#FDE6E2] px-3.5 py-2 text-xs font-semibold text-[#C85339] transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}
        </div>

        {isGmailAuthenticated && (
          <div className="flex items-center gap-3.5 rounded-xl bg-[#F8FAF9] p-3.5 border border-[#E2E8F0] text-xs">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="h-10 w-10 rounded-full border border-[#D0EAE4] object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E5D57] text-white font-bold">
                {userName[0]}
              </div>
            )}
            <div className="space-y-0.5">
              <div className="font-semibold text-[#1E293B]">{userName}</div>
              <div className="text-[#1E5D57] font-medium">{userEmail}</div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Profile & Medical History Form */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-5 shadow-card">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4F1] text-[#1E5D57]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#1E293B]">
                Patient Identity & Medical History
              </h3>
              <p className="text-xs text-[#64748B]">
                Injected into AI triage so recommendations reflect your health profile
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-4.5 py-2 text-xs font-semibold text-white transition-all shadow-soft min-tap-target shrink-0"
          >
            {isSaved ? "✓ Profile Saved" : "Save Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Full Patient Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex Rivers"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] px-3.5 py-2.5 text-xs text-[#1E293B] focus:bg-white focus:outline-none focus:border-[#1E5D57]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
              Patient ID
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={userId}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F4] px-3.5 py-2.5 text-xs text-[#64748B] font-mono"
              />
              <button
                type="button"
                onClick={handleCopyId}
                className="rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAF9] px-3.5 py-2.5 text-xs text-[#1E293B] font-medium transition-all shadow-xs"
              >
                {copiedId ? <Check className="w-4 h-4 text-[#1E5D57]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
            Baseline Medical Conditions & Known Allergies
          </label>
          <textarea
            rows={3}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="e.g. Mild asthma, penicillin allergy, past kidney stone, high blood pressure..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] p-3 text-xs text-[#1E293B] leading-relaxed focus:bg-white focus:outline-none focus:border-[#1E5D57]"
          />
          <p className="text-[11px] text-[#64748B] mt-1">
            💡 Mentioning allergies helps Aether flag contraindicated medications automatically.
          </p>
        </div>
      </form>

      {/* Language Selector Grid */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4F1] text-[#1E5D57]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#1E293B]">
              Preferred Language
            </h3>
            <p className="text-xs text-[#64748B]">Select clinical navigation language</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all min-tap-target ${
                language === lang.code
                  ? "border-[#1E5D57] bg-[#E6F4F1] text-[#134E48] font-bold shadow-soft"
                  : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAF9]"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <span className="block text-xs font-semibold leading-tight">{lang.nativeName}</span>
                <span className="block text-[11px] text-[#64748B] mt-0.5">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Collapsible Developer / Operations Drawer */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAF9] overflow-hidden shadow-soft">
        <button
          type="button"
          onClick={() => setIsDevDrawerOpen(!isDevDrawerOpen)}
          className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[#F1F5F4]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#E2E8F0] text-[#64748B]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold text-[#1E293B]">
                Developer Tools & Telemetry Settings
              </span>
              <span className="block text-[11px] text-[#64748B]">
                External hospital webhooks, API keys & background action modules
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
            <span>{isDevDrawerOpen ? "Hide" : "Show"}</span>
            {isDevDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isDevDrawerOpen && (
          <div className="p-6 pt-2 border-t border-[#E2E8F0] bg-white space-y-6 animate-fade-in">
            {/* Hospital API Webhook Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#1E5D57]" />
                  <span>Hospital System Webhook API Key</span>
                </span>
                <span className="rounded-full bg-[#E6F4F1] text-[#134E48] text-[10px] px-2 py-0.5 font-bold">
                  Active
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 bg-[#F8FAF9] px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between font-mono text-xs text-[#1E293B]">
                  <span>{showKey ? hospitalApiKey : "••••••••••••••••••••••••••••••••"}</span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] text-[#1E5D57] hover:underline font-semibold"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAF9] px-3.5 py-2.5 text-xs text-[#1E293B] font-medium transition-all"
                >
                  {copiedKey ? "✓ Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={generateNewApiKey}
                  className="rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-4 py-2.5 text-xs font-semibold text-white transition-all"
                >
                  Generate New
                </button>
              </div>
            </div>

            {/* Embedded Action Modules */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1E5D57]" />
                  <span>System Action Modules & Diagnostics</span>
                </span>
                <Link
                  href="/actions"
                  className="text-xs text-[#1E5D57] hover:underline font-semibold"
                >
                  Full Operations Center →
                </Link>
              </div>
              <ActionsGrid />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
