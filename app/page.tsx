"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";
import AuthModal from "@/components/landing/AuthModal";
import Sidebar from "@/components/Sidebar";
import { NatureBranchOverlay } from "@/components/landing/NatureBranchOverlay";
import { useSettings } from "@/context/SettingsContext";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Pill,
  FileText,
  Activity,
  Stethoscope,
  HeartPulse,
  Clock,
  Check,
  PhoneCall,
  Search,
} from "lucide-react";

export default function StartPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isGmailAuthenticated } = useSettings();
  const router = useRouter();

  function initialTab(): "signin" | "signup" {
    return "signin";
  }

  // Automatic Persistent Session Check
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
    <div className="relative min-h-screen bg-[#F9FBF9] text-[#064E3B] font-sans antialiased overflow-x-hidden selection:bg-[#064E3B] selection:text-white pb-20">
      {/* Botanical Branch Overlay & Interactive Physics (Leaves, Apple & Wind) */}
      <NatureBranchOverlay />

      {/* Top Header Bar */}
      <LandingHeader onOpenAuth={openAuth} />

      {/* Slide-over navigation drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 text-center max-w-5xl mx-auto space-y-8">
        {/* Brand Super-Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 rounded-full bg-white border border-[#064E3B]/30 px-5 py-2 text-xs font-bold text-[#064E3B] shadow-sm"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064E3B] text-white text-[10px] font-serif font-black">
            Æ
          </div>
          <span className="font-extrabold tracking-wider uppercase text-[11px]">Aether Health</span>
          <span className="text-[#064E3B]/30">•</span>
          <span className="font-medium text-[#064E3B]/80">Autonomous Clinical Navigator</span>
        </motion.div>

        {/* Dominant Brand Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="font-serif tracking-tight text-[#064E3B]">
            {/* Grand Brand Name */}
            <span className="block text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-[#064E3B] mb-2 leading-none drop-shadow-xs">
              Aether
            </span>
            {/* Sub-headline */}
            <span className="block font-serif text-2xl sm:text-4xl lg:text-5xl font-medium text-[#064E3B] leading-tight">
              Intelligent Patient Health <br />
              <span className="font-bold">Telemetry & Care.</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#064E3B]/85 font-normal leading-relaxed pt-2">
            Replace fragmented medical records and symptom guesswork with an intelligent, autonomous patient triage and daily medication layer.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={() => openAuth("signup")}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#064E3B] hover:bg-[#043327] px-8 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] min-tap-target"
          >
            <span>Check Symptoms Now</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => openAuth("signin")}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#064E3B] bg-white hover:bg-[#064E3B]/5 px-7 py-3.5 text-sm font-bold text-[#064E3B] shadow-xs transition-all min-tap-target"
          >
            <span>View Clinical Timeline</span>
          </button>
        </motion.div>

        {/* 3D PERSPECTIVE DASHBOARD MOCKUP (NEXUS STYLE) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-4xl pt-6 perspective-1000"
        >
          <div
            className="rounded-3xl border border-[#064E3B]/25 bg-white p-6 sm:p-8 shadow-2xl transition-all duration-500 hover:rotate-0 text-left space-y-6"
            style={{
              transform: "perspective(1000px) rotateX(3deg)",
              boxShadow: "0 25px 50px -12px rgba(6, 78, 59, 0.15)",
            }}
          >
            {/* Mockup Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#064E3B]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064E3B] text-white font-bold text-xs">
                  Æ
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-[#064E3B] tracking-wider">
                    AETHER PATIENT OS
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#064E3B]/70">
                    <span className="h-2 w-2 rounded-full bg-[#064E3B] animate-pulse" />
                    <span>Real-time Clinical Telemetry Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#064E3B]/25 bg-[#F9FBF9] px-3 py-1 text-xs font-bold text-[#064E3B]">
                  ABDM Synced • ID: #9842-AX
                </span>
              </div>
            </div>

            {/* Metrics Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#064E3B]/15 bg-[#F9FBF9] p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 flex items-center justify-between">
                  <span>Active Prescriptions</span>
                  <Pill className="w-4 h-4 text-[#064E3B]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#064E3B]">
                  3 Active
                </div>
                <p className="text-[11px] text-[#064E3B]/70">
                  Crocin 650mg, Glycomet, Lipivas
                </p>
              </div>

              <div className="rounded-2xl border border-[#064E3B]/15 bg-[#F9FBF9] p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 flex items-center justify-between">
                  <span>Dose Adherence</span>
                  <Activity className="w-4 h-4 text-[#064E3B]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#064E3B]">
                  84%
                </div>
                <p className="text-[11px] text-[#064E3B]/70">
                  2 of 3 doses logged today
                </p>
              </div>

              <div className="rounded-2xl border border-[#064E3B]/15 bg-[#F9FBF9] p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 flex items-center justify-between">
                  <span>ABDM Health ID</span>
                  <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#064E3B]">
                  Linked
                </div>
                <p className="text-[11px] text-[#064E3B]/70">
                  Autonomous EHR encryption
                </p>
              </div>
            </div>

            {/* Smooth SVG Trend Line Visualization */}
            <div className="rounded-2xl border border-[#064E3B]/15 bg-[#F9FBF9] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
                <span>Weekly Symptom Stability & Adherence Trend</span>
                <span className="text-[11px] font-mono">98.4% Baseline Normal</span>
              </div>

              <div className="h-20 w-full flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 100"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 70 Q 50 40 100 55 T 200 30 T 300 45 T 400 20 T 500 15 L 500 100 L 0 100 Z"
                    fill="rgba(6, 78, 59, 0.06)"
                  />
                  <path
                    d="M 0 70 Q 50 40 100 55 T 200 30 T 300 45 T 400 20 T 500 15"
                    stroke="#064E3B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="500" cy="15" r="4" fill="#064E3B" />
                </svg>
              </div>

              <div className="flex justify-between text-[10.5px] font-mono text-[#064E3B]/60 pt-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Today (Optimal)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DETAILED 4-FEATURE DEEP DIVE WITH REALISTIC LIVE SCREEN MOCKUPS */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto space-y-20">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-wider text-[#064E3B]">
            Core Application Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#064E3B]">
            Deep Clinical Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#064E3B]/80 leading-relaxed">
            See how Aether Health coordinates clinical triage, hospital discovery, daily prescriptions, and lab diagnostics.
          </p>
        </div>

        {/* 1. FEATURE SHOWCASE: AI Clinical Triage & Allergy Cross-Referencing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl border border-[#064E3B]/20 bg-white p-6 sm:p-10 shadow-lg">
          {/* Left Side: Explanation */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-1 text-xs font-bold text-[#064E3B]">
              <HeartPulse className="w-4 h-4 text-[#064E3B]" />
              <span>Feature 01 • AI Symptom Triage</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#064E3B] leading-tight">
              Instant Symptom Evaluation & Allergy Guardrails
            </h3>

            <p className="text-xs sm:text-sm text-[#064E3B]/80 leading-relaxed">
              Describe what you feel in natural language. Aether evaluates symptom severity against your personal profile, flagging drug allergies and providing calming next steps.
            </p>

            <ul className="space-y-2.5 text-xs text-[#064E3B]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Instant Urgency Classification:</strong> Categorizes symptoms as Low, Moderate, or High Emergency.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Allergy Cross-Check:</strong> Verifies contraindications (e.g. Penicillin, NSAIDs) automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Specialist Routing:</strong> Directs you to verified specialists across Pulmonology, Cardiology, and ENT.</span>
              </li>
            </ul>

            <button
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white px-6 py-3 text-xs font-bold shadow-md transition-all min-tap-target"
            >
              <span>Explore AI Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Side: High-Fidelity Triage Chat Screen Mockup */}
          <div className="rounded-2xl border border-[#064E3B]/25 bg-[#F9FBF9] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B]">
                <Sparkles className="w-4 h-4 text-[#064E3B]" />
                <span>Aether AI Care Today Screen</span>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-[#064E3B] border border-[#064E3B]/30 px-2 py-0.5 rounded-md bg-white">
                Live App View
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-end">
                <div className="bg-[#064E3B] text-white rounded-2xl rounded-br-xs p-3.5 max-w-[85%] font-medium">
                  &quot;I have a mild headache and fatigue after meals for 2 days.&quot;
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white border border-[#064E3B]/20 rounded-2xl rounded-bl-xs p-4 max-w-[95%] space-y-2.5 text-[#064E3B] shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#064E3B]" />
                      Clinical Summary: Low Urgency
                    </span>
                    <span className="text-[10px] font-bold bg-[#F9FBF9] border border-[#064E3B]/20 px-2 py-0.5 rounded-full">
                      Home Care
                    </span>
                  </div>

                  <p className="text-[11.5px] leading-relaxed text-[#064E3B]/80">
                    Your symptoms suggest tension fatigue or mild dehydration. No acute neurological red flags detected.
                  </p>

                  <div className="rounded-xl border border-[#064E3B]/15 bg-[#F9FBF9] p-2.5 text-[11px] space-y-1">
                    <div className="font-bold text-[#064E3B]">🛡️ Allergy Alert Cross-Checked:</div>
                    <p className="text-[#064E3B]/70">
                      Penicillin allergy verified. Acetaminophen/Paracetamol is safe; avoid unverified antibiotic formulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FEATURE SHOWCASE: Emergency Hospital Radar & 24/7 ICU Routing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl border border-[#064E3B]/20 bg-white p-6 sm:p-10 shadow-lg">
          {/* Left Side: High-Fidelity Hospital Radar Screen Mockup */}
          <div className="rounded-2xl border border-[#064E3B]/25 bg-[#F9FBF9] p-5 space-y-4 shadow-sm order-2 lg:order-1">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B]">
                <Building2 className="w-4 h-4 text-[#064E3B]" />
                <span>Find Care • Hospital Discovery Screen</span>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-[#064E3B] border border-[#064E3B]/30 px-2 py-0.5 rounded-md bg-white">
                Live App View
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-[#064E3B]/20 bg-white p-3.5 space-y-2 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#064E3B]">Apollo Specialty Hospital</h4>
                    <span className="text-[11px] text-[#064E3B]/70">24/7 ICU • Emergency Trauma Care Unit</span>
                  </div>
                  <span className="rounded-full bg-[#064E3B] text-white px-2.5 py-0.5 text-[10.5px] font-bold">
                    1.1 km • 4 mins
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#064E3B]/10 text-[11px]">
                  <span className="text-[#064E3B]/70">3 On-Duty Doctors • 8 ICU Beds Available</span>
                  <span className="font-bold text-[#064E3B] underline cursor-pointer">
                    Navigate Route →
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#064E3B]">St. John&apos;s Medical Center</span>
                  <span className="text-[10.5px] font-bold text-[#064E3B]">2.4 km • 8 mins</span>
                </div>
                <span className="text-[11px] text-[#064E3B]/70 block">
                  Cardiac Surgery & Pediatric Emergency Center
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Explanation */}
          <div className="space-y-5 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-1 text-xs font-bold text-[#064E3B]">
              <MapPin className="w-4 h-4 text-[#064E3B]" />
              <span>Feature 02 • Emergency Radar</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#064E3B] leading-tight">
              Real-Time Hospital Radar & Verified Doctor Roster
            </h3>

            <p className="text-xs sm:text-sm text-[#064E3B]/80 leading-relaxed">
              Locate nearby emergency rooms, ICU facilities, and licensed specialists instantly using OpenStreetMap cartography and verified ABDM medical council registries.
            </p>

            <ul className="space-y-2.5 text-xs text-[#064E3B]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Live Distance & ETA:</strong> Dynamic distance badges and direct Google Maps route dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>ABDM Registry Verification:</strong> Transparent doctor qualifications and upfront consultation fees in INR.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>One-Tap Emergency Hotline:</strong> Instant connection to local 108 / 112 ambulance response.</span>
              </li>
            </ul>

            <button
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white px-6 py-3 text-xs font-bold shadow-md transition-all min-tap-target"
            >
              <span>Explore Hospital Radar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. FEATURE SHOWCASE: Daily Prescription Dosing & Pharmacy Rate Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl border border-[#064E3B]/20 bg-white p-6 sm:p-10 shadow-lg">
          {/* Left Side: Explanation */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-1 text-xs font-bold text-[#064E3B]">
              <Pill className="w-4 h-4 text-[#064E3B]" />
              <span>Feature 03 • Medications & Pricing</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#064E3B] leading-tight">
              Daily Dosage Adherence & Generic Price Matching
            </h3>

            <p className="text-xs sm:text-sm text-[#064E3B]/80 leading-relaxed">
              Track your daily prescription doses with touch-friendly checkmarks while comparing generic medication rates across verified retail pharmacies.
            </p>

            <ul className="space-y-2.5 text-xs text-[#064E3B]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Touch-Friendly Checkmarks:</strong> Cross off daily morning, lunch, and bedtime doses in seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Refill Inventory Tracker:</strong> Visual progress countdown alerting you when pills drop below 30%.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Up to 42% Patient Savings:</strong> Match brand-name prescriptions to verified generic equivalents in INR.</span>
              </li>
            </ul>

            <button
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white px-6 py-3 text-xs font-bold shadow-md transition-all min-tap-target"
            >
              <span>View Medication Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Side: High-Fidelity Medications Screen Mockup */}
          <div className="rounded-2xl border border-[#064E3B]/25 bg-[#F9FBF9] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B]">
                <Pill className="w-4 h-4 text-[#064E3B]" />
                <span>Medications Screen • Dosage Tracker</span>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-[#064E3B] border border-[#064E3B]/30 px-2 py-0.5 rounded-md bg-white">
                Live App View
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#064E3B]/25">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#064E3B] text-white flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#064E3B] line-through block">Crocin 650 (650mg)</span>
                    <span className="text-[11px] text-[#064E3B]/70">Paracetamol • Taken at 08:15 AM</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#064E3B]">Completed</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#064E3B]/15">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-[#064E3B]/30 bg-white flex items-center justify-center" />
                  <div>
                    <span className="font-bold text-[#064E3B] block">Glycomet 500 (500mg)</span>
                    <span className="text-[11px] text-[#064E3B]/70">Metformin HCl • Due 02:00 PM with lunch</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#064E3B]/70">Due</span>
              </div>

              {/* Price comparison badge inside mockup */}
              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-3 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#064E3B]">
                  <span>Generic Price Match: Paracetamol 650</span>
                  <span>Lowest: ₹14.50</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                  <div className="rounded-lg bg-[#F9FBF9] border border-[#064E3B]/20 p-1 font-bold text-[#064E3B]">Apollo: ₹14.50</div>
                  <div className="rounded-lg bg-[#F9FBF9] border border-[#064E3B]/10 p-1 text-[#064E3B]/70">Netmeds: ₹16.20</div>
                  <div className="rounded-lg bg-[#F9FBF9] border border-[#064E3B]/10 p-1 text-[#064E3B]/70">MedPlus: ₹18.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FEATURE SHOWCASE: Smart Lab Report OCR & Biomarker Parsing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl border border-[#064E3B]/20 bg-white p-6 sm:p-10 shadow-lg">
          {/* Left Side: High-Fidelity Reports Screen Mockup */}
          <div className="rounded-2xl border border-[#064E3B]/25 bg-[#F9FBF9] p-5 space-y-4 shadow-sm order-2 lg:order-1">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B]">
                <FileText className="w-4 h-4 text-[#064E3B]" />
                <span>Reports Screen • Extracted Biomarkers</span>
              </div>
              <span className="text-[10.5px] font-mono font-bold text-[#064E3B] border border-[#064E3B]/30 px-2 py-0.5 rounded-md bg-white">
                Live App View
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-[#064E3B]/20 bg-white p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#064E3B] border-b border-[#064E3B]/10 pb-1.5">
                  <span>Lab Metric Name</span>
                  <span>Extracted Result</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#064E3B]">Hemoglobin</span>
                    <span className="font-bold text-[#064E3B] bg-[#F9FBF9] border border-[#064E3B]/20 px-2 py-0.5 rounded-md text-[11px]">
                      14.2 g/dL (Normal)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#064E3B]">Fasting Blood Glucose</span>
                    <span className="font-bold text-[#064E3B] bg-[#F9FBF9] border border-[#064E3B]/20 px-2 py-0.5 rounded-md text-[11px]">
                      94 mg/dL (Normal)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#064E3B]">WBC Count</span>
                    <span className="font-bold text-[#064E3B] bg-white border-2 border-[#064E3B] px-2 py-0.5 rounded-md text-[11px]">
                      11.2 K/µL (Elevated)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#064E3B]/15 bg-white p-3 text-[11px] text-[#064E3B]/80 leading-relaxed">
                <strong>Plain-Language Summary:</strong> WBC count slightly elevated, consistent with resolving mild respiratory inflammation. All other metabolic markers normal.
              </div>
            </div>
          </div>

          {/* Right Side: Explanation */}
          <div className="space-y-5 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-1 text-xs font-bold text-[#064E3B]">
              <FileText className="w-4 h-4 text-[#064E3B]" />
              <span>Feature 04 • Diagnostic OCR</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#064E3B] leading-tight">
              Smart Lab Report OCR & Biomarker Extraction
            </h3>

            <p className="text-xs sm:text-sm text-[#064E3B]/80 leading-relaxed">
              Upload any PDF or image lab report to automatically extract critical biomarkers (CBC, Glucose, Platelets, Liver Panels) with human-readable clinical summaries.
            </p>

            <ul className="space-y-2.5 text-xs text-[#064E3B]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Sub-Second OCR Parsing:</strong> Automatically scans unformatted lab sheets and extracts values.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Reference Range Comparison:</strong> Flags out-of-range biomarkers automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                <span><strong>Timeline Integration:</strong> Automatically archives lab milestones in your permanent health journey.</span>
              </li>
            </ul>

            <button
              onClick={() => openAuth("signup")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white px-6 py-3 text-xs font-bold shadow-md transition-all min-tap-target"
            >
              <span>Analyze Lab Reports</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#064E3B]/15 py-12 text-center text-xs text-[#064E3B]/70 bg-white">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm font-bold text-[#064E3B]">
            Aether Health • Patient Navigation & Clinical Telemetry
          </p>
          <p className="text-xs text-[#064E3B]/60">
            Strict Two-Color Clinical Architecture. Accessible, autonomous, and private.
          </p>
        </div>
      </footer>

      {/* AUTH MODAL DIALOG */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}
