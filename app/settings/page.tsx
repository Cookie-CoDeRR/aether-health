"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export default function SettingsPage() {
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
    t,
  } = useSettings();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

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
    <div className="space-y-8 animate-fade-in p-6 lg:p-12 max-w-4xl mx-auto text-[#F6F1E9]">
      {/* Page Header */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-4">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[#E8674A] font-mono font-semibold mb-1">
          System Preferences & Governance
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-[0.01em] text-[#F6F1E9]">
          {t("settingsTitle")}
        </h1>
        <p className="text-xs text-[#7C8A93] mt-1 leading-relaxed">
          {t("settingsSub")}
        </p>
      </div>

      {/* Gmail Authentication & SSO Governance Card */}
      <div className="rounded-2xl border border-[#4F9D8C]/30 bg-[#0F2130] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[rgba(246,241,233,0.09)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#4F9D8C] bg-[#4F9D8C]/10 px-2 py-0.5 rounded border border-[#4F9D8C]/30">
                Firebase OAuth 2.0 Active
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-[#F6F1E9] mt-1">
              Gmail & Google SSO Authentication
            </h3>
            <p className="text-xs text-[#B9C4CC] mt-0.5">
              Connect your official Google account to sync health records across sessions securely.
            </p>
          </div>

          {!isGmailAuthenticated ? (
            <button
              onClick={handleGmailConnect}
              disabled={isSigningIn}
              className="rounded-xl bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white font-mono px-5 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>{isSigningIn ? "Connecting Gmail..." : "Sign in with Gmail"}</span>
            </button>
          ) : (
            <button
              onClick={signOutGmail}
              className="rounded-xl border border-[#D14343]/50 bg-[#D14343]/10 hover:bg-[#D14343] hover:text-white font-mono px-4 py-2 text-xs font-bold text-[#D14343] transition-all"
            >
              Sign Out of Gmail
            </button>
          )}
        </div>

        {isGmailAuthenticated && (
          <div className="flex items-center gap-4 rounded-xl bg-[#132A38] p-4 border border-[rgba(246,241,233,0.09)] font-mono text-xs">
            {userPhoto && (
              <img src={userPhoto} alt={userName} className="h-12 w-12 rounded-full border-2 border-[#4F9D8C] object-cover" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold text-[#F6F1E9] text-sm">{userName}</div>
              <div className="text-[#4F9D8C]">📧 {userEmail}</div>
              <div className="text-[10px] text-[#7C8A93]">Firebase UID: {userId}</div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Profile & Preprompt Background History Card */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/20">
                Gemini AI Preprompt Active
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-[#F6F1E9] mt-1">
              Patient Identity & Baseline Medical History Profile
            </h3>
            <p className="text-xs text-[#7C8A93] mt-0.5">
              This information is injected as context into Gemini 1.5 Flash AI Triage so the AI understands your baseline health conditions.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[#E8674A] px-4.5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-110 transition-all shadow-md shrink-0"
          >
            {isSaved ? "✓ Saved to AI Preprompt" : "Save Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
              Full Patient Name
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alex Rivers"
              className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
              AETHER Patient Identifier
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={userId}
                className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38]/60 px-3.5 py-2.5 text-xs text-[#7C8A93] font-mono"
              />
              <button
                type="button"
                onClick={handleCopyId}
                className="rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs font-mono text-[#F6F1E9] hover:bg-[#E8674A] hover:text-[#0A1620] transition-all"
              >
                {copiedId ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
            Baseline Medical Conditions & History (Injected into AI Triage)
          </label>
          <textarea
            rows={3}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="e.g. 34-year-old with mild asthma, penicillin allergy, and previous high blood pressure..."
            className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-3 text-xs text-[#F6F1E9] font-sans leading-relaxed focus:outline-none focus:border-[#E8674A]"
          />
        </div>
      </form>

      {/* Language Selector Grid */}
      <div className="rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-6 space-y-4 shadow-lg">
        <div>
          <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
            {t("languageSection")}
          </h3>
          <p className="text-xs text-[#7C8A93] mt-0.5">Select preferred localized clinical navigation language.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                language === lang.code
                  ? "border-[#E8674A] bg-[#E8674A]/15 text-[#F6F1E9] font-bold shadow-md"
                  : "border-[rgba(246,241,233,0.09)] bg-[#132A38] text-[#B9C4CC] hover:bg-[#F6F1E9]/5"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <span className="block text-xs font-sans leading-tight">{lang.nativeName}</span>
                <span className="block text-[10px] font-mono text-[#7C8A93] mt-0.5">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Display Theme Selector */}
      <div className="rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-6 space-y-4 shadow-lg">
        <div>
          <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
            {t("themeSection")}
          </h3>
          <p className="text-xs text-[#7C8A93] mt-0.5">Toggle high-contrast clinical monitor or daylight paper theme.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme("dark")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === "dark"
                ? "border-[#E8674A] bg-[#132A38] ring-2 ring-[#E8674A]"
                : "border-[rgba(246,241,233,0.09)] bg-[#132A38]/50 hover:bg-[#132A38]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🌙</span>
              {theme === "dark" && (
                <span className="text-[10px] font-mono font-bold text-[#E8674A] uppercase bg-[#E8674A]/10 px-2 py-0.5 rounded">
                  Selected
                </span>
              )}
            </div>
            <h4 className="font-serif text-base font-medium text-[#F6F1E9]">{t("darkTheme")}</h4>
            <p className="text-xs text-[#7C8A93] mt-1">High contrast dark monitor telemetry palette.</p>
          </button>

          <button
            onClick={() => setTheme("light")}
            className={`p-5 rounded-2xl border text-left transition-all ${
              theme === "light"
                ? "border-[#EAE4D6] bg-[#EAE4D6] text-[#0A1620] ring-2 ring-[#E8674A]"
                : "border-[rgba(246,241,233,0.09)] bg-[#132A38]/50 hover:bg-[#132A38]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">☀️</span>
              {theme === "light" && (
                <span className="text-[10px] font-mono font-bold text-[#E8674A] uppercase bg-[#E8674A]/10 px-2 py-0.5 rounded">
                  Selected
                </span>
              )}
            </div>
            <h4 className={`font-serif text-base font-medium ${theme === "light" ? "text-[#0A1620]" : "text-[#F6F1E9]"}`}>
              {t("lightTheme")}
            </h4>
            <p className={`text-xs mt-1 ${theme === "light" ? "text-[#647481]" : "text-[#7C8A93]"}`}>
              Clean daylight paper clinical aesthetic.
            </p>
          </button>
        </div>
      </div>

      {/* External Hospital System API Webhook Secret Generator */}
      <div className="rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
              {t("apiSection")}
            </h3>
            <p className="text-xs text-[#7C8A93] mt-0.5">{t("apiSub")}</p>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-1 rounded border border-[#00F0FF]/20">
            {t("hospitalSyncStatus")}
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <label className="block text-[10px] uppercase text-[#7C8A93]">
            {t("apiKeyLabel")}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-[#132A38] px-4 py-3 rounded-xl border border-[rgba(246,241,233,0.16)] flex items-center justify-between">
              <span className="text-[#B9C4CC] font-bold">
                {showKey ? hospitalApiKey : "••••••••••••••••••••••••••••••••"}
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-[#E8674A] hover:underline ml-2"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={handleCopyKey}
              className="rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-4 py-3 text-xs text-[#F6F1E9] hover:bg-[#4F9D8C] transition-all shrink-0"
            >
              {copiedKey ? "✓ " + t("copied") : t("copyId")}
            </button>

            <button
              onClick={generateNewApiKey}
              className="rounded-xl bg-[#E8674A] px-4 py-3 text-xs font-semibold text-[#0A1620] hover:brightness-110 transition-all shrink-0"
            >
              {t("genKey")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
