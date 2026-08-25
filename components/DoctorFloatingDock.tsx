"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Activity,
  Pill,
  FileText,
  Award,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface DoctorFloatingDockProps {
  onToggleMenu: () => void;
  onOpenDoctorPrompt?: (initialQuery?: string) => void;
}

function DoctorFloatingDockContent({
  onToggleMenu,
  onOpenDoctorPrompt,
}: DoctorFloatingDockProps) {
  const pathname = usePathname() || "";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) return;

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleDoctorSubmit(transcript);
      };

      recognition.start();
    } catch (err) {
      console.warn("Doctor speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleDoctorSubmit = (textOverride?: string) => {
    const text = (textOverride || query).trim().toLowerCase();
    if (!text) return;

    if (
      text.includes("profile") ||
      text.includes("credential") ||
      text.includes("license") ||
      text.includes("certificate") ||
      text.includes("college")
    ) {
      router.push("/doctor/profile");
      setQuery("");
      return;
    }

    if (text.includes("dispense") || text.includes("prescribe") || text.includes("medicine")) {
      router.push("/doctor");
      window.dispatchEvent(new CustomEvent("aether-doctor-switch-tab", { detail: { tab: "dispenser" } }));
      setQuery("");
      return;
    }

    if (text.includes("lab") || text.includes("cbc") || text.includes("wbc") || text.includes("report")) {
      router.push("/doctor");
      window.dispatchEvent(new CustomEvent("aether-doctor-switch-tab", { detail: { tab: "labs" } }));
      setQuery("");
      return;
    }

    if (text.includes("sbar") || text.includes("handover") || text.includes("summary")) {
      router.push("/doctor");
      window.dispatchEvent(new CustomEvent("aether-doctor-switch-tab", { detail: { tab: "handover" } }));
      setQuery("");
      return;
    }

    // Default: route to doctor queue / copilot
    router.push("/doctor");
    window.dispatchEvent(new CustomEvent("aether-doctor-copilot-query", { detail: { query: text } }));
    setQuery("");
  };

  const navItems = [
    {
      id: "menu",
      label: "Clinical Menu",
      icon: <Menu className="w-4 h-4" />,
      onClick: onToggleMenu,
    },
    {
      id: "queue",
      label: "Patient Queue",
      icon: <Activity className="w-4 h-4" />,
      href: "/doctor",
      activeMatch: pathname === "/doctor",
    },
    {
      id: "profile",
      label: "Doctor Profile & NMC",
      icon: <Award className="w-4 h-4" />,
      href: "/doctor/profile",
      activeMatch: pathname === "/doctor/profile",
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl px-2">
      <div className="relative flex items-center justify-between gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-white/85 dark:bg-[#0B1D17]/85 backdrop-blur-xl border border-[#064E3B]/20 dark:border-white/15 shadow-2xl transition-all">
        {/* Clinician Quick Action Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDoctorSubmit();
          }}
          className="flex-1 flex items-center gap-1.5 bg-[#F9FBF9] dark:bg-[#0F241E] rounded-full px-3 py-1.5 border border-[#064E3B]/15 dark:border-white/10 transition-all focus-within:border-[#064E3B] dark:focus-within:border-[#10B981] min-w-0"
        >
          <Stethoscope className="w-3.5 h-3.5 text-emerald-700 dark:text-[#10B981] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search patient, labs, dispense meds, or ask Copilot..."
            className="flex-1 bg-transparent text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/50 dark:placeholder-white/40 focus:outline-none min-w-0"
          />

          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleVoiceInput}
              title={isListening ? "Listening..." : "Voice Dictation"}
              className={`p-1 rounded-full transition-colors ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
          )}

          {query.trim() && (
            <button
              type="submit"
              className="p-1 rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] hover:scale-105 transition-transform"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Doctor Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {navItems.map((item) => {
            if (item.href) {
              const isActive = item.activeMatch;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center justify-center h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#064E3B] text-white dark:bg-[#10B981] dark:text-[#042F24] shadow-xs"
                      : "bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#ECFDF5] hover:bg-emerald-50 dark:hover:bg-[#132D26]"
                  }`}
                >
                  {item.icon}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                title={item.label}
                className="flex items-center justify-center h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#ECFDF5] hover:bg-emerald-50 dark:hover:bg-[#132D26] transition-all cursor-pointer"
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DoctorFloatingDock(props: DoctorFloatingDockProps) {
  return (
    <Suspense fallback={null}>
      <DoctorFloatingDockContent {...props} />
    </Suspense>
  );
}
