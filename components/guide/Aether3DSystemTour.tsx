"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
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
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Aether3DSystemTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  route: string;
  description: string;
  highlights: string[];
  icon: any;
  accentColor: string;
  particleColor: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    badge: "System Overview",
    title: "Welcome to Aether Health",
    route: "/triage",
    description:
      "Aether is an intelligent clinical telemetry and care platform designed to empower your personal wellness with sovereign AI, real-time hospital radar, and clinical precision.",
    highlights: [
      "Natural language clinical symptom triage & safety guidance",
      "Live OpenStreetMap 24/7 ICU & doctor discovery radar",
      "Intelligent drug interaction alerts & lab report OCR",
      "Unified longitudinal health timeline & ABDM sync",
    ],
    icon: Sparkles,
    accentColor: "#10B981",
    particleColor: 0x10b981,
  },
  {
    id: "triage",
    badge: "Feature 1 of 6",
    title: "AI Triage & Care Advice",
    route: "/triage",
    description:
      "Describe symptoms in plain language to receive instant, reassuring care advice. Aether cross-references your personal allergy profile and lab history automatically.",
    highlights: [
      "Simple, easy-to-read clinical assessments by default",
      "Expandable in-depth diagnostic breakdown on demand",
      "Automatic penicillin allergy & lab value cross-referencing",
      "1-click follow-up clinical questions & specialist routing",
    ],
    icon: Stethoscope,
    accentColor: "#059669",
    particleColor: 0x059669,
  },
  {
    id: "discovery",
    badge: "Feature 2 of 6",
    title: "Hospital Radar & Doctors",
    route: "/discovery",
    description:
      "Locate 24/7 emergency ICUs, local clinics, and verified ABDM medical specialists with real-time GPS proximity and interactive OpenStreetMap navigation.",
    highlights: [
      "Real-time GPS proximity radar & custom radius slider",
      "Emergency 24/7 ICU filter toggle for urgent situations",
      "Instant verified doctor roster per hospital facility",
      "Direct phone call and navigation directions",
    ],
    icon: Building2,
    accentColor: "#0284C7",
    particleColor: 0x0284c7,
  },
  {
    id: "medicines",
    badge: "Feature 3 of 6",
    title: "Smart Medicines & Pharmacy",
    route: "/medicines",
    description:
      "Track your active prescriptions, monitor daily dosage schedules, and check for severe contraindications and drug-allergy interactions before taking any medicine.",
    highlights: [
      "Allergy safety shield checking every medication against your profile",
      "Morning, afternoon, and evening pill schedule timeline",
      "Refill tracking with remaining dosage count alerts",
      "Verified generic and brand medicine lookup",
    ],
    icon: Pill,
    accentColor: "#D97706",
    particleColor: 0xd97706,
  },
  {
    id: "reports",
    badge: "Feature 4 of 6",
    title: "Clinical Lab Reports & OCR",
    route: "/reports",
    description:
      "Upload blood work, diagnostic scans, and clinical PDFs. Aether's AI extracts biometric markers and plots your healthy ranges over time.",
    highlights: [
      "AI OCR extraction for CBC panels, creatinine, glucose, and lipid profiles",
      "Instant out-of-range flag warnings (e.g. elevated WBC count)",
      "Longitudinal visual trends across previous months",
      "Encrypted and sovereign client-side document storage",
    ],
    icon: FileText,
    accentColor: "#7C3AED",
    particleColor: 0x7c3aed,
  },
  {
    id: "timeline",
    badge: "Feature 5 of 6",
    title: "Patient Health Timeline",
    route: "/timeline",
    description:
      "A continuous chronological record connecting all doctor consultations, hospital admissions, lab tests, and symptom assessments into a single coherent story.",
    highlights: [
      "Unified chronological milestone history",
      "Interactive category filters (Symptoms, Labs, Consultations)",
      "Clinical notes and actionable doctor follow-up dates",
      "Exportable summary for new healthcare providers",
    ],
    icon: Clock,
    accentColor: "#0D9488",
    particleColor: 0x0d9488,
  },
  {
    id: "settings",
    badge: "Feature 6 of 6",
    title: "Settings & Personal Identity",
    route: "/settings",
    description:
      "Customize your clinical preferences, update drug allergies and chronic conditions, toggle between Obsidian Dark and Ivory Light themes, or replay this 3D guide anytime.",
    highlights: [
      "Obsidian Forest dark mode & Botanical Ivory light mode switcher",
      "Custom medical history, allergies, and ABDM Patient Health ID",
      "Google Cloud Health sync & EHR webhook API credentials",
      "Re-open and explore this 3D guide tour whenever you wish",
    ],
    icon: Sliders,
    accentColor: "#10B981",
    particleColor: 0x10b981,
  },
];

