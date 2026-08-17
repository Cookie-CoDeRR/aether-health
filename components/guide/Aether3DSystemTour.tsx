"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Building2,
  Pill,
  FileText,
  Clock,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface Aether3DSystemTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  route: string;
  description: string;
  highlights: string[];
  icon: any;
  accentColor: string;
  arrowDirection: "top" | "bottom" | "left" | "right" | "center";
  calloutPosition: string; // Tailwind placement classes
  focusLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "triage",
    stepNumber: 1,
    badge: "Step 1 of 6 • AI Clinical Care",
    title: "AI Triage & Symptom Assessment",
    route: "/triage",
    description:
      "Describe symptoms naturally in plain words. Aether delivers simplified, reassuring care advice while automatically cross-referencing your personal allergy profile and lab history.",
    highlights: [
      "Plain-language advice by default with 1-click in-depth clinical reports",
      "Automatic penicillin allergy & baseline history cross-referencing",
      "Instant specialist recommendation & follow-up symptom questions",
    ],
    icon: Stethoscope,
    accentColor: "#10B981",
    arrowDirection: "bottom",
    calloutPosition: "bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2",
    focusLabel: "Symptom Prompt & Clinical Consultation Stream",
  },
  {
    id: "discovery",
    stepNumber: 2,
    badge: "Step 2 of 6 • Care Discovery",
    title: "Hospital Radar & Doctor Finder",
    route: "/discovery",
    description:
      "Locate 24/7 emergency ICUs and ABDM verified specialists with real-time GPS proximity, interactive OpenStreetMap radar, and direct navigation.",
    highlights: [
      "Real-time GPS proximity radar & custom radius slider",
      "Emergency 24/7 ICU toggle for immediate urgent care routing",
      "Verified hospital doctor roster with instant appointment booking",
    ],
    icon: Building2,
    accentColor: "#0284C7",
    arrowDirection: "top",
    calloutPosition: "top-20 sm:top-24 left-1/2 -translate-x-1/2",
    focusLabel: "Live OpenStreetMap Radar & Verified Specialists",
  },
  {
    id: "medicines",
    stepNumber: 3,
    badge: "Step 3 of 6 • Smart Pharmacy",
    title: "Prescription Schedule & Safety",
    route: "/medicines",
    description:
      "Track your active prescriptions, monitor daily dosage schedules, and check for severe contraindications and drug-allergy interactions before taking any medicine.",
    highlights: [
      "Allergy safety shield checking every medication against your profile",
      "Morning, afternoon, and evening pill schedule timeline",
      "Refill tracking with remaining dosage count alerts & pharmacy pricing",
    ],
    icon: Pill,
    accentColor: "#D97706",
    arrowDirection: "top",
    calloutPosition: "top-20 sm:top-24 left-1/2 -translate-x-1/2",
    focusLabel: "Medication Reminders & Drug-Allergy Interaction Guard",
  },
  {
    id: "reports",
    badge: "Step 4 of 6 • Diagnostics",
    stepNumber: 4,
    title: "Clinical Lab Reports & OCR",
    route: "/reports",
    description:
      "Upload blood work, diagnostic scans, and clinical PDFs. Aether's AI extracts biometric markers and plots your healthy ranges over time.",
    highlights: [
      "AI OCR extraction for CBC panels, creatinine, glucose, and lipids",
      "Instant out-of-range flag warnings (e.g. elevated WBC count)",
      "Longitudinal visual trends across previous months",
    ],
    icon: FileText,
    accentColor: "#7C3AED",
    arrowDirection: "top",
    calloutPosition: "top-20 sm:top-24 left-1/2 -translate-x-1/2",
    focusLabel: "Diagnostic PDF/Image Upload Dropzone & Biomarkers",
  },
  {
    id: "timeline",
    stepNumber: 5,
    badge: "Step 5 of 6 • Health History",
    title: "Patient Care Journey & Milestones",
    route: "/timeline",
    description:
      "A continuous chronological record connecting all doctor consultations, hospital admissions, lab tests, and symptom assessments into a single coherent story.",
    highlights: [
      "Unified chronological milestone history",
      "Interactive category filters (Symptoms, Labs, Consultations)",
      "Clinical notes and actionable doctor clearance certificates",
    ],
    icon: Clock,
    accentColor: "#0D9488",
    arrowDirection: "top",
    calloutPosition: "top-20 sm:top-24 left-1/2 -translate-x-1/2",
    focusLabel: "Longitudinal Milestone Timeline & Clearance Records",
  },
  {
    id: "settings",
    stepNumber: 6,
    badge: "Step 6 of 6 • Identity & Themes",
    title: "Settings & Personal Identity",
    route: "/settings",
    description:
      "Customize your clinical preferences, update drug allergies and chronic conditions, toggle between Obsidian Dark and Ivory Light themes, or replay this interactive guide anytime.",
    highlights: [
      "Obsidian Forest dark mode & Botanical Ivory light mode switcher",
      "Custom medical history, allergies, and ABDM Patient Health ID",
      "Re-open and explore this interactive guide whenever you wish",
    ],
    icon: Sliders,
    accentColor: "#10B981",
    arrowDirection: "top",
    calloutPosition: "top-20 sm:top-24 left-1/2 -translate-x-1/2",
    focusLabel: "Allergy Context, Lighting Themes & ABDM Integration",
  },
];

