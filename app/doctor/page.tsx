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
  Send,
  Eye,
  Lock,
  Unlock,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  KeyRound,
  Award,
  Star,
} from "lucide-react";
import {
  PatientRecord,
  getDoctorPatientQueue,
  prescribeMultipleMedications,
  INITIAL_PATIENT_QUEUE,
} from "@/services/clinicalHandoverService";
import {
  getActiveDoctorProfile,
  DoctorProfile,
  VERIFIED_DOCTORS_REGISTRY,
  getPatientConsentPin,
  verifyPatientConsentPin,
} from "@/services/authService";

interface MultiRxItem {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[]; // e.g. ["Morning (08:00 AM)", "Night (09:30 PM)"]
  mealTiming: string; // "Before Food" | "After Food" | "With Food"
  startDate: string;
  endDate: string;
  totalDays: number;
  instructions: string;
}

export default function DoctorPortalPage() {
  const router = useRouter();

  // Active Doctor profile state
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(VERIFIED_DOCTORS_REGISTRY[0]);

  // Patients queue state
  const [patientQueue, setPatientQueue] = useState<PatientRecord[]>(INITIAL_PATIENT_QUEUE);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("AETH-PT-9842");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "high_critical" | "moderate" | "routine">("all");

  // Center Workspace active tab (Doctor Copilot is FIRST/DEFAULT)
  const [activeTab, setActiveTab] = useState<"copilot" | "dispenser" | "handover" | "labs" | "timeline">("copilot");
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Patient Consent PIN Gate State
  const [unlockedPatients, setUnlockedPatients] = useState<Record<string, boolean>>({
    "AETH-PT-9842": false, // Protected by default
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Doctor AI Copilot interactive chat state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<{ sender: "doctor" | "ai"; text: string; timestamp: string }[]>([
    {
      sender: "ai",
      text: "Greetings Doctor. I am connected to the patient's triage dialogue, verified Penicillin allergy records, and CBC lab panel (WBC: 11.2 K/µL). What clinical guidance or prescription check do you need?",
      timestamp: "Just now",
    },
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Quick Doctor Copilot Clinical Prompts
  const COPILOT_QUICK_ACTIONS = [
    { label: "Check Penicillin Allergy Safety", query: "Are there any contraindications with prescribing cephalosporins or beta-lactams for this patient's Penicillin allergy?" },
    { label: "Summarize WBC & Labs", query: "Summarize the patient's recent CBC panel and clinical significance of WBC at 11.2 K/µL." },
    { label: "Dyspepsia Dosing Advice", query: "Recommend first-line dosage and duration for acute non-ulcer dyspepsia." },
  ];

  // Multi-Medicine Prescription Builder State
  const [rxList, setRxList] = useState<MultiRxItem[]>([
    {
      id: "item-1",
      brandName: "Pantoprazole 40",
      genericName: "Pantoprazole Sodium 40mg Delayed-Release",
      dosage: "40 mg",
      frequency: "Once daily in the morning",
      timesOfDay: ["Morning (08:00 AM)"],
      mealTiming: "Before Food (Empty stomach)",
      startDate: "Today (Aug 25, 2026)",
      endDate: "Sep 08, 2026",
      totalDays: 14,
      instructions: "Take 30 mins before morning meal with water. Avoid spicy or acidic foods.",
    },
  ]);
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

  const activePatient =
    patientQueue.find((p) => p.patientId === selectedPatientId) ||
    patientQueue[0] ||
    INITIAL_PATIENT_QUEUE[0];

  const isCurrentPatientUnlocked = unlockedPatients[activePatient.patientId] === true;

  // Filtered patient list
  const filteredPatients = patientQueue.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency = urgencyFilter === "all" ? true : p.urgencyLevel === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  // Handle Unlocking Patient Consent PIN
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const valid = verifyPatientConsentPin(pinInput);
    if (valid) {
      setUnlockedPatients((prev) => ({ ...prev, [activePatient.patientId]: true }));
      setPinInput("");
    } else {
      setPinError(`⚠️ Invalid PIN. Please request the 4-digit Consent PIN from ${activePatient.name} (Default Demo PIN: ${getPatientConsentPin()}).`);
    }
  };

  // Handle Doctor AI Copilot inquiry
  const handleSendCopilotMessage = async (queryOverride?: string) => {
    const textToSubmit = (queryOverride || copilotQuery).trim();
    if (!textToSubmit || isCopilotLoading) return;

    const newMsg = {
      sender: "doctor" as const,
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setCopilotMessages((prev) => [...prev, newMsg]);
    setCopilotQuery("");
    setIsCopilotLoading(true);

    await new Promise((r) => setTimeout(r, 550));

    // Context-aware AI synthesis for doctor
    const lower = textToSubmit.toLowerCase();
    let aiResponseText = "";

    if (lower.includes("antibiotic") || lower.includes("penicillin") || lower.includes("contraindication") || lower.includes("allergy")) {
      aiResponseText = `**Clinical Guidance regarding Antibiotic & Drug Allergy Safety:**\n\n- ⚠️ **Contraindicated**: Patient has a documented severe allergy to **Penicillin & Amoxicillin** (anaphylaxis risk). Avoid all aminopenicillins, piperacillin, and augmentin formulations.\n- **Safe Alternatives**: Macrolides (e.g. **Azithromycin 500mg** or **Clarithromycin 500mg**) or Fluoroquinolones.\n- **WBC Correlation**: Current WBC is **11.2 K/µL** (mild reactive leukocytosis). If gastritis is non-infectious, antibiotic therapy is not recommended.`;
    } else if (lower.includes("wbc") || lower.includes("lab") || lower.includes("blood") || lower.includes("cbc")) {
      aiResponseText = `**Biometric & Lab Summary:**\n\n- **WBC**: **11.2 K/µL** (High - Normal Ref: 4.5 - 11.0). Indicates mild reactive leukocytosis consistent with acute mucosal irritation or physiological stress.\n- **Kidney Function**: Serum Creatinine is normal at **0.92 mg/dL**.\n- **Metabolic**: Fasting blood glucose is normal at **98 mg/dL**.\n- **Recommendation**: Repeat CBC panel in 7 days if dyspeptic symptoms persist after PPI therapy.`;
    } else if (lower.includes("dose") || lower.includes("pantoprazole") || lower.includes("gastritis") || lower.includes("dyspepsia")) {
      aiResponseText = `**Dyspepsia / Gastritis Dosing Guidance:**\n\n- **Suggested First-Line**: **Pantoprazole 40mg** delayed-release tablet once daily, taken 30 minutes before breakfast for 14 days.\n- **Adjunct**: Sucralfate oral suspension (1g TID) or Antacid gel as needed for acute breakthrough burning.\n- **Live Sync**: You can dispense multiple medicines in the **Prescriptions & Dosing** tab to update the patient's tracker live.`;
    } else {
      aiResponseText = `**Clinical Synthesis for ${activePatient.name}:**\n\n- **Presentation**: ${activePatient.chiefComplaint}.\n- **Risk Stratification**: Evaluated as **${activePatient.urgencyLevel.toUpperCase()}** priority.\n- **Sensitive Flag**: Patient confided anxiety regarding recent bowel frequency changes and fear of infection.\n- **Recommended Next Step**: Complete abdominal exam and prescribe appropriate non-penicillin therapies.`;
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

  // Multi-Rx item management
  const handleAddRxItem = () => {
    setRxList((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        brandName: "",
        genericName: "",
        dosage: "1 Tablet",
        frequency: "Once daily",
        timesOfDay: ["Morning (08:00 AM)"],
        mealTiming: "After Food",
        startDate: "Today",
        endDate: "5 Days from now",
        totalDays: 5,
        instructions: "Take with water as directed.",
      },
    ]);
  };

  const handleRemoveRxItem = (id: string) => {
    if (rxList.length <= 1) return;
    setRxList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateRxItem = (id: string, field: keyof MultiRxItem, value: any) => {
    setRxList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleToggleTimeOfDay = (id: string, timeOption: string) => {
    setRxList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const exists = item.timesOfDay.includes(timeOption);
        const updated = exists
          ? item.timesOfDay.filter((t) => t !== timeOption)
          : [...item.timesOfDay, timeOption];
        return { ...item, timesOfDay: updated.length > 0 ? updated : [timeOption] };
      })
    );
  };

  // Handle Prescribing All Medications Live
  const handlePrescribeAllMedications = (e: React.FormEvent) => {
    e.preventDefault();
    setPrescriptionError(null);
    setPrescriptionSuccess(null);

    // Validate
    for (const item of rxList) {
      if (!item.brandName.trim()) {
        setPrescriptionError("Please fill in the medicine name for all prescription entries.");
        return;
      }
    }

    const payload = rxList.map((item) => ({
      brandName: item.brandName,
      genericName: item.genericName || item.brandName,
      dosage: item.dosage,
      frequency: item.frequency,
      timesOfDay: item.timesOfDay,
      mealTiming: item.mealTiming,
      startDate: item.startDate,
      endDate: item.endDate,
      totalDays: item.totalDays,
      instructions: item.instructions,
      doctorName: doctorProfile.name,
      hospitalName: doctorProfile.hospitalAffiliation,
    }));

    const res = prescribeMultipleMedications(activePatient.patientId, payload);

    if (!res.success) {
      setPrescriptionError(res.error || "Failed to dispense medications.");
      return;
    }

    setPrescriptionSuccess(
      `✓ Successfully dispensed ${rxList.length} medication(s) directly to ${activePatient.name}'s live daily tracker!`
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-[#F9FBF9] dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] font-sans antialiased overflow-hidden">
      {/* =========================================================================
          DOCTOR CLINICIAN IDENTITY STRIP
          ========================================================================= */}
      <div className="shrink-0 flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 bg-white/80 dark:bg-[#0B1D17]/80 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#10B981] shrink-0">
            <Stethoscope className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] leading-none">
                {doctorProfile.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>NMC Verified</span>
              </span>
            </div>
            <p className="text-[10.5px] text-[#064E3B]/60 dark:text-[#A7F3D0]/60 font-mono mt-0.5">
              {doctorProfile.hospitalAffiliation} • {doctorProfile.college || "AIIMS New Delhi"} • Reg: {doctorProfile.registrationNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/doctor/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/70 dark:bg-[#0F241E] hover:bg-emerald-100 dark:hover:bg-[#132D26] px-3.5 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 transition-all shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Doctor Profile & Credentials</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          MAIN CLINICAL 2-COLUMN WORKSPACE (Clean & Breathable)
          ========================================================================= */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-[#064E3B]/10 dark:divide-white/10">
        {/* -----------------------------------------------------------------------
            LEFT PANE: LIVE PATIENT QUEUE (280px)
            ----------------------------------------------------------------------- */}
        <aside className="w-72 lg:w-80 shrink-0 flex flex-col h-full bg-white dark:bg-[#0B1D17] overflow-hidden">
          {/* Queue Header & Search */}
          <div className="p-3.5 border-b border-[#064E3B]/10 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                <span>Clinical Patient Queue</span>
              </span>
              <span className="rounded-full bg-[#064E3B]/10 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                {filteredPatients.length} Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-[#064E3B]/50 dark:text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, ID, symptoms..."
                className="w-full h-8.5 rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] pl-9 pr-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/50 dark:placeholder-white/40 focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
              />
            </div>

            {/* Urgency Filter Badges */}
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setUrgencyFilter("all")}
                className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
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
                className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
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
                className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
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
                className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
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
                  className={`w-full text-left p-3.5 transition-all flex flex-col gap-1.5 relative cursor-pointer ${
                    isSelected
                      ? "bg-[#F9FBF9] dark:bg-[#132D26] border-l-4 border-l-[#064E3B] dark:border-l-[#10B981]"
                      : "hover:bg-[#F9FBF9]/60 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                        {patient.name}
                      </span>
                      <span className="text-[9.5px] font-mono text-[#064E3B]/50 dark:text-white/40">
                        {patient.patientId}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider ${
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

                  <p className="text-[11px] text-[#064E3B]/75 dark:text-[#A7F3D0]/75 line-clamp-1 leading-snug">
                    {patient.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[9.5px] text-[#064E3B]/50 dark:text-white/40 pt-0.5">
                    <span>
                      {patient.age}y • {patient.gender} • {patient.bloodGroup}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#064E3B]/60 dark:text-white/40" />
                      <span>{patient.lastTriageAt}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            CENTER/RIGHT PANE: SPACIOUS CLINICAL WORKSPACE & FULL-WIDTH TABS
            ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col h-full min-h-0 bg-[#F9FBF9] dark:bg-[#081511] overflow-hidden">
          {/* Patient Quick Header Banner */}
          <div className="shrink-0 bg-white dark:bg-[#0B1D17] border-b border-[#064E3B]/10 dark:border-white/10 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 dark:bg-[#10B981]/20 font-serif text-base font-bold text-emerald-800 dark:text-[#10B981] shrink-0">
                {activePatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    {activePatient.name}
                  </h2>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-[#10B981]">
                    {activePatient.patientId}
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/15 dark:border-white/10 px-2 py-0.5 text-[9.5px] font-mono text-[#064E3B]/80 dark:text-white/80">
                    ABDM: {activePatient.abhaId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#064E3B]/70 dark:text-white/60">
                  <span>{activePatient.age} yrs</span>
                  <span>•</span>
                  <span>{activePatient.gender}</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Blood: {activePatient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Documented Allergies Tag */}
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-semibold text-[11px]">
                  Allergies: {activePatient.allergies.join(", ")}
                </span>
              </div>

              {isCurrentPatientUnlocked ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PIN Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>PIN Protected</span>
                </span>
              )}
            </div>
          </div>

          {/* Workspace Tabs Navigation */}
          <div className="shrink-0 flex items-center gap-1.5 px-4 pt-2.5 border-b border-[#064E3B]/10 dark:border-white/10 bg-white/50 dark:bg-[#0B1D17]/50 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "copilot"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Doctor Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dispenser")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "dispenser"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prescriptions & Dosing ({rxList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("handover")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "handover"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Handover Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("labs")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "labs"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab OCR ({activePatient.recentLabMarkers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "timeline"
                  ? "border-[#064E3B] text-[#064E3B] dark:border-[#10B981] dark:text-[#10B981]"
                  : "border-transparent text-[#064E3B]/60 dark:text-white/60 hover:text-[#064E3B]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>EHR Timeline ({activePatient.timelineMilestones.length})</span>
            </button>
          </div>

          {/* Tab Viewport */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* ===============================================================
                CONSENT PIN GATE (If patient is protected by PIN)
                =============================================================== */}
            {!isCurrentPatientUnlocked ? (
              <div className="max-w-xl mx-auto my-6 rounded-3xl border border-amber-300 dark:border-amber-700/50 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 dark:from-[#1A1810] dark:via-[#0F241E] dark:to-[#1A1810] p-6 shadow-md space-y-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-700 dark:text-amber-400 mx-auto">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Patient Telemetry Consent Gate
                  </h3>
                  <p className="text-xs text-[#064E3B]/80 dark:text-white/70 mt-1 max-w-md mx-auto leading-relaxed">
                    Under ABDM Sovereign Health Regulations, access to <strong>{activePatient.name}</strong>&apos;s live AI triage chat, SBAR clinical handover, and biomarker data requires the patient&apos;s 4-digit Consent PIN.
                  </p>
                </div>

                <form onSubmit={handleVerifyPin} className="max-w-xs mx-auto space-y-3 pt-2">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN (Demo: 4892)"
                    className="w-full h-11 text-center font-mono text-lg tracking-widest rounded-2xl border border-[#064E3B]/20 dark:border-white/20 bg-white dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-amber-600"
                  />

                  {pinError && (
                    <p className="text-xs text-rose-700 dark:text-rose-400 font-bold">
                      {pinError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-10 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] text-white dark:text-[#042F24] text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                  >
                    Verify & Unlock Patient Records
                  </button>
                </form>

                <p className="text-[10.5px] text-[#064E3B]/60 dark:text-white/50 font-mono">
                  Default Demo Patient PIN: <strong>{getPatientConsentPin()}</strong> (Viewable on Patient&apos;s &quot;My Doctor&quot; page)
                </p>
              </div>
            ) : (
              <>
                {/* ===============================================================
                    TAB 1: DOCTOR AI COPILOT INTERACTION
                    =============================================================== */}
                {activeTab === "copilot" && (
                  <div className="space-y-4 max-w-5xl flex flex-col h-full min-h-[480px]">
                    {/* Quick Prompts Chips */}
                    <div className="shrink-0 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-[#064E3B]/60 dark:text-white/50 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quick Inquiries:</span>
                      </span>
                      {COPILOT_QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendCopilotMessage(action.query)}
                          className="rounded-full border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0F241E] hover:bg-emerald-50 dark:hover:bg-[#132D26] hover:border-emerald-600/40 px-3.5 py-1 text-[11px] font-semibold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs cursor-pointer"
                        >
                          {action.label} →
                        </button>
                      ))}
                    </div>

                    {/* Copilot Chat Box */}
                    <div className="flex-1 rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 flex flex-col overflow-hidden shadow-2xs">
                      <div className="shrink-0 flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                            Clinical AI Copilot • Patient Context: {activePatient.name} ({activePatient.patientId})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-[#10B981] font-semibold">
                          ABDM Consent Verified
                        </span>
                      </div>

                      {/* Messages */}
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
                                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                                  isDoc
                                    ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] rounded-tr-none font-medium"
                                    : "bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/15 dark:border-white/10 text-[#064E3B] dark:text-[#ECFDF5] rounded-tl-none shadow-2xs"
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                <span
                                  className={`block text-[9px] mt-1.5 font-mono ${
                                    isDoc ? "text-white/70 dark:text-[#042F24]/70" : "text-[#064E3B]/40 dark:text-white/40"
                                  }`}
                                >
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {isCopilotLoading && (
                          <div className="flex items-center gap-2 text-xs text-[#064E3B]/60 dark:text-white/50 animate-pulse py-2">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Doctor Copilot synthesizing pharmacology & EHR timeline...</span>
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
                          placeholder={`Ask AI about ${activePatient.name}'s CBC markers, allergy safety, or dosage regimen...`}
                          className="flex-1 h-10 rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendCopilotMessage()}
                          className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs cursor-pointer hover:scale-105 transition-transform"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    TAB 2: MULTI-MEDICATION PRESCRIPTION BUILDER (SPACIOUS & FULL-WIDTH)
                    =============================================================== */}
                {activeTab === "dispenser" && (
                  <div className="space-y-5 max-w-5xl">
                    <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#064E3B]/10 dark:border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-2 font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                            <Pill className="w-5 h-5 text-emerald-600" />
                            <span>Multi-Medication Live Prescription Dispenser</span>
                          </div>
                          <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                            Add multiple medications, specify time of day, meal timing, and duration. Broadcasts directly to {activePatient.name}&apos;s tracker.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddRxItem}
                          className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Another Medicine</span>
                        </button>
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

                      {/* Multi-Rx Form */}
                      <form onSubmit={handlePrescribeAllMedications} className="space-y-4">
                        {rxList.map((item, index) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-4.5 space-y-4 relative"
                          >
                            <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/5 pb-2">
                              <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064E3B] text-white text-[10px]">
                                  {index + 1}
                                </span>
                                <span>Medication Order #{index + 1}</span>
                              </span>

                              {rxList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRxItem(item.id)}
                                  className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              <div className="lg:col-span-2">
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  Brand Medicine Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.brandName}
                                  onChange={(e) => handleUpdateRxItem(item.id, "brandName", e.target.value)}
                                  placeholder="e.g. Pantoprazole 40 or Azithromycin 500"
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  Dosage / Strength
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.dosage}
                                  onChange={(e) => handleUpdateRxItem(item.id, "dosage", e.target.value)}
                                  placeholder="e.g. 40 mg / 1 Tablet"
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  Duration (Days)
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={1}
                                  value={item.totalDays}
                                  onChange={(e) => handleUpdateRxItem(item.id, "totalDays", Number(e.target.value))}
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                />
                              </div>
                            </div>

                            {/* Time of Day Checkboxes */}
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                                When to Take (Time of Day Schedule)
                              </label>
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                {[
                                  "Morning (08:00 AM)",
                                  "Afternoon (01:00 PM)",
                                  "Evening (06:30 PM)",
                                  "Night (09:30 PM)",
                                ].map((timeOpt) => {
                                  const isChecked = item.timesOfDay.includes(timeOpt);
                                  return (
                                    <button
                                      key={timeOpt}
                                      type="button"
                                      onClick={() => handleToggleTimeOfDay(item.id, timeOpt)}
                                      className={`px-3 py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                                        isChecked
                                          ? "bg-[#064E3B] text-white border-[#064E3B] dark:bg-[#10B981] dark:text-[#042F24] dark:border-[#10B981]"
                                          : "bg-white dark:bg-[#0B1D17] border-[#064E3B]/20 text-[#064E3B]/80 dark:text-white/80"
                                      }`}
                                    >
                                      {isChecked ? "✓ " : "+ "}
                                      {timeOpt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Meal Timing & Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  Meal Timing
                                </label>
                                <select
                                  value={item.mealTiming}
                                  onChange={(e) => handleUpdateRxItem(item.id, "mealTiming", e.target.value)}
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                >
                                  <option value="Before Food (Empty stomach)">Before Food (Empty stomach)</option>
                                  <option value="After Food">After Food</option>
                                  <option value="With Food">With Food</option>
                                  <option value="At Bedtime">At Bedtime</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="text"
                                  value={item.startDate}
                                  onChange={(e) => handleUpdateRxItem(item.id, "startDate", e.target.value)}
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                  End Date
                                </label>
                                <input
                                  type="text"
                                  value={item.endDate}
                                  onChange={(e) => handleUpdateRxItem(item.id, "endDate", e.target.value)}
                                  className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                                />
                              </div>
                            </div>

                            {/* Specific Instructions */}
                            <div>
                              <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                                Dietary & Clinical Instructions
                              </label>
                              <input
                                type="text"
                                value={item.instructions}
                                onChange={(e) => handleUpdateRxItem(item.id, "instructions", e.target.value)}
                                placeholder="e.g. Avoid acidic liquids, take 30 mins prior to breakfast."
                                className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                              />
                            </div>
                          </div>
                        ))}

                        <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-600/20 p-3 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-[#10B981] shrink-0" />
                          <span>Aether Allergy Guard automatically evaluates each formulation against Penicillin & Amoxicillin sensitivities.</span>
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-3.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Dispense & Sync All {rxList.length} Prescription(s) Live</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    TAB 3: AI CLINICAL HANDOVER BRIEF (SBAR)
                    =============================================================== */}
                {activeTab === "handover" && (
                  <div className="space-y-4 max-w-5xl">
                    <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                            SBAR Clinical Protocol Handover
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-[#064E3B]/50 dark:text-white/40">
                          Generated {activePatient.handoverSummary.generatedAt}
                        </span>
                      </div>

                      {/* SBAR Sections */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5">
                          <span className="font-bold text-[10.5px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            S • Situation & Complaint
                          </span>
                          <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                            {activePatient.handoverSummary.situation}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5">
                          <span className="font-bold text-[10.5px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
                            B • Background & Lab Correlation
                          </span>
                          <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                            {activePatient.handoverSummary.background}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5 sm:col-span-2">
                          <span className="font-bold text-[10.5px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            A • Assessment
                          </span>
                          <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
                            {activePatient.handoverSummary.assessment}
                          </p>
                        </div>
                      </div>

                      {/* Confidential Disclosures Box */}
                      {activePatient.handoverSummary.sensitiveDisclosures.length > 0 && (
                        <div className="rounded-2xl border border-purple-300 bg-purple-50/70 dark:bg-purple-950/30 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Confidential Disclosures (Shields Patient Awkwardness)</span>
                          </div>
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
                          R • Recommended Interventions:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {activePatient.handoverSummary.doctorRecommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-xs rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-3 border border-[#064E3B]/10 dark:border-white/5"
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

                    {/* Expandable Compressed Dialogue */}
                    <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>Compressed Patient AI Chat Log</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsChatExpanded(!isChatExpanded)}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {isChatExpanded ? "Hide Log" : "View Log"}
                        </button>
                      </div>

                      {isChatExpanded && (
                        <pre className="rounded-2xl bg-[#081511] text-[#A7F3D0] p-4 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-emerald-900/50">
                          {activePatient.compressedChat}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    TAB 4: LAB REPORTS & BIOMETRIC OCR
                    =============================================================== */}
                {activeTab === "labs" && (
                  <div className="space-y-4 max-w-5xl">
                    <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-2xs">
                      <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                        Extracted Lab Biometrics & CBC Panels
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {activePatient.recentLabMarkers.map((marker, idx) => {
                          const isHigh = marker.status === "high";
                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl p-4 border transition-all ${
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
                                  className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase ${
                                    isHigh
                                      ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                                  }`}
                                >
                                  {marker.status}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1 mt-2.5">
                                <span className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                                  {marker.value}
                                </span>
                                <span className="text-[10px] font-mono text-[#064E3B]/50 dark:text-white/50">
                                  {marker.unit}
                                </span>
                              </div>

                              <span className="block text-[10px] text-[#064E3B]/50 dark:text-white/40 mt-1 font-mono">
                                Ref Range: {marker.reference} {marker.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    TAB 5: LONGITUDINAL CARE TIMELINE
                    =============================================================== */}
                {activeTab === "timeline" && (
                  <div className="space-y-4 max-w-5xl">
                    <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-2xs">
                      <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                        Longitudinal Medical Timeline
                      </h3>

                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#064E3B]/20 dark:before:bg-white/20">
                        {activePatient.timelineMilestones.map((event) => (
                          <div key={event.id} className="relative space-y-1">
                            <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#064E3B] dark:bg-[#10B981] ring-4 ring-white dark:ring-[#0B1D17]" />
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                                {event.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#064E3B]/50 dark:text-white/50">
                                {event.date}
                              </span>
                            </div>
                            <p className="text-xs text-[#064E3B]/80 dark:text-[#ECFDF5]/80 leading-relaxed">
                              {event.summary}
                            </p>
                            <span className="block text-[10px] font-mono text-emerald-700 dark:text-[#10B981]">
                              {event.facility}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
