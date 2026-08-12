"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";
import AuthModal from "@/components/landing/AuthModal";
import AnalyticsSection from "@/components/landing/AnalyticsSection";
import CustomCursor from "@/components/landing/CustomCursor";
import { useSettings } from "@/context/SettingsContext";

// Dynamically import WebGL Three.js ambient background canvas with SSR disabled
const ThreeMedicalCanvas = dynamic(
  () => import("@/components/landing/ThreeMedicalCanvas"),
  { ssr: false }
);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function StartPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const { isGmailAuthenticated } = useSettings();
  const router = useRouter();

  // Automatic Persistent Session Check & Auto-Redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthActive = localStorage.getItem("aether_auth_active") === "true";
      const userProfile = localStorage.getItem("aether_user_profile");

      if (isGmailAuthenticated || isAuthActive || userProfile) {
        router.replace("/triage");
      }
    }
  }, [isGmailAuthenticated, router]);

  const openAuth = (tab: "signin" | "signup") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0A1620] text-[#F6F1E9] overflow-x-hidden selection:bg-[#E8674A] selection:text-[#0A1620] transition-colors">
      {/* Fast Mouse Cursor Follower */}
      <CustomCursor />

      {/* 3D WebGL Ambient Fluid Background Canvas */}
      <ThreeMedicalCanvas />

      {/* Landing Top Header Bar */}
      <LandingHeader onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Tagline Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-[#E8674A]/40 bg-[#132A38] backdrop-blur-md px-4.5 py-1.5 text-xs font-mono text-[#E8674A] shadow-xl">
            <span className="h-2 w-2 rounded-full bg-[#E8674A] animate-pulse" />
            <span>AETHER Healthcare Platform • Signal v3</span>
            <span className="text-[#7C8A93]">•</span>
            <span className="text-[#4F9D8C]">Google AI Studio Gemini 1.5 Flash</span>
          </motion.div>

          {/* Large Hero Title */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-[#F6F1E9] leading-tight">
              AETHER <em className="not-italic text-[#E8674A] font-serif">Health Navigation</em>
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#B9C4CC] font-sans leading-relaxed font-light">
              An intelligent, zero-cost healthcare navigation ecosystem combining OpenStreetMap emergency discovery, AI symptom triage, lab report OCR extraction, and specialist booking.
            </p>
          </motion.div>

          {/* CTA Buttons for Sign In / Sign Up */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => openAuth("signup")}
              className="interactive-hover group relative inline-flex items-center gap-3 rounded-2xl bg-[#E8674A] px-8 py-4 text-base font-semibold text-[#0A1620] shadow-2xl shadow-[#E8674A]/30 hover:brightness-110 transition-all duration-200"
            >
              <span>Get Started / Create Account</span>
              <span className="font-mono text-sm font-bold transition-transform group-hover:translate-x-1">→</span>
            </button>

            <button
              onClick={() => openAuth("signin")}
              className="interactive-hover inline-flex items-center gap-2 rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] backdrop-blur-md px-7 py-4 text-base font-medium text-[#F6F1E9] hover:bg-[#0F2130] hover:border-[#E8674A]/40 transition-all duration-200"
            >
              <span>Sign In to Platform</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Prominent Educational Purpose Disclaimer Banner */}
      <section id="disclaimer" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border-2 border-[#E8674A]/60 bg-[#0F2130] p-8 sm:p-10 shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8674A]/20 text-[#E8674A] text-2xl font-bold border border-[#E8674A]/40">
              ⚠️
            </span>
            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-[0.18em] text-[#E8674A] font-bold">
                Mandatory Notice & Legal Disclaimer
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#F6F1E9]">
                Educational & Technical Demonstration Prototype Only
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-base text-[#B9C4CC] leading-relaxed font-sans pl-0 sm:pl-16 font-light">
            AETHER is engineered strictly for <strong className="text-[#F6F1E9]">educational, research, and technical capability demonstration purposes</strong>. It is <strong className="text-[#E8674A]">not a certified medical device</strong> and does not provide formal medical diagnoses or replace licensed clinical practitioners. In the event of an emergency, immediately dial local emergency services (e.g., 911 / 112 / 108).
          </p>
        </motion.div>
      </section>

      {/* Analytics & Impact Section ("Why People Need This Software") */}
      <div id="analytics">
        <AnalyticsSection />
      </div>

      {/* Feature Modules Overview Grid */}
      <section id="overview" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto space-y-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center space-y-3"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E8674A] font-semibold">
            System Modules & Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-medium text-[#F6F1E9]">
            Comprehensive Healthcare Platform Capabilities
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#7C8A93] font-sans">
            Powered by zero-cost OpenStreetMap Overpass, Google AI Studio Gemini 1.5 Flash models, and clinical safety guardrails.
          </p>
        </motion.div>

        {/* 3D Glass Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Nearby Hospitals & Doctors",
              icon: "🚑",
              tag: "OpenStreetMap & Overpass",
              desc: "Query live nearby emergency clinics via free Overpass API on Leaflet map canvas. Includes direct Google Maps navigation & on-duty doctor rosters.",
              accent: "border-[#E8674A]/40",
            },
            {
              title: "AI Symptom Triage",
              icon: "💬",
              tag: "Gemini 1.5 Flash AI",
              desc: "Interactive symptom evaluation categorized into urgency tiers (low, moderate, high_critical) with clinical safety middleware and emergency guidance.",
              accent: "border-[#00F0FF]/40",
            },
            {
              title: "Medical Report OCR",
              icon: "📄",
              tag: "Lab Metric Extraction",
              desc: "Upload medical PDFs and images to extract hemoglobin, WBC, glucose, and creatinine values with out-of-range flag highlights.",
              accent: "border-[#4F9D8C]/40",
            },
            {
              title: "Specialist Directory",
              icon: "👨‍⚕️",
              tag: "Specialty Booking",
              desc: "Filter specialists by rating, distance, and specialty (Cardiology, Neurology, Pediatrics, Orthopedics) with simulated slot booking.",
              accent: "border-[#E8674A]/40",
            },
            {
              title: "Health History Timeline",
              icon: "📅",
              tag: "Unified Telemetry Feed",
              desc: "Chronological medical record combining symptom reads, lab report results, and specialist appointments into a single health signal feed.",
              accent: "border-[#4F9D8C]/40",
            },
            {
              title: "Medicine Lookup & Pricing",
              icon: "💊",
              tag: "Generic Equivalents",
              desc: "Compare active ingredients, discover generic alternative medicines, and view multi-pharmacy price comparisons in INR.",
              accent: "border-[#00F0FF]/40",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => openAuth("signup")}
              className={`interactive-hover cursor-pointer group flex flex-col justify-between rounded-3xl border ${item.accent} bg-[#132A38] p-7 shadow-2xl transition-all duration-300 hover:bg-[#0F2130] hover:shadow-2xl`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2130] text-3xl shadow-inner border border-[rgba(246,241,233,0.09)]">
                    {item.icon}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#4F9D8C] bg-[#4F9D8C]/10 px-3 py-1 rounded-md border border-[#4F9D8C]/20 font-semibold">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-medium text-[#F6F1E9] group-hover:text-[#E8674A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B9C4CC] leading-relaxed mt-2 font-sans font-light">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[rgba(246,241,233,0.09)] flex items-center justify-between">
                <span className="text-xs font-mono text-[#7C8A93]">Explore Module</span>
                <span className="font-mono text-xs font-semibold text-[#E8674A] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Sign In / Launch</span>
                  <span>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(246,241,233,0.09)] py-12 text-center text-xs font-mono text-[#7C8A93] bg-[#0A1620]">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <p className="font-serif text-base text-[#F6F1E9]">AETHER Healthcare Platform • Educational Prototype</p>
          <p className="text-xs text-[#7C8A93]">
            Built with Next.js, Leaflet, OpenStreetMap Overpass, Google AI Studio Gemini 1.5 Flash, Firebase Auth & Supabase.
          </p>
        </div>
      </footer>

      {/* Auth Modal Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}