export default function Aether3DSystemTour({
  isOpen,
  onClose,
}: Aether3DSystemTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const step = TOUR_STEPS[currentStep];

  // Initialize and run Three.js 3D Interactive Hologram Orb
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth || 280, canvas.clientHeight || 280);

    // 1. Central Icosahedron / Geodesic Health Orb
    const geo = new THREE.IcosahedronGeometry(1.2, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: step.particleColor,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const mesh = new THREE.Mesh(geo, wireMat);
    scene.add(mesh);

    // 2. Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: step.particleColor,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 3. Orbiting Particle Halo Ring
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.65 + (Math.random() - 0.5) * 0.35;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.45;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: step.particleColor,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.008;

      innerMesh.rotation.y -= 0.006;
      particles.rotation.y += 0.004;
      particles.rotation.z += 0.002;

      // Parallax smooth interpolation
      scene.rotation.y += (mouseX * 0.4 - scene.rotation.y) * 0.08;
      scene.rotation.x += (-mouseY * 0.4 - scene.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      renderer.setSize(canvas.clientWidth || 280, canvas.clientHeight || 280);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      geo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [isOpen, currentStep, step.particleColor]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_onboarding_completed", "true");
    }
    onClose();
  };

  const handleJumpToPage = (route: string) => {
    handleComplete();
    router.push(route);
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064E3B]/50 dark:bg-black/70 backdrop-blur-md p-4 sm:p-6 animate-fade-in text-[#064E3B] dark:text-[#ECFDF5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-2xl sm:max-w-3xl rounded-3xl border border-[#064E3B]/20 dark:border-white/15 bg-white/95 dark:bg-[#0B1D17]/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 dark:text-[#10B981]">
                Aether System Guide
              </span>
              <h3 className="font-serif text-sm sm:text-base font-bold leading-none">
                Interactive 3D Overview
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-mono">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleComplete}
              className="rounded-full p-1.5 text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#064E3B]/5 dark:hover:bg-white/10 transition-colors"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Dual Column (3D Interactive Hologram + Feature Details) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column: 3D Holographic Orb Canvas */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-b from-[#F9FBF9] to-white dark:from-[#0F241E] dark:to-[#081511] border border-[#064E3B]/15 dark:border-white/10 flex items-center justify-center shadow-inner overflow-hidden group">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                  style={{ width: "100%", height: "100%" }}
                />

                {/* Center Overlay Icon Badge */}
                <div
                  className="absolute bottom-3 px-3 py-1 rounded-full text-[10.5px] font-bold backdrop-blur-md shadow-sm border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${step.accentColor}18`,
                    borderColor: `${step.accentColor}40`,
                    color: step.accentColor,
                  }}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span>{step.badge}</span>
                </div>
              </div>
              <span className="text-[10px] text-[#064E3B]/50 dark:text-white/40 mt-2 font-mono">
                Hover / Drag to rotate 3D telemetry
              </span>
            </div>

            {/* Right Column: Step Description & Feature Highlights */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-wider mb-1 px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${step.accentColor}18`,
                    color: step.accentColor,
                  }}
                >
                  {step.badge}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
                  {step.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#064E3B]/80 dark:text-[#ECFDF5]/80 leading-relaxed">
                {step.description}
              </p>

              {/* Feature Highlights Bullets */}
              <div className="space-y-2 pt-1">
                {step.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl p-2 bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/10 dark:border-white/5 text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90"
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: step.accentColor }}
                    />
                    <span className="leading-snug">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Quick Jump Action */}
              {step.id !== "welcome" && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleJumpToPage(step.route)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] dark:text-[#10B981] hover:underline"
                  >
                    <span>Open {step.title} Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Controls & Progress Dots */}
        <div className="border-t border-[#064E3B]/15 dark:border-white/10 px-6 py-4 bg-[#F9FBF9]/60 dark:bg-[#0F241E]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Jump to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? "w-6 bg-[#064E3B] dark:bg-[#10B981]"
                    : "w-2 bg-[#064E3B]/20 dark:border-white/20 hover:bg-[#064E3B]/40"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-4 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] px-5 py-2 text-xs font-bold transition-all cursor-pointer shadow-soft hover:scale-105 active:scale-95"
            >
              <span>
                {currentStep === TOUR_STEPS.length - 1 ? "Start Your Journey" : "Next"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
