"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Pill,
  Sparkles,
  FileText,
  Clock,
  AlertTriangle,
  Unlock,
  ShieldAlert,
  Lock,
} from "lucide-react";
import {
  PatientRecord,
  getDoctorPatientQueue,
  prescribeMultipleMedications,
  INITIAL_PATIENT_QUEUE,
  hasClinicianAccess,
  logClinicianAccessEvent,
} from "@/services/clinicalHandoverService";
import {
  getActiveDoctorProfile,
  DoctorProfile,
  VERIFIED_DOCTORS_REGISTRY,
} from "@/services/authService";

import PatientQueueSidebar, { PatientDisplayInfo } from "@/components/doctor/PatientQueueSidebar";
import ConsentGateCard from "@/components/doctor/ConsentGateCard";
import DoctorCopilotTab, { CopilotMessage } from "@/components/doctor/DoctorCopilotTab";
import PrescriptionDispenserTab, { MultiRxItem } from "@/components/doctor/PrescriptionDispenserTab";
import HandoverBriefTab from "@/components/doctor/HandoverBriefTab";
import LabBiomarkersTab from "@/components/doctor/LabBiomarkersTab";
import TimelineTab from "@/components/doctor/TimelineTab";

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

  // Patient Consent Gate State (ABDM Record Verification)
  const [unlockedPatients, setUnlockedPatients] = useState<Record<string, boolean>>({});
  const [consentNotice, setConsentNotice] = useState<string | null>(null);

  // Doctor AI Copilot interactive chat state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      sender: "ai",
      text: "Greetings Doctor. I am connected to the patient's triage dialogue, verified Penicillin allergy records, and CBC lab panel (WBC: 11.2 K/µL). What clinical guidance or prescription check do you need?",
      timestamp: "Just now",
    },
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  // Multi-Medicine Prescription Builder State
  const [rxList, setRxList] = useState<MultiRxItem[]>([
    {
      id: "item-1",
      brandName: "Pantoprazole 40mg",
      genericName: "Pantoprazole Sodium",
      dosage: "40 mg",
      frequency: "Once daily",
      timesOfDay: ["Morning (08:00 AM)"],
      mealTiming: "Before Food (Empty stomach)",
      startDate: "Today",
      endDate: "14 Days",
      totalDays: 14,
      instructions: "Take with half glass of water 30 minutes before breakfast.",
    },
    {
      id: "item-2",
      brandName: "Sucralfate Oral Suspension",
      genericName: "Sucralfate",
      dosage: "10 ml (1g)",
      frequency: "Twice daily",
      timesOfDay: ["Morning (08:00 AM)", "Night (09:30 PM)"],
      mealTiming: "Before Food (Empty stomach)",
      startDate: "Today",
      endDate: "7 Days",
      totalDays: 7,
      instructions: "Take 1 hour before morning and evening meals.",
    },
  ]);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState<string | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  // Synchronize authenticated clinician profile
  useEffect(() => {
    const profile = getActiveDoctorProfile();
    if (profile) {
      setDoctorProfile(profile);
    }
    const queue = getDoctorPatientQueue();
    setPatientQueue(queue);

    if (queue.length > 0 && !selectedPatientId) {
      setSelectedPatientId(queue[0].patientId);
    }
  }, [selectedPatientId]);

  // Active Selected Patient Record
  const activePatient =
    patientQueue.find((p) => p.patientId === selectedPatientId) ||
    patientQueue[0] ||
    INITIAL_PATIENT_QUEUE[0];

  const isCurrentPatientUnlocked =
    Boolean(unlockedPatients[activePatient.patientId]) ||
    hasClinicianAccess(doctorProfile.doctorId, activePatient.patientId);

  const isEmergencyCase = activePatient.urgencyLevel === "high_critical";

  // Patient Display Resolver with Sovereign Privacy Masking
  const getPatientDisplay = (patient: PatientRecord): PatientDisplayInfo => {
    const hasAccess =
      Boolean(unlockedPatients[patient.patientId]) ||
      hasClinicianAccess(doctorProfile.doctorId, patient.patientId);
    const isEmerg = patient.urgencyLevel === "high_critical";

    if (hasAccess || isEmerg) {
      return {
        name: patient.name,
        initials: patient.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        complaint: patient.chiefComplaint,
        abha: patient.abhaId,
        demographics: `${patient.age}y • ${patient.gender} • Blood Group: ${patient.bloodGroup}`,
        allergies: patient.allergies.join(", "),
        isMasked: false,
        isEmergencyBypass: isEmerg && !hasAccess,
      };
    }

    return {
      name: `Protected Patient (${patient.patientId})`,
      initials: "PT",
      complaint: "🔒 Consent Protected: Awaiting active ABDM consent record grant",
      abha: "ABDM: Access Restricted",
      demographics: "Personal Info Protected • Awaiting Patient Consent Grant",
      allergies: "Protected under Sovereign Privacy",
      isMasked: true,
      isEmergencyBypass: false,
    };
  };

  const activeDisplay = getPatientDisplay(activePatient);

  // Handle Unlocking via ABDM Consent Verification
  const handleVerifyConsent = () => {
    const hasAccess = hasClinicianAccess(doctorProfile.doctorId, activePatient.patientId);
    logClinicianAccessEvent({
      patientId: activePatient.patientId,
      clinicianIdentifier: doctorProfile.doctorId,
      accessType: "consent_verification",
      granted: hasAccess,
    });
    if (hasAccess) {
      setUnlockedPatients((prev) => ({ ...prev, [activePatient.patientId]: true }));
      setConsentNotice(null);
    } else {
      setConsentNotice(`⚠️ No active consent grant found for Dr. ${doctorProfile.name} on record ${activePatient.patientId}. Please ask the patient to grant access via their My Doctor portal.`);
    }
  };

  // Handle Doctor AI Copilot inquiry
  const handleSendCopilotMessage = async (queryOverride?: string) => {
    const textToSubmit = (queryOverride || copilotQuery).trim();
    if (!textToSubmit || isCopilotLoading) return;

    const newMsg: CopilotMessage = {
      sender: "doctor",
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

    if (
      lower.includes("antibiotic") ||
      lower.includes("penicillin") ||
      lower.includes("amoxicillin") ||
      lower.includes("augmentin") ||
      lower.includes("contraindication") ||
      lower.includes("allergy")
    ) {
      aiResponseText = `**Clinical Guidance regarding Antibiotic & Drug Allergy Safety:**\n\n- ⚠️ **Contraindicated**: Patient has a documented severe allergy to **Penicillin & Amoxicillin** (anaphylaxis risk). Avoid all aminopenicillins, piperacillin, and augmentin formulations.\n- **Safe Alternatives**: Macrolides (e.g. **Azithromycin 500mg** or **Clarithromycin 500mg**) or Fluoroquinolones.\n- **WBC Correlation**: Current WBC is **11.2 K/µL** (mild reactive leukocytosis). If gastritis is non-infectious, antibiotic therapy is not recommended.`;
    } else if (lower.includes("wbc") || lower.includes("lab") || lower.includes("blood") || lower.includes("cbc") || lower.includes("ecg")) {
      aiResponseText = `**Biometric & Lab Summary:**\n\n- **WBC**: **11.2 K/µL** (High - Normal Ref: 4.5 - 11.0). Indicates mild reactive leukocytosis consistent with acute mucosal irritation or physiological stress.\n- **Kidney Function**: Serum Creatinine is normal at **0.92 mg/dL**.\n- **Metabolic**: Fasting blood glucose is normal at **98 mg/dL**.\n- **ECG Reading**: Normal Sinus Rhythm (72 bpm), normal PR/QRS intervals.\n- **Recommendation**: Repeat CBC panel in 7 days if dyspeptic symptoms persist after PPI therapy.`;
    } else if (lower.includes("dose") || lower.includes("pantoprazole") || lower.includes("gastritis") || lower.includes("dyspepsia")) {
      aiResponseText = `**Dyspepsia / Gastritis Dosing Guidance:**\n\n- **Suggested First-Line**: **Pantoprazole 40mg** delayed-release tablet once daily, taken 30 minutes before breakfast for 14 days.\n- **Adjunct**: Sucralfate oral suspension (1g TID) or Antacid gel as needed for acute breakthrough burning.\n- **Live Sync**: You can dispense multiple medicines in the **Prescriptions & Dosing** tab to update the patient's tracker live.`;
    } else {
      aiResponseText = `**Clinical Synthesis for ${activePatient.name}:**\n\n- **Presentation**: ${activePatient.chiefComplaint}.\n- **Risk Stratification**: Evaluated as **${activePatient.urgencyLevel.toUpperCase()}** priority.\n- **Sensitive Flag**: Patient confided anxiety regarding recent bowel frequency changes and fear of infection.\n- **Recommended Next Step**: Complete abdominal exam and prescribe appropriate non-penicillin therapies.`;
    }

    setCopilotMessages((prev) => [
      ...prev,
      {
        sender: "ai",
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
          MAIN CLINICAL 2-COLUMN WORKSPACE (Clean, Spacious & Modularized)
          ========================================================================= */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-[#064E3B]/10 dark:divide-white/10">
        {/* LEFT PANE: LIVE PATIENT QUEUE (Modular Component) */}
        <PatientQueueSidebar
          patients={patientQueue}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          urgencyFilter={urgencyFilter}
          onUrgencyFilterChange={setUrgencyFilter}
          getPatientDisplay={getPatientDisplay}
        />

        {/* CENTER/RIGHT PANE: SPACIOUS CLINICAL WORKSPACE & TABS */}
        <main className="flex-1 flex flex-col h-full min-h-0 bg-[#F9FBF9] dark:bg-[#081511] overflow-hidden pb-24">
          {/* Patient Header Banner */}
          <div className="shrink-0 bg-white dark:bg-[#0B1D17] border-b border-[#064E3B]/10 dark:border-white/10 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 dark:bg-[#10B981]/20 font-serif text-base font-bold text-emerald-800 dark:text-[#10B981] shrink-0">
                {activeDisplay.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    {activeDisplay.name}
                  </h2>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-[#10B981]">
                    {activePatient.patientId}
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/15 dark:border-white/10 px-2 py-0.5 text-[9.5px] font-mono text-[#064E3B]/80 dark:text-white/80">
                    {activeDisplay.abha}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#064E3B]/70 dark:text-white/60">
                  <span>{activeDisplay.demographics}</span>
                </div>
              </div>
            </div>

            {/* Documented Allergies Tag & Lock Status */}
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-semibold text-[11px]">
                  Allergies: {activeDisplay.allergies}
                </span>
              </div>

              {isCurrentPatientUnlocked ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Consent Active</span>
                </span>
              ) : isEmergencyCase ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Emergency Override</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-[#132D26] border border-emerald-600/30 px-2.5 py-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-[#10B981]" />
                  <span>Consent Required</span>
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
              <span>Lab OCR & ECG ({activePatient.recentLabMarkers.length})</span>
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
            {!isCurrentPatientUnlocked && !isEmergencyCase ? (
              <ConsentGateCard
                patient={activePatient}
                doctorProfile={doctorProfile}
                consentNotice={consentNotice}
                onVerifyConsent={handleVerifyConsent}
              />
            ) : (
              <>
                {activeTab === "copilot" && (
                  <DoctorCopilotTab
                    patient={activePatient}
                    copilotMessages={copilotMessages}
                    copilotQuery={copilotQuery}
                    onCopilotQueryChange={setCopilotQuery}
                    onSendCopilotMessage={handleSendCopilotMessage}
                    isCopilotLoading={isCopilotLoading}
                  />
                )}

                {activeTab === "dispenser" && (
                  <PrescriptionDispenserTab
                    patient={activePatient}
                    rxList={rxList}
                    onAddRxItem={handleAddRxItem}
                    onRemoveRxItem={handleRemoveRxItem}
                    onUpdateRxItem={handleUpdateRxItem}
                    onToggleTimeOfDay={handleToggleTimeOfDay}
                    onPrescribeAllMedications={handlePrescribeAllMedications}
                    prescriptionError={prescriptionError}
                    prescriptionSuccess={prescriptionSuccess}
                  />
                )}

                {activeTab === "handover" && (
                  <HandoverBriefTab patient={activePatient} />
                )}

                {activeTab === "labs" && (
                  <LabBiomarkersTab patient={activePatient} />
                )}

                {activeTab === "timeline" && (
                  <TimelineTab patient={activePatient} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
