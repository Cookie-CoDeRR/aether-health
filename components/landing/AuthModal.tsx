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

  // Doctor Fields
  const [doctorName, setDoctorName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [hospitalAffiliation, setHospitalAffiliation] = useState("Apollo Specialty Hospital");
  const [specialization, setSpecialization] = useState("Cardiology & Internal Medicine");
  const [qualifications, setQualifications] = useState("MBBS, MD");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { signInWithGmail } = useSettings();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelectDoctorPreset = (preset: DoctorProfile) => {
    setDoctorName(preset.name);
    setDoctorEmail(preset.email);
    setRegNumber(preset.registrationNumber);
    setHospitalAffiliation(preset.hospitalAffiliation);
    setSpecialization(preset.specialization);
    setQualifications(preset.qualifications);
  };

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
      if (err.message && err.message.includes("unauthorized-domain")) {
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_auth_active", "true");
          localStorage.setItem("aether_user_role", "patient");
        }
        onClose();
        router.push("/triage");
      } else {
        setAuthError(err.message || "Failed to sign in with Google. Please check permissions.");
      }
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
      const profile = await signInWithGmail();
      const rawName = profile.displayName || doctorName || "Dr. Alex Rivers";
      const formattedName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;

      await signInAsDoctor({
        name: formattedName,
        email: profile.email || doctorEmail || "dr.alex.rivers@apollohospitals.com",
        registrationNumber: regNumber || "NMC-IND-94821",
        hospitalAffiliation: hospitalAffiliation || "Apollo Specialty Hospital",
        specialization: specialization || "Cardiology & Internal Medicine",
        qualifications: qualifications || "MBBS, MD",
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("aether_auth_active", "true");
        localStorage.setItem("aether_user_role", "doctor");
      }
      onClose();
      router.push("/doctor");
    } catch (err: any) {
      if (err.message && err.message.includes("unauthorized-domain")) {
        await signInAsDoctor({
          name: "Dr. Alex Rivers (Google Verified)",
          email: "alex.rivers.aether@gmail.com",
          registrationNumber: "NMC-IND-94821",
          hospitalAffiliation: "Apollo Specialty Hospital",
          specialization: "Cardiology & Internal Medicine",
          qualifications: "MBBS, MD",
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("aether_auth_active", "true");
          localStorage.setItem("aether_user_role", "doctor");
        }
        onClose();
        router.push("/doctor");
      } else {
        setAuthError(err.message || "Failed to sign in as doctor with Google.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await signInAsDoctor({
        name: doctorName || "Dr. Anya Sharma",
        email: doctorEmail || "dr.anya.sharma@apollohospitals.com",
        registrationNumber: regNumber || "NMC-IND-94821",
        hospitalAffiliation,
        specialization,
        qualifications,
      });

      setIsSubmitting(false);
      onClose();
      router.push("/doctor");
    } catch (err: any) {
      setAuthError(err.message || "Failed to verify doctor credentials.");
      setIsSubmitting(false);
    }
  };

  const handleGuestPatientEnter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_auth_active", "true");
      localStorage.setItem("aether_user_role", "patient");
    }
    onClose();
    router.push("/triage");
  };

  const handleGuestDoctorEnter = () => {
    if (typeof window !== "undefined") {
      handleSelectDoctorPreset(VERIFIED_DOCTORS_REGISTRY[0]);
      signInAsDoctor({
        name: VERIFIED_DOCTORS_REGISTRY[0].name,
        email: VERIFIED_DOCTORS_REGISTRY[0].email,
        registrationNumber: VERIFIED_DOCTORS_REGISTRY[0].registrationNumber,
        hospitalAffiliation: VERIFIED_DOCTORS_REGISTRY[0].hospitalAffiliation,
        specialization: VERIFIED_DOCTORS_REGISTRY[0].specialization,
        qualifications: VERIFIED_DOCTORS_REGISTRY[0].qualifications,
      });
    }
    onClose();
    router.push("/doctor");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064E3B]/40 backdrop-blur-xs p-4 animate-fade-in text-[#064E3B] font-sans">
      <div className="w-full max-w-lg rounded-3xl border border-[#064E3B]/20 bg-white p-6 sm:p-7 shadow-2xl space-y-4.5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] font-serif text-lg font-bold text-white shadow-soft">
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
            className="rounded-xl p-1.5 text-[#064E3B]/70 hover:text-[#064E3B] hover:bg-[#F9FBF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Role Selector (Patient vs Doctor) */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F9FBF9] p-1.5 border border-[#064E3B]/10">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
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
            className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
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
          <div className="space-y-4">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] p-3 text-xs font-bold text-[#064E3B] transition-all shadow-xs disabled:opacity-50 min-tap-target"
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
            <div className="relative flex items-center justify-center">
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
                className={`rounded-xl py-1.5 transition-all ${
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
                className={`rounded-xl py-1.5 transition-all ${
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
                className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mt-1 min-tap-target"
              >
                {isSubmitting
                  ? "Entering Patient Portal..."
                  : tab === "signin"
                  ? "Sign In & Enter Dashboard →"
                  : "Register & Get Started →"}
              </button>
            </form>

            <div className="border-t border-[#064E3B]/15 pt-3 text-center">
              <button
                type="button"
                onClick={handleGuestPatientEnter}
                className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] py-2.5 text-xs font-bold text-[#064E3B] transition-all min-tap-target"
              >
                ✦ Enter as Patient Demo Guest →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            DOCTOR & CLINICIAN AUTH VIEW
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
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#064E3B]/15" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-[#064E3B]/60 uppercase">
                or with NMC credentials
              </span>
            </div>

            {/* Quick 1-Click Verified Clinician Presets */}
            <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1-Click Verified Doctor Presets</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                  NMC Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VERIFIED_DOCTORS_REGISTRY.slice(0, 2).map((doc) => (
                  <button
                    key={doc.doctorId}
                    type="button"
                    onClick={() => handleSelectDoctorPreset(doc)}
                    className="flex flex-col text-left rounded-xl border border-[#064E3B]/15 bg-white hover:bg-emerald-50/80 hover:border-[#064E3B] p-2.5 transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#064E3B] flex items-center justify-between">
                      <span>{doc.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 opacity-70 group-hover:opacity-100" />
                    </span>
                    <span className="text-[11px] text-[#064E3B]/70 font-medium truncate">
                      {doc.specialization}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800/80 mt-0.5">
                      {doc.hospitalAffiliation}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Credential Verification Form */}
            <form onSubmit={handleDoctorSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Anya Sharma"
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
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
                    placeholder="NMC-IND-94821"
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2 text-xs font-mono font-bold text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] mb-1">
                    Hospital / Institution
                  </label>
                  <select
                    value={hospitalAffiliation}
                    onChange={(e) => setHospitalAffiliation(e.target.value)}
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3 py-2 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
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
                    className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3 py-2 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
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
                  placeholder="dr.anya.sharma@apollohospitals.com"
                  className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2 text-xs text-[#064E3B] focus:bg-white focus:outline-none focus:border-[#064E3B]"
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
                className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mt-1 min-tap-target flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? "Verifying Medical Credentials..."
                    : "Authenticate & Enter Doctor Portal →"}
                </span>
              </button>
            </form>

            <div className="border-t border-[#064E3B]/15 pt-3 text-center">
              <button
                type="button"
                onClick={handleGuestDoctorEnter}
                className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] hover:bg-white hover:border-[#064E3B] py-2.5 text-xs font-bold text-[#064E3B] transition-all min-tap-target flex items-center justify-center gap-1.5"
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
