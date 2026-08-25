"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ShieldCheck,
  Building2,
  User,
  Clock,
  Pill,
  FileText,
  Activity,
  AlertTriangle,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  Send,
  Plus,
  ArrowRight,
  RotateCcw,
  Eye,
  Lock,
  HeartPulse,
  Award,
  Zap,
} from "lucide-react";
import {
  PatientRecord,
  getDoctorPatientQueue,
  prescribeDoctorMedication,
  generateSBARHandover,
  INITIAL_PATIENT_QUEUE,
} from "@/services/clinicalHandoverService";
import {
  getActiveDoctorProfile,
  DoctorProfile,
  VERIFIED_DOCTORS_REGISTRY,
} from "@/services/authService";

export default function DoctorPortalPage() {
  const router = useRouter();

  // Active Doctor profile state
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(VERIFIED_DOCTORS_REGISTRY[0]);

  // Patients queue state (initialized with default queue for SSR safety)
  const [patientQueue, setPatientQueue] = useState<PatientRecord[]>(INITIAL_PATIENT_QUEUE);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("AETH-PT-9842");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high_critical" | "moderate" | "routine">("all");

  // Center Workspace active tab
  const [activeTab, setActiveTab] = useState<"handover" | "labs" | "timeline" | "copilot">("handover");
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Doctor AI Copilot interactive chat state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<{ sender: "doctor" | "ai"; text: string; timestamp: string }[]>([
    {
      sender: "ai",
      text: "Hello Doctor. I have indexed the active patient's full triage dialogue, penicillin allergy history, and CBC lab panel (WBC: 11.2 K/µL). How can I assist your clinical evaluation?",
      timestamp: "Just now",
    },
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Live Prescription Dispenser Form State
  const [brandName, setBrandName] = useState("Pantoprazole 40");
  const [genericName, setGenericName] = useState("Pantoprazole Sodium 40mg Delayed-Release");
  const [dosage, setDosage] = useState("40 mg");
  const [frequency, setFrequency] = useState("Once daily 30 mins before breakfast");
  const [nextDoseTime, setNextDoseTime] = useState("Tonight at 08:30 PM");
  const [totalDoses, setTotalDoses] = useState<number>(14);
  const [instructions, setInstructions] = useState("Take 30 mins before morning meal. Avoid spicy or acidic foods.");
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState<string | null>(null);

  // Initialize and listen for live updates
  useEffect(() => {
    // Load doctor profile
    const profile = getActiveDoctorProfile();
    if (profile) {
      setDoctorProfile(profile);
    }

    // Load patient queue
    const queue = getDoctorPatientQueue();
    setPatientQueue(queue);

    // Live sync listener when patient chats on triage
    const handlePatientTriageUpdate = (e: any) => {
      const updatedQueue = getDoctorPatientQueue();
      setPatientQueue(updatedQueue);
    };

    window.addEventListener("aether-patient-triage-updated", handlePatientTriageUpdate);
    return () => window.removeEventListener("aether-patient-triage-updated", handlePatientTriageUpdate);
  }, []);

  const activePatient = patientQueue.find((p) => p.patientId === selectedPatientId) || patientQueue[0] || INITIAL_PATIENT_QUEUE[0];

  // Filtered patient list
  const filteredPatients = patientQueue.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency = urgencyFilter === "all" ? true : p.urgencyLevel === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  // Handle Doctor AI Copilot inquiry
  const handleSendCopilotMessage = async () => {
    if (!copilotQuery.trim() || isCopilotLoading) return;

    const userText = copilotQuery.trim();
    const newMsg = {
      sender: "doctor" as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setCopilotMessages((prev) => [...prev, newMsg]);
    setCopilotQuery("");
    setIsCopilotLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    // Context-aware AI synthesis for doctor
    const lower = userText.toLowerCase();
    let aiResponseText = "";

    if (lower.includes("antibiotic") || lower.includes("penicillin") || lower.includes("infection")) {
      aiResponseText = `**Clinical Recommendation regarding Antibiotic Therapy:**\n\n- ⚠️ **Contraindicated**: Patient has a documented severe allergy to **Penicillin & Amoxicillin** (anaphylactoid risk). Avoid all beta-lactam penicillins.\n- **Safe Alternatives**: Second/Third-generation Cephalosporins (with cross-reactivity caution) or Macrolides (e.g. **Azithromycin 500mg** or **Clarithromycin 500mg**) / Fluoroquinolones.\n- **WBC Correlation**: Current WBC is mildly elevated at **11.2 K/µL**. If gastritis is viral or non-infectious, antibiotic therapy is likely not indicated.`;
    } else if (lower.includes("wbc") || lower.includes("lab") || lower.includes("blood")) {
      aiResponseText = `**Biometric & Lab Summary:**\n\n- **WBC**: **11.2 K/µL** (High - Reference: 4.5 - 11.0). Indicates mild reactive leukocytosis consistent with acute gastric irritation or mild systemic stress.\n- **Kidney Function**: Serum Creatinine is normal at **0.92 mg/dL**.\n- **Metabolic**: Fasting blood glucose is normal at **98 mg/dL**.\n- **Recommendation**: Repeat CBC panel in 7 days if dyspeptic symptoms do not resolve with PPI therapy.`;
    } else if (lower.includes("dose") || lower.includes("pantoprazole") || lower.includes("gastritis")) {
      aiResponseText = `**Dyspepsia / Gastritis Dosing Guidance:**\n\n- **Suggested First-Line**: **Pantoprazole 40mg** delayed-release tablet once daily, taken 30 minutes before breakfast for 14 days.\n- **Adjunct**: Sucralfate oral suspension (1g TID) or Antacid gel as needed for acute breakthrough burning.\n- **Live Sync**: You can dispense this directly in the **Prescription Dispenser** below to update the patient's tracker live.`;
    } else {
      aiResponseText = `**Clinical Synthesis for ${activePatient.name}:**\n\n- **Presentation**: ${activePatient.chiefComplaint}.\n- **Risk Stratification**: Evaluated as **${activePatient.urgencyLevel.toUpperCase()}** priority.\n- **Sensitive Flag**: Patient confided anxiety regarding recent bowel frequency changes and fear of infection.\n- **Recommended Next Step**: Complete abdominal exam and consider prescribing a non-penicillin PPI.`;
    }

    setCopilotMessages((prev) => [
      ...prev,
      {
        sender: "ai" as const,
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setIsCopilotLoading(false);
  };

  // Handle Prescribing Medication Live
  const handlePrescribeMedication = (e: React.FormEvent) => {
    e.preventDefault();
    setPrescriptionError(null);
    setPrescriptionSuccess(null);

    const res = prescribeDoctorMedication(activePatient.patientId, {
      brandName,
      genericName,
      dosage,
      frequency,
      nextDoseTime,
      totalDoses,
      instructions,
      doctorName: doctorProfile.name,
      hospitalName: doctorProfile.hospitalAffiliation,
    });

    if (!res.success) {
      setPrescriptionError(res.error || "Failed to prescribe medication.");
      return;
    }

    setPrescriptionSuccess(
      `✓ Successfully prescribed ${brandName} (${dosage})! Next dose (${nextDoseTime}) is now live on ${activePatient.name}'s mobile & web tracker.`
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen w-full bg-[#F9FBF9] dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] font-sans antialiased overflow-hidden">
      {/* =========================================================================
          TOP DOCTOR PORTAL NAV HEADER
          ========================================================================= */}
      <header className="shrink-0 flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 bg-white/90 dark:bg-[#0B1D17]/90 backdrop-blur-md px-5 py-3 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] dark:bg-[#10B981] font-serif text-lg font-bold text-white dark:text-[#042F24] shadow-soft">
            Æ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] leading-none">
                Aether Clinical Practitioner Portal
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>NMC Verified</span>
              </span>
            </div>
            <p className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-mono mt-0.5">
              {doctorProfile.name} • {doctorProfile.registrationNumber} • {doctorProfile.hospitalAffiliation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/triage"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white dark:hover:bg-[#132D26] px-3 py-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Switch to Patient View</span>
          </Link>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("aether_user_role", "patient");
              }
              router.push("/");
            }}
            className="rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-3.5 py-1.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-soft"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN CLINICAL SPLIT WORKSPACE
          ========================================================================= */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-[#064E3B]/15 dark:divide-white/10">
        {/* -----------------------------------------------------------------------
            LEFT PANEL: LIVE PATIENT QUEUE & ROSTER
            ----------------------------------------------------------------------- */}
        <aside className="w-80 lg:w-96 shrink-0 flex flex-col h-full bg-white dark:bg-[#0B1D17] overflow-hidden">
          {/* Queue Header & Search */}
          <div className="p-4 border-b border-[#064E3B]/15 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
                <span>Active Triage Queue</span>
              </span>
              <span className="rounded-full bg-[#064E3B]/10 dark:bg-white/10 px-2 py-0.5 text-[11px] font-mono font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                {filteredPatients.length} Patients
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-[#064E3B]/50 dark:text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, ID, symptoms..."
                className="w-full h-8 rounded-full border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] pl-8.5 pr-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/50 dark:placeholder-white/40 focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
              />
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
              <button
                type="button"
                onClick={() => setUrgencyFilter("all")}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  urgencyFilter === "all"
                    ? "bg-[#064E3B] text-white dark:bg-[#10B981] dark:text-[#042F24]"
                    : "bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B]/70 dark:text-white/70"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter("high_critical")}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  urgencyFilter === "high_critical"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                }`}
              >
                Critical
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter("moderate")}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  urgencyFilter === "moderate"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter("routine")}
                className={`rounded-full px-2.5 py-0.5 transition-all ${
                  urgencyFilter === "routine"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                Routine
              </button>
            </div>
          </div>

          {/* Patients List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#064E3B]/10 dark:divide-white/5">
            {filteredPatients.map((patient) => {
              const isSelected = patient.patientId === selectedPatientId;
              const isCritical = patient.urgencyLevel === "high_critical";
              const isModerate = patient.urgencyLevel === "moderate";

              return (
                <button
                  key={patient.patientId}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.patientId)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 relative ${
                    isSelected
                      ? "bg-[#F9FBF9] dark:bg-[#132D26] border-l-4 border-l-[#064E3B] dark:border-l-[#10B981]"
                      : "hover:bg-[#F9FBF9]/60 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                        {patient.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#064E3B]/60 dark:text-white/50">
                        {patient.patientId}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300"
                          : isModerate
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                      }`}
                    >
                      {patient.urgencyLevel.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#064E3B]/75 dark:text-[#A7F3D0]/75 line-clamp-2 leading-snug">
                    {patient.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#064E3B]/60 dark:text-white/40 pt-1">
                    <span>
                      {patient.age}y • {patient.gender} • {patient.bloodGroup}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {patient.lastTriageAt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            CENTER & RIGHT: ACTIVE PATIENT CLINICAL WORKSPACE
            ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col h-full min-h-0 bg-[#F9FBF9] dark:bg-[#081511] overflow-hidden">
          {/* Patient Quick Header Summary Bar */}
          <div className="shrink-0 bg-white dark:bg-[#0B1D17] border-b border-[#064E3B]/15 dark:border-white/10 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#064E3B]/10 dark:bg-[#10B981]/20 font-serif text-lg font-bold text-[#064E3B] dark:text-[#10B981]">
                {activePatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    {activePatient.name}
                  </h2>
                  <span className="font-mono text-xs font-bold text-[#064E3B]/70 dark:text-[#10B981]">
                    {activePatient.patientId}
                  </span>
                  <span className="rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/15 dark:border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#064E3B]/80 dark:text-white/80">
                    ABDM: {activePatient.abhaId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#064E3B]/70 dark:text-white/60 mt-0.5">
                  <span>{activePatient.age} years old</span>
                  <span>•</span>
                  <span>{activePatient.gender}</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Blood Group: {activePatient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Documented Allergies Tag */}
            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="block font-bold text-[10px] uppercase tracking-wider">
                    Documented Allergies
                  </span>
                  <span className="font-semibold text-xs">
                    {activePatient.allergies.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Tabs Navigation */}
          <div className="shrink-0 flex items-center gap-2 px-5 pt-3 border-b border-[#064E3B]/10 dark:border-white/10 bg-white/50 dark:bg-[#0B1D17]/50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("handover")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "handover"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clinical Handover Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("labs")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "labs"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab OCR & Biometrics ({activePatient.recentLabMarkers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "timeline"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>EHR Care Timeline ({activePatient.timelineMilestones.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === "copilot"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Doctor AI Copilot</span>
            </button>
          </div>

          {/* Tab Content + Live Prescription Drawer */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#064E3B]/15 dark:divide-white/10">
            {/* Active Tab Viewport */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* ===============================================================
                  TAB 1: AI CLINICAL HANDOVER BRIEF (SBAR)
                  =============================================================== */}
              {activeTab === "handover" && (
                <div className="space-y-4 max-w-4xl">
                  {/* SBAR Structured Summary Card */}
                  <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                          SBAR Clinical Handover Protocol
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-[#064E3B]/60 dark:text-white/50">
                        Generated {activePatient.handoverSummary.generatedAt}
                      </span>
                    </div>

                    {/* SBAR Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Situation */}
                      <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 border border-[#064E3B]/10 dark:border-white/5 space-y-1">
                        <span className="font-bold text-[10.5px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          S • Situation & Chief Complaint
                        </span>
                        <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                          {activePatient.handoverSummary.situation}
                        </p>
                      </div>

                      {/* Background */}
                      <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 border border-[#064E3B]/10 dark:border-white/5 space-y-1">
                        <span className="font-bold text-[10.5px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
                          B • Background & EHR Correlation
                        </span>
                        <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                          {activePatient.handoverSummary.background}
                        </p>
                      </div>

                      {/* Assessment */}
                      <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 border border-[#064E3B]/10 dark:border-white/5 space-y-1 md:col-span-2">
                        <span className="font-bold text-[10.5px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                          A • Assessment & Diagnostic Considerations
                        </span>
                        <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                          {activePatient.handoverSummary.assessment}
                        </p>
                      </div>
                    </div>

                    {/* Sensitive Disclosures Box (Saves Patient Time & Embarrassment) */}
                    {activePatient.handoverSummary.sensitiveDisclosures.length > 0 && (
                      <div className="rounded-2xl border border-purple-300 bg-purple-50/70 dark:bg-purple-950/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Confidential Patient Disclosures (Time & Embarrassment Shield)</span>
                        </div>
                        <p className="text-[11.5px] text-purple-950 dark:text-purple-200">
                          The patient disclosed the following delicate topics during AI triage. You can address these empathetically without requiring the patient to awkwardly repeat them:
                        </p>
                        <ul className="list-disc list-inside text-xs text-purple-900 dark:text-purple-300 space-y-1 pl-1">
                          {activePatient.handoverSummary.sensitiveDisclosures.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Physician Interventions */}
                    <div className="space-y-2 pt-1">
                      <span className="block font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                        R • Recommended Clinical Next Actions:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {activePatient.handoverSummary.doctorRecommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 border border-[#064E3B]/10 dark:border-white/5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-snug">
                              {rec}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Raw Compressed Chat Audit Trail */}
                  <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-4.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                        <Eye className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
                        <span>Compressed Patient AI Chat Audit Trail</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsChatExpanded(!isChatExpanded)}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        {isChatExpanded ? "Collapse Dialogue" : "View Full Dialogue"}
                      </button>
                    </div>

                    {isChatExpanded && (
                      <pre className="rounded-2xl bg-[#081511] text-[#A7F3D0] p-4 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-emerald-900/50">
                        {activePatient.compressedChat}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 2: LAB REPORTS & BIOMETRIC OCR
                  =============================================================== */}
              {activeTab === "labs" && (
                <div className="space-y-4 max-w-4xl">
                  <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                      <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                        Extracted Lab Biometrics & CBC Panels
                      </h3>
                      <span className="text-xs text-[#064E3B]/60 dark:text-white/50 font-mono">
                        Apollo Diagnostics Central Lab
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activePatient.recentLabMarkers.map((marker, idx) => {
                        const isHigh = marker.status === "high";
                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl p-3.5 border transition-all ${
                              isHigh
                                ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300"
                                : "bg-[#F9FBF9] dark:bg-[#0F241E] border-[#064E3B]/10 dark:border-white/5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-[#064E3B]/75 dark:text-white/75 truncate">
                                {marker.name}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  isHigh
                                    ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                                }`}
                              >
                                {marker.status}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1 mt-2">
                              <span className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                                {marker.value}
                              </span>
                              <span className="text-[10px] font-mono text-[#064E3B]/60 dark:text-white/50">
                                {marker.unit}
                              </span>
                            </div>

                            <span className="block text-[10px] text-[#064E3B]/60 dark:text-white/40 mt-1 font-mono">
                              Ref: {marker.reference} {marker.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 3: LONGITUDINAL CARE TIMELINE
                  =============================================================== */}
              {activeTab === "timeline" && (
                <div className="space-y-4 max-w-4xl">
                  <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-4 shadow-sm">
                    <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                      Longitudinal Patient Medical Timeline
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#064E3B]/20 dark:before:bg-white/20">
                      {activePatient.timelineMilestones.map((event) => (
                        <div key={event.id} className="relative space-y-1">
                          <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#064E3B] dark:bg-[#10B981] ring-4 ring-white dark:ring-[#0B1D17]" />
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                              {event.title}
                            </h4>
                            <span className="text-[10px] font-mono text-[#064E3B]/60 dark:text-white/50">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-xs text-[#064E3B]/80 dark:text-[#ECFDF5]/80 leading-relaxed">
                            {event.summary}
                          </p>
                          <span className="block text-[10px] font-mono text-emerald-700 dark:text-[#10B981]">
                            Facility: {event.facility}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 4: DOCTOR AI COPILOT INTERACTION
                  =============================================================== */}
              {activeTab === "copilot" && (
                <div className="space-y-4 max-w-4xl flex flex-col h-[520px]">
                  <div className="flex-1 rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-4.5 flex flex-col overflow-hidden shadow-sm">
                    <div className="shrink-0 flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                          Clinical Copilot • {activePatient.name} Record Context
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700">
                        Zero-Data Leakage AI
                      </span>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {copilotMessages.map((msg, idx) => {
                        const isDoc = msg.sender === "doctor";
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${
                              isDoc ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                                isDoc
                                  ? "bg-[#064E3B] text-white rounded-tr-none"
                                  : "bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/15 dark:border-white/10 text-[#064E3B] dark:text-[#ECFDF5] rounded-tl-none"
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                              <span
                                className={`block text-[9.5px] mt-1.5 font-mono ${
                                  isDoc ? "text-white/70" : "text-[#064E3B]/50 dark:text-white/40"
                                }`}
                              >
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {isCopilotLoading && (
                        <div className="flex items-center gap-2 text-xs text-[#064E3B]/60 dark:text-white/50 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Doctor Copilot synthesizing clinical recommendation...</span>
                        </div>
                      )}
                    </div>

                    {/* Input Bar */}
                    <div className="shrink-0 pt-3 border-t border-[#064E3B]/10 dark:border-white/10 flex items-center gap-2">
                      <input
                        type="text"
                        value={copilotQuery}
                        onChange={(e) => setCopilotQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendCopilotMessage()}
                        placeholder={`Ask AI about ${activePatient.name}'s labs, symptoms, or safe dosage...`}
                        className="flex-1 h-9 rounded-full border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                      />
                      <button
                        type="button"
                        onClick={handleSendCopilotMessage}
                        className="h-9 w-9 flex items-center justify-center rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs hover:scale-105 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================================
                RIGHT PANEL: LIVE PRESCRIPTION & NEXT DOSE DISPENSER
                =================================================================== */}
            <aside className="w-full lg:w-96 shrink-0 bg-white dark:bg-[#0B1D17] p-5 overflow-y-auto space-y-4">
              <div className="border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Prescribe Next Dose (Live Sync)</span>
                </div>
                <p className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                  Directly updates {activePatient.name}&apos;s medication tracker in real-time.
                </p>
              </div>

              {/* Status alerts */}
              {prescriptionError && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 font-bold">
                  {prescriptionError}
                </div>
              )}

              {prescriptionSuccess && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  {prescriptionSuccess}
                </div>
              )}

              {/* Prescription Form */}
              <form onSubmit={handlePrescribeMedication} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Brand Medicine Name
                  </label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Pantoprazole 40"
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Generic Chemical Formulation
                  </label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="Pantoprazole Sodium 40mg"
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                      Dosage Strength
                    </label>
                    <input
                      type="text"
                      required
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="40 mg"
                      className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                      Total Doses
                    </label>
                    <input
                      type="number"
                      required
                      value={totalDoses}
                      onChange={(e) => setTotalDoses(Number(e.target.value))}
                      className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Frequency Schedule
                  </label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Once daily before breakfast"
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Next Scheduled Dose Timing
                  </label>
                  <input
                    type="text"
                    required
                    value={nextDoseTime}
                    onChange={(e) => setNextDoseTime(e.target.value)}
                    placeholder="Tonight at 08:30 PM"
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-[#10B981] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Clinical Instructions & Patient Notes
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Specific dietary instructions..."
                    className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-600/20 p-2.5 flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-[#10B981] shrink-0" />
                  <span>
                    Aether Allergy Guard actively cross-checks against Penicillin, Sulfa, and active drugs.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-3 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-102 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Submit Prescription & Sync Live to Patient</span>
                </button>
              </form>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