export default function Aether3DSystemTour({
  isOpen,
  onClose,
}: Aether3DSystemTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const step = TOUR_STEPS[currentStepIndex];

  // When step changes, navigate to that live page automatically!
  useEffect(() => {
    if (!isOpen) return;
    const targetRoute = TOUR_STEPS[currentStepIndex].route;
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  }, [isOpen, currentStepIndex, pathname, router]);

  // Keyboard navigation (Esc to close, Arrow keys for step navigation)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleComplete();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_onboarding_completed", "true");
    }
    onClose();
  };

  if (!isOpen) return null;

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden animate-fade-in font-sans">
      {/* Industrial Frosted Spotlight Backdrop */}
      <div
        onClick={handleComplete}
        className="absolute inset-0 bg-[#064E3B]/30 dark:bg-black/60 backdrop-blur-[3px] transition-all duration-500 cursor-pointer"
        title="Click anywhere to exit tour"
      />

      {/* Top Banner Guide HUD Indicator */}
      <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-white/90 dark:bg-[#0B1D17]/90 backdrop-blur-2xl border border-[#064E3B]/20 dark:border-white/15 px-4 py-2 shadow-xl text-xs text-[#064E3B] dark:text-[#ECFDF5]">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="font-serif font-bold">Interactive App Guide</span>
        <span className="text-[#064E3B]/40 dark:text-white/30">•</span>
        <span className="font-mono font-bold text-[#064E3B]/80 dark:text-[#10B981]">
          {step.stepNumber} of {TOUR_STEPS.length}
        </span>
        <button
          type="button"
          onClick={handleComplete}
          className="ml-2 rounded-full p-1 hover:bg-[#064E3B]/10 dark:hover:bg-white/10 text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B] dark:hover:text-white transition-colors"
          title="Exit Guide"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Guided Callout Box with Directional Highlight Arrow */}
      <div
        className={`absolute z-50 w-[94vw] max-w-lg ${step.calloutPosition} transition-all duration-500 ease-out`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.94, y: step.arrowDirection === "top" ? -15 : 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: step.arrowDirection === "top" ? -15 : 15 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative rounded-3xl border border-[#064E3B]/25 dark:border-white/20 bg-white/95 dark:bg-[#0B1D17]/95 backdrop-blur-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(6,78,59,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-[#064E3B] dark:text-[#ECFDF5] space-y-4"
          >
            {/* Directional Pointing Arrow (Industrial Tooltip Bevel) */}
            {step.arrowDirection === "top" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div
                  className="w-0 h-0 border-x-8 border-x-transparent border-b-12 border-b-white/95 dark:border-b-[#0B1D17]/95 drop-shadow-sm"
                  style={{ borderBottomColor: undefined }}
                />
              </div>
            )}

            {step.arrowDirection === "bottom" && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-0 h-0 border-x-8 border-x-transparent border-t-12 border-t-white/95 dark:border-t-[#0B1D17]/95 drop-shadow-sm" />
              </div>
            )}

            {/* Header: Badge & Target Section Label */}
            <div className="flex items-start justify-between gap-3 border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-2xl shadow-xs shrink-0"
                  style={{
                    backgroundColor: `${step.accentColor}18`,
                    color: step.accentColor,
                  }}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className="block text-[11px] font-bold uppercase tracking-wider leading-none"
                    style={{ color: step.accentColor }}
                  >
                    {step.badge}
                  </span>
                  <h3 className="font-serif text-lg font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5] mt-1 leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>

              <span className="rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/15 dark:border-white/10 px-2.5 py-1 text-[10.5px] font-mono font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                {step.stepNumber}/6
              </span>
            </div>

            {/* Target Area Indicator */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/10 dark:border-white/5 px-3 py-1.5 text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]">
              <Compass className="w-3.5 h-3.5 shrink-0" style={{ color: step.accentColor }} />
              <span className="font-medium truncate">
                Focus: <strong>{step.focusLabel}</strong>
              </span>
            </div>

            {/* Description Body */}
            <p className="text-xs sm:text-sm text-[#064E3B]/85 dark:text-[#ECFDF5]/85 leading-relaxed">
              {step.description}
            </p>

            {/* Feature Highlights List */}
            <div className="space-y-1.5 pt-0.5">
              {step.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90">
                  <CheckCircle2
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: step.accentColor }}
                  />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {/* Bottom Controls: Step Dots & Next / Back / Skip Buttons */}
            <div className="flex items-center justify-between border-t border-[#064E3B]/15 dark:border-white/10 pt-4 gap-3">
              {/* Step Dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    aria-label={`Jump to step ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentStepIndex === idx
                        ? "w-6 bg-[#064E3B] dark:bg-[#10B981]"
                        : "w-2 bg-[#064E3B]/20 dark:bg-white/20 hover:bg-[#064E3B]/40"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="rounded-2xl px-3 py-1.5 text-xs font-semibold text-[#064E3B]/70 dark:text-white/60 hover:text-[#064E3B] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>

                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] px-4.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-soft hover:scale-105 active:scale-95"
                >
                  <span>
                    {currentStepIndex === TOUR_STEPS.length - 1 ? "Finish & Start" : "Next Page"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
