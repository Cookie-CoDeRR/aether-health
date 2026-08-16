"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  MapPin,
  Pill,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
} from "lucide-react";

interface FloatingDockProps {
  onToggleMenu: () => void;
  onOpenTriagePrompt?: (initialQuery?: string) => void;
}

// Intent detector to navigate intelligently based on user phrasing
export function detectNavigationIntent(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Medication / Pharmacy / Prescriptions
  if (
    q.includes("find medication") ||
    q.includes("find medicine") ||
    q.includes("where is medication") ||
    q.includes("where is medicine") ||
    q.includes("medication section") ||
    q.includes("medicine section") ||
    q.includes("medication tracker") ||
    q.includes("prescriptions") ||
    q.includes("pharmacy") ||
    q.includes("pill tracker") ||
    q.includes("compare price") ||
    q.includes("drug price") ||
    q === "medications" ||
    q === "medicines"
  ) {
    return "/medicines";
  }

  // Doctor Consultation
  if (
    q.includes("find doctor") ||
    q.includes("doctor consultation") ||
    q.includes("specialist") ||
    q.includes("consultation") ||
    q === "doctors"
  ) {
    return "/discovery?tab=doctors";
  }

  // Hospital Radar / Map / Emergency Care
  if (
    q.includes("find hospital") ||
    q.includes("where is hospital") ||
    q.includes("nearby hospital") ||
    q.includes("hospital radar") ||
    q.includes("emergency room") ||
    q.includes("find clinic") ||
    q.includes("open map") ||
    q.includes("hospital map") ||
    q === "hospitals" ||
    q === "find care"
  ) {
    return "/discovery";
  }

  // Lab Reports / Diagnostics / Blood Test / OCR
  if (
    q.includes("lab report") ||
    q.includes("blood test") ||
    q.includes("upload report") ||
    q.includes("view report") ||
    q.includes("test results") ||
    q.includes("blood panel") ||
    q.includes("where is report") ||
    q.includes("ocr") ||
    q === "reports" ||
    q === "lab reports"
  ) {
    return "/reports";
  }

  // Health Timeline / Medical History
  if (
    q.includes("health timeline") ||
    q.includes("medical timeline") ||
    q.includes("history timeline") ||
    q.includes("where is timeline") ||
    q === "timeline"
  ) {
    return "/timeline";
  }

  // Settings / Profile / Account
  if (
    q.includes("settings") ||
    q.includes("my profile") ||
    q.includes("account details") ||
    q.includes("change language") ||
    q.includes("sign out") ||
    q === "profile" ||
    q === "settings"
  ) {
    return "/settings";
  }

  return null; // Health / Clinical symptom query -> /triage
}

function FloatingDockContent({
  onToggleMenu,
  onOpenTriagePrompt,
}: FloatingDockProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const [inputValue, setInputValue] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const isTriage = pathname === "/triage";

  // Keyboard shortcut listener (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenTriagePrompt?.(inputValue);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputValue, onOpenTriagePrompt]);

  // Voice speech-to-text recognition
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) {
      if (pathname !== "/triage") {
        router.push("/triage");
      }
      return;
    }

    // Check if user is asking for a specific section / feature
    const detectedNav = detectNavigationIntent(query);
    if (detectedNav) {
      setInputValue("");
      router.push(detectedNav);
      return;
    }

    // Otherwise, treat as Clinical Health/Symptom assessment
    onOpenTriagePrompt?.(query);
    setInputValue("");
  };

  const handleInputClick = () => {
    if (pathname !== "/triage" && !inputValue.trim()) {
      router.push("/triage");
    }
  };

  const navItems = [
    {
      id: "menu",
      label: "Navigation Menu",
      icon: <Menu className="w-4 h-4 text-[#064E3B]" />,
      onClick: onToggleMenu,
    },
    {
      id: "discovery",
      label: "Hospital Radar",
      icon: <MapPin className="w-4 h-4 text-[#064E3B]" />,
      href: "/discovery?tab=hospitals",
    },
    {
      id: "medicines",
      label: "Medication Tracker",
      icon: <Pill className="w-4 h-4 text-[#064E3B]" />,
      href: "/medicines",
    },
    {
      id: "doctors",
      label: "Doctor Consultations",
      icon: <Stethoscope className="w-4 h-4 text-[#064E3B]" />,
      href: "/discovery?tab=doctors",
    },
  ];

  return (
    <div
      className={`fixed bottom-6 z-50 max-w-[94vw] sm:max-w-2xl w-full px-2 pointer-events-none transition-all duration-500 ease-out ${
        isTriage
          ? "left-1/2 -translate-x-1/2 lg:left-[calc((100vw-380px)/2)] xl:left-[calc((100vw-410px)/2)]"
          : "left-1/2 -translate-x-1/2"
      }`}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-auto flex items-center justify-between gap-2.5 rounded-full bg-white/95 backdrop-blur-2xl border border-[#064E3B]/25 px-3 py-2 shadow-2xl ring-1 ring-[#064E3B]/10 text-[#064E3B]"
      >
        {/* Navigation Action Icons (Left side) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            // Strictly check distinct active state for discovery vs doctors tab
            let isActive = false;
            if (item.id === "discovery") {
              isActive = pathname === "/discovery" && currentTab !== "doctors";
            } else if (item.id === "doctors") {
              isActive =
                (pathname === "/discovery" && currentTab === "doctors") ||
                pathname === "/doctors";
            } else if (item.href) {
              isActive = pathname === item.href;
            }

            const ButtonContent = (
              <div
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-[#064E3B]/10 text-[#064E3B] ring-1 ring-[#064E3B]/30 font-bold shadow-2xs"
                    : "text-[#064E3B]/70 hover:bg-[#064E3B]/5 hover:text-[#064E3B] hover:scale-105 active:scale-95"
                }`}
              >
                {item.icon}

                {/* Animated Tooltip on Hover */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: -38, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="absolute whitespace-nowrap rounded-lg bg-[#064E3B] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl pointer-events-none"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href}>
                  {ButtonContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
              >
                {ButtonContent}
              </button>
            );
          })}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-[#064E3B]/20 shrink-0" />

        {/* Integrated Search / Prompt Capsule Bar (Right side) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          <div className="relative flex-1 flex items-center min-w-0 group">
            <span className="absolute left-3 flex items-center justify-center pointer-events-none text-[#064E3B]/70">
              <Sparkles className="w-3.5 h-3.5" />
            </span>

            <input
              type="text"
              value={inputValue}
              onClick={handleInputClick}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask symptoms or navigate (e.g. 'find medicines')..."
              className="w-full h-10 rounded-full bg-[#F9FBF9] border border-[#064E3B]/20 pl-9 pr-16 text-xs text-[#064E3B] placeholder-[#064E3B]/50 focus:bg-white focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]/20 transition-all truncate"
            />

            {/* Voice microphone button & shortcut tag */}
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1 rounded-full transition-colors ${
                  isListening
                    ? "bg-[#064E3B] text-white animate-pulse"
                    : "text-[#064E3B]/60 hover:text-[#064E3B]"
                }`}
                title={isListening ? "Listening..." : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>
              <kbd className="hidden sm:inline-flex items-center rounded-md border border-[#064E3B]/20 bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#064E3B]/60 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          <button
            type="submit"
            aria-label="Send symptom assessment or navigate"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#064E3B] hover:bg-[#043327] text-white font-bold transition-all shadow-md hover:scale-105 active:scale-95 min-tap-target"
          >
            <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function FloatingDock(props: FloatingDockProps) {
  return (
    <Suspense fallback={null}>
      <FloatingDockContent {...props} />
    </Suspense>
  );
}
