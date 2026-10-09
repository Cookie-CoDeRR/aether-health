"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import {
  X,
  ShieldCheck,
  Stethoscope,
  User,
  Building2,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  signInAsDoctor,
  VERIFIED_DOCTORS_REGISTRY,
  DoctorProfile,
} from "@/services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
  initialRole?: "patient" | "doctor";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
  initialRole = "patient",
}: AuthModalProps) {
  const [role, setRole] = useState<"patient" | "doctor">(initialRole);
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setTab(initialTab);
    }
  }, [isOpen, initialRole, initialTab]);

  // Patient Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Doctor Fields (Clean & Empty by default)
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [hospitalAffiliation, setHospitalAffiliation] = useState("Apollo Specialty Hospital");
  const [specialization, setSpecialization] = useState("Cardiology & Internal Medicine");
  const [qualifications, setQualifications] = useState("MBBS, MD");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { signInWithGmail } = useSettings();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);
    try {
      if (typeof window !== "undefined" && tab === "signup") {
        localStorage.removeItem("aether_triage_chat_messages");
        localStorage.removeItem("aether_uploaded_reports");
        localStorage.removeItem("aether_medications");
        localStorage.removeItem("aether_timeline_events");
        localStorage.removeItem("aether_onboarding_completed");
        localStorage.setItem(
          "aether_medical_history",
          "New patient profile created. Please add your known allergies, chronic conditions, or past medical notes in Settings."
        );
      }
      await signInWithGmail();
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_auth_active", "true");
        localStorage.setItem("aether_user_role", "patient");
      }
      onClose();
      router.push("/triage");
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with Google. Please check permissions.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    if (typeof window !== "undefined") {
      if (tab === "signup") {
        localStorage.removeItem("aether_triage_chat_messages");
        localStorage.removeItem("aether_uploaded_reports");
        localStorage.removeItem("aether_medications");
        localStorage.removeItem("aether_timeline_events");
        localStorage.removeItem("aether_onboarding_completed");
        localStorage.setItem(
          "aether_medical_history",
          "New patient profile created. Please add your known allergies, chronic conditions, or past medical notes in Settings."
        );
      }

      localStorage.setItem("aether_auth_active", "true");
      localStorage.setItem("aether_user_role", "patient");
      if (email) {
        localStorage.setItem("aether_user_email", email);
        localStorage.setItem("aether_user_name", email.split("@")[0]);
      }
    }

    setIsSubmitting(false);
    onClose();
    router.push("/triage");
  };

  const handleDoctorGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGmail();
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("aether_user_email") : null;
      const storedName = typeof window !== "undefined" ? localStorage.getItem("aether_user_name") : null;

      if (storedEmail) setDoctorEmail(storedEmail);
      if (storedName) setDoctorName(storedName.startsWith("Dr.") ? storedName : `Dr. ${storedName}`);
      setIsGoogleConnected(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate doctor with Google account.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const nameToUse = doctorName.trim();
    const regToUse = regNumber.trim();
    const emailToUse = doctorEmail.trim();

    if (!nameToUse || !regToUse || !emailToUse) {
      setAuthError("Please fill in all doctor identity fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 450));

    try {
      await signInAsDoctor({
        name: nameToUse,
        email: emailToUse,
        registrationNumber: regToUse,
        hospitalAffiliation,
        specialization,
        qualifications,
      });

      setIsSubmitting(false);
      onClose();
      router.push("/doctor");
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthError(err.message || "Failed to authenticate doctor credentials.");
    }
  };

  const handleGuestDoctorEnter = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_demo_mode", "true");
        localStorage.setItem("aether_auth_active", "true");
        localStorage.setItem("aether_user_role", "doctor");
      }
      await signInAsDoctor(VERIFIED_DOCTORS_REGISTRY[0]);
      onClose();
      router.push("/doctor");
    } catch (err: any) {
      setAuthError(err.message || "Demo doctor login unavailable outside DEMO_MODE.");
    }
  };

  const handleGuestPatientEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_demo_mode", "true");
      localStorage.setItem("aether_auth_active", "true");
      localStorage.setItem("aether_user_role", "patient");
    }
    onClose();
    router.push("/triage");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#064E3B]/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#064E3B]/20 text-[#064E3B] space-y-4 max-h-[92vh] overflow-y-auto z-10">
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#064E3B] text-white font-serif text-lg font-bold shadow-soft">
              Æ
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {role === "patient"
                  ? tab === "signin"
                    ? "Patient Sign In"
                    : "Create Patient Account"
                  : "Doctor & Clinician Verification"}
              </h3>
              <p className="text-xs text-[#064E3B]/70 font-medium">
                {role === "patient"
                  ? "Sovereign Health Telemetry & AI Triage"
                  : "NMC Verified Clinical Practitioner Portal"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#064E3B]/70 hover:text-[#064E3B] hover:bg-[#F9FBF9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Role Selector (Patient vs Doctor) */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F9FBF9] p-1.5 border border-[#064E3B]/10">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
              role === "patient"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
              role === "doctor"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B]"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor & Hospital</span>
          </button>
        </div>

        {authError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-bold text-center">
            {authError}
          </div>
        )}

        {/* =========================================================================
            PATIENT AUTH VIEW
            ========================================================================= */}
        {role === "patient" && (
          <div className="space-y-3.5">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] p-3 text-xs font-bold text-[#064E3B] transition-all shadow-xs disabled:opacity-50 min-tap-target cursor-pointer"
            >
              <span>
                {isGoogleSubmitting
                  ? "Connecting to Google..."
                  : tab === "signin"
                  ? "Continue with Google"
                  : "Sign Up with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#064E3B]/15" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-[#064E3B]/60 uppercase">
                or with email
              </span>
            </div>

            {/* Signin / Signup Switch */}
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F9FBF9] p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`rounded-xl py-1.5 transition-all cursor-pointer ${
                  tab === "signin"
                    ? "bg-[#064E3B] text-white shadow-soft"
                    : "text-[#064E3B]/70 hover:text-[#064E3B]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`rounded-xl py-1.5 transition-all cursor-pointer ${
                  tab === "signup"
                    ? "bg-[#064E3B] text-white shadow-soft"
                    : "text-[#064E3B]/70 hover:text-[#064E3B]"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePatientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#064E3B] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivers@example.com"
                  className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mt-1 min-tap-target cursor-pointer"
              >
                {isSubmitting
                  ? "Entering Patient Portal..."
                  : tab === "signin"
                  ? "Sign In & Enter Dashboard →"
                  : "Register & Get Started →"}
              </button>
            </form>

            <div className="border-t border-[#064E3B]/15 pt-2 text-center">
              <button
                type="button"
                onClick={handleGuestPatientEnter}
                className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] py-2.5 text-xs font-bold text-[#064E3B] transition-all min-tap-target cursor-pointer"
              >
                ✦ Enter as Patient Demo Guest →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            DOCTOR & CLINICIAN AUTH VIEW (Spacious & Clean, No Clutter)
            ========================================================================= */}
        {role === "doctor" && (
          <div className="space-y-4">
            {/* Google Doctor Login */}
            <button
              type="button"
              onClick={handleDoctorGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-50/70 hover:bg-white hover:border-emerald-700 p-3 text-xs font-bold text-emerald-950 transition-all shadow-xs disabled:opacity-50 min-tap-target cursor-pointer"
            >
              <span>
                {isGoogleSubmitting
                  ? "Connecting Doctor Account to Google..."
                  : "Sign In as Doctor with Google Workspace"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#064E3B]/15" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-[#064E3B]/60 uppercase">
                or with NMC credentials
              </span>
            </div>

            {/* Google Connected Status Banner */}
            {isGoogleConnected && (
              <div className="rounded-2xl border border-emerald-600/30 bg-emerald-50/80 p-3 flex items-center gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold">Google Account Verified ({doctorEmail})</span>
                  <p className="text-[10.5px] text-emerald-800">
                    Please provide your NMC License # and Hospital affiliation below to complete clinical verification.
                  </p>
                </div>
              </div>
            )}

            {/* Doctor Credential Verification Form */}
            <form onSubmit={handleDoctorSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1 flex items-center justify-between">
                    <span>Medical Reg / License #</span>
                    <span className="text-[10px] text-emerald-700 font-mono">NMC / MCI</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. NMC-IND-94821"
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs font-mono text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1">
                    Hospital / Institution
                  </label>
                  <select
                    value={hospitalAffiliation}
                    onChange={(e) => setHospitalAffiliation(e.target.value)}
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  >
                    <option value="Apollo Specialty Hospital">Apollo Specialty Hospital</option>
                    <option value="Fortis Healthcare & Research">Fortis Healthcare & Research</option>
                    <option value="AIIMS New Delhi">AIIMS New Delhi</option>
                    <option value="Manipal Hospital">Manipal Hospital</option>
                    <option value="St. Johns Medical Center">St. Johns Medical Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1">
                    Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  >
                    <option value="Cardiology & Internal Medicine">Cardiology & Internal Medicine</option>
                    <option value="Emergency & Critical Care Medicine">Emergency & Critical Care</option>
                    <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                    <option value="Gastroenterology & Hepatology">Gastroenterology & Hepatology</option>
                    <option value="General Practice & Family Medicine">General Practice & Family Medicine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] mb-1">
                  Official Medical Email
                </label>
                <input
                  type="email"
                  required
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  placeholder="e.g. doctor@hospital.org"
                  className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-600/15 p-2.5 flex items-center gap-2 text-[11px] text-emerald-900">
                <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Credentials automatically authenticated against National Medical Commission & ABDM Registry.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mt-1 min-tap-target flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? "Verifying Medical Credentials..."
                    : "Authenticate & Enter Doctor Portal →"}
                </span>
              </button>
            </form>

            <div className="border-t border-[#064E3B]/15 pt-2 text-center">
              <button
                type="button"
                onClick={handleGuestDoctorEnter}
                className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] py-2.5 text-xs font-bold text-[#064E3B] transition-all min-tap-target flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant 1-Click Doctor Portal Demo Access →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
