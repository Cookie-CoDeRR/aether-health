"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ShieldCheck,
  Building2,
  Clock,
  Pill,
  FileText,
  Upload,
  CheckCircle2,
  Send,
  AlertTriangle,
  Sparkles,
  Calendar,
  Phone,
  FileUp,
  MessageSquare,
  Award,
  ChevronRight,
  ExternalLink,
  Zap,
  KeyRound,
  Copy,
  Star,
  Check,
} from "lucide-react";
import {
  DoctorProfile,
  VERIFIED_DOCTORS_REGISTRY,
  getActiveDoctorProfile,
  getPatientConsentPin,
  setPatientConsentPin,
} from "@/services/authService";
import { PrescribedMedication } from "@/services/clinicalHandoverService";

export default function MyDoctorPage() {
  const router = useRouter();

  // Active Attending Doctor
  const [attendingDoctor, setAttendingDoctor] = useState<DoctorProfile>(VERIFIED_DOCTORS_REGISTRY[0]);
  const [isDoctorSelectOpen, setIsDoctorSelectOpen] = useState(false);

  // Patient Consent PIN State
  const [patientPin, setPatientPin] = useState("4892");
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);

  // Active prescriptions given by doctor
  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>([]);

  // Document Submission Form State
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Lab Report / CBC");
  const [docNotes, setDocNotes] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [submittedDocuments, setSubmittedDocuments] = useState<
    { id: string; title: string; category: string; date: string; status: string; notes?: string }[]
  >([
    {
      id: "doc-1",
      title: "Complete Blood Count (CBC) Panel",
      category: "Lab Blood Test",
      date: "Aug 24, 2026",
      status: "Reviewed by Doctor",
      notes: "WBC 11.2 K/µL noted - mild reactive irritation.",
    },
    {
      id: "doc-2",
      title: "Previous Discharge Summary",
      category: "Hospital EHR",
      date: "Jul 15, 2026",
      status: "Archived in EHR",
      notes: "Penicillin allergy documented.",
    },
  ]);

  // Direct Message to Doctor State
  const [patientMessage, setPatientMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null);

  // Load state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load PIN
      setPatientPin(getPatientConsentPin());

      // Load saved attending doctor
      const savedDocId = localStorage.getItem("aether_selected_doctor_id");
      if (savedDocId) {
        const found = VERIFIED_DOCTORS_REGISTRY.find((d) => d.doctorId === savedDocId);
        if (found) setAttendingDoctor(found);
      } else {
        const activeDoc = getActiveDoctorProfile();
        if (activeDoc) setAttendingDoctor(activeDoc);
      }

      // Load medications prescribed
      const storedMeds = localStorage.getItem("aether_medications");
      if (storedMeds) {
        try {
          setPrescriptions(JSON.parse(storedMeds));
        } catch {}
      } else {
        setPrescriptions([
          {
            id: "rx-1",
            brandName: "Pantoprazole 40",
            genericName: "Pantoprazole Sodium 40mg Delayed-Release",
            dosage: "40 mg",
            frequency: "Once daily in the morning",
            timesOfDay: ["Morning (08:00 AM)"],
            mealTiming: "Before Food (Empty stomach)",
            startDate: "Today",
            endDate: "14 Days",
            totalDays: 14,
            totalDoses: 14,
            dosesRemaining: 12,
            takenToday: true,
            takenAt: "08:15 AM",
            hospitalName: "Apollo Specialty Hospital",
            instructions: "Take 30 mins before morning meal. Avoid spicy foods.",
          },
        ]);
      }

      // Load submitted documents
      const storedDocs = localStorage.getItem("aether_patient_submitted_docs");
      if (storedDocs) {
        try {
          setSubmittedDocuments(JSON.parse(storedDocs));
        } catch {}
      }
    }

    // Listen for live prescription sync
    const handleMedUpdate = (e: any) => {
      if (e.detail?.allMeds) {
        setPrescriptions(e.detail.allMeds);
      }
    };
    window.addEventListener("aether-medications-updated", handleMedUpdate);
    return () => window.removeEventListener("aether-medications-updated", handleMedUpdate);
  }, []);

  const handleSelectDoctor = (doctor: DoctorProfile) => {
    setAttendingDoctor(doctor);
    setIsDoctorSelectOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_selected_doctor_id", doctor.doctorId);
      localStorage.setItem("aether_attending_doctor", JSON.stringify(doctor));
      window.dispatchEvent(new CustomEvent("aether-doctor-selected", { detail: { doctor } }));
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(patientPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length >= 4) {
      setPatientConsentPin(newPinInput.trim());
      setPatientPin(newPinInput.trim());
      setIsEditingPin(false);
      setNewPinInput("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsSubmittingDoc(true);
    await new Promise((r) => setTimeout(r, 600));

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Submitted to " + attendingDoctor.name,
      notes: docNotes.trim() || undefined,
    };

    const updated = [newDoc, ...submittedDocuments];
    setSubmittedDocuments(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_patient_submitted_docs", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("aether-patient-document-submitted", {
          detail: { document: newDoc, doctorId: attendingDoctor.doctorId },
        })
      );
    }

    setDocTitle("");
    setDocNotes("");
    setSelectedFileName(null);
    setIsSubmittingDoc(false);
    setUploadSuccessMessage(`✓ Successfully submitted "${newDoc.title}" directly to ${attendingDoctor.name}!`);
    setTimeout(() => setUploadSuccessMessage(null), 5000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientMessage.trim()) return;

    setIsSendingMessage(true);
    await new Promise((r) => setTimeout(r, 500));

    setMessageSuccess(`✓ Message transmitted to ${attendingDoctor.name}'s clinical triage queue.`);
    setPatientMessage("");
    setIsSendingMessage(false);
    setTimeout(() => setMessageSuccess(null), 5000);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#F9FBF9] dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] font-sans antialiased p-4 sm:p-6 lg:p-8 pb-32 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* =========================================================================
            HEADER & HERO
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064E3B]/10 dark:border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-[#A7F3D0] shadow-2xs mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
              <span>Attending Clinical Care Team</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
              My Consulting Doctor & Care Plan
            </h1>
            <p className="text-xs sm:text-sm text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-1">
              Review medications prescribed to you, submit diagnostic documents directly to your clinician, or manage your Telemetry Consent PIN.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDoctorSelectOpen(!isDoctorSelectOpen)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4 py-2.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-soft hover:scale-102 cursor-pointer self-start sm:self-auto"
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isDoctorSelectOpen ? "Close Selector" : "Choose / Change Doctor"}</span>
          </button>
        </div>

        {/* =========================================================================
            PATIENT TELEMETRY ACCESS PIN BANNER (Consent Security)
            ========================================================================= */}
        <div className="rounded-3xl border border-emerald-600/30 dark:border-[#10B981]/30 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 dark:from-[#0B1D17] dark:via-[#0F241E] dark:to-[#0B1D17] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#10B981] shrink-0 mt-0.5">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Your Telemetry Consent PIN
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300">
                  ABDM Privacy Guard
                </span>
              </div>
              <p className="text-xs text-[#064E3B]/75 dark:text-white/70 mt-1 max-w-xl leading-relaxed">
                Provide this 4-digit Consent PIN to your doctor during consultations to grant them access to your live AI triage chat and biomarker records.
              </p>
            </div>
          </div>

          {/* PIN Display & Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-[#081511] p-2 rounded-2xl border border-[#064E3B]/15 dark:border-white/10 shadow-2xs">
            {isEditingPin ? (
              <form onSubmit={handleSaveNewPin} className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="New PIN"
                  className="w-20 h-8 text-center font-mono font-bold text-xs rounded-xl border border-emerald-600 px-1 text-[#064E3B] dark:text-[#ECFDF5]"
                />
                <button
                  type="submit"
                  className="h-8 px-2.5 rounded-xl bg-[#064E3B] text-white text-[11px] font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPin(false)}
                  className="h-8 px-2 text-[11px] text-[#064E3B]/60"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div className="px-3 font-mono font-black text-lg tracking-widest text-[#064E3B] dark:text-[#10B981]">
                  {patientPin}
                </div>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#132D26] hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPin ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPinInput(patientPin);
                    setIsEditingPin(true);
                  }}
                  className="text-[11px] text-[#064E3B]/60 hover:text-[#064E3B] px-1.5 font-bold"
                >
                  Change
                </button>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            DOCTOR SELECTOR DRAWER
            ========================================================================= */}
        {isDoctorSelectOpen && (
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-5 sm:p-6 shadow-lg space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Select Your Consulting Physician
                </h3>
                <p className="text-xs text-[#064E3B]/70 dark:text-white/60">
                  Select a certified specialist to link with your Aether health records and AI triage briefings.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-[#10B981] font-bold">
                {VERIFIED_DOCTORS_REGISTRY.length} Available Specialists
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VERIFIED_DOCTORS_REGISTRY.map((doctor) => {
                const isCurrent = doctor.doctorId === attendingDoctor.doctorId;
                return (
                  <div
                    key={doctor.doctorId}
                    className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? "border-[#064E3B] dark:border-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] ring-2 ring-[#064E3B]/20"
                        : "border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] hover:border-[#064E3B]/40"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                          {doctor.name}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{doctor.rating || 4.9}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-800 dark:text-[#10B981] font-semibold">
                        {doctor.specialization}
                      </p>

                      <p className="text-[10px] text-[#064E3B]/60 dark:text-white/50">
                        {doctor.college || "AIIMS New Delhi"} • {doctor.experienceYears}y Exp
                      </p>

                      <p className="text-[10.5px] text-[#064E3B]/70 dark:text-white/70 line-clamp-2">
                        {doctor.hospitalAffiliation}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#064E3B]/10 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[9.5px] font-mono text-[#064E3B]/50 dark:text-white/40">
                        {doctor.registrationNumber}
                      </span>
                      {isCurrent ? (
                        <span className="text-xs font-bold text-emerald-700 dark:text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectDoctor(doctor)}
                          className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] text-white dark:text-[#042F24] px-3 py-1 text-xs font-bold cursor-pointer"
                        >
                          Select Doctor
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ACTIVE ATTENDING DOCTOR CARD
            ========================================================================= */}
        <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#064E3B] dark:bg-[#10B981] font-serif text-2xl font-bold text-white dark:text-[#042F24] shadow-soft shrink-0">
              {attendingDoctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  {attendingDoctor.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Verified Practitioner</span>
                </span>
              </div>
              <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 font-semibold">
                {attendingDoctor.specialization} • {attendingDoctor.qualifications}
              </p>
              <p className="text-xs text-[#064E3B]/60 dark:text-white/60">
                {attendingDoctor.hospitalAffiliation} • {attendingDoctor.college || "AIIMS New Delhi"} • Reg: {attendingDoctor.registrationNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white px-3.5 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              <span>Call Clinic</span>
            </a>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: WHAT YOUR DOCTOR HAS GIVEN YOU (PRESCRIBED MEDICINES & INSTRUCTIONS)
            ========================================================================= */}
        <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Prescriptions & Clinical Orders Given to You ({prescriptions.length})
              </h3>
            </div>
            <Link
              href="/medicines"
              className="text-xs font-bold text-emerald-700 dark:text-[#10B981] hover:underline flex items-center gap-1"
            >
              <span>View Full Medication Tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((med) => (
              <div
                key={med.id}
                className="rounded-2xl border border-[#064E3B]/10 dark:border-white/5 bg-[#F9FBF9] dark:bg-[#0F241E] p-4.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                      {med.brandName}
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-[#10B981]">
                      {med.dosage} • {med.genericName}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Active Rx
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#064E3B]/80 dark:text-white/80">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{med.frequency}</span>
                  </div>
                  {med.mealTiming && (
                    <p className="text-[11px] text-[#064E3B]/70 dark:text-white/70 pl-5">
                      Meal Timing: <strong>{med.mealTiming}</strong>
                    </p>
                  )}
                  {med.instructions && (
                    <p className="text-[11px] text-[#064E3B]/70 dark:text-white/70 pl-5 italic">
                      &quot;{med.instructions}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#064E3B]/10 dark:border-white/5 flex items-center justify-between text-[10.5px]">
                  <span className="text-[#064E3B]/60 dark:text-white/50">
                    Prescribed by: {attendingDoctor.name}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-[#10B981]">
                    {med.dosesRemaining || 12} doses remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: DIRECT DOCUMENT SUBMISSION TO DOCTOR
            ========================================================================= */}
        <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-5">
          <div className="border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Submit Reports & Documents Directly to {attendingDoctor.name}
              </h3>
            </div>
            <p className="text-xs text-[#064E3B]/70 dark:text-white/60 mt-0.5">
              Upload blood tests, ECG PDFs, or previous hospital summaries. They will instantly appear in your doctor&apos;s Lab OCR & Biometrics review pane.
            </p>
          </div>

          {uploadSuccessMessage && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              {uploadSuccessMessage}
            </div>
          )}

          <form onSubmit={handleSubmitDocument} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Recent CBC Blood Panel or 12-Lead ECG"
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                >
                  <option value="Lab Report / CBC">Lab Blood Report / CBC</option>
                  <option value="Cardiology ECG / Echo">Cardiology ECG / Echocardiogram</option>
                  <option value="Radiology X-Ray / MRI">Radiology (X-Ray / CT / MRI)</option>
                  <option value="Discharge Summary">Hospital Discharge Summary</option>
                  <option value="Other Medical Record">Other Diagnostic Record</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                Attach PDF / Image File
              </label>
              <div className="relative border-2 border-dashed border-[#064E3B]/20 dark:border-white/15 rounded-2xl p-4 text-center hover:bg-[#F9FBF9] dark:hover:bg-[#0F241E] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                    {selectedFileName || "Click to browse or drag & drop medical document"}
                  </span>
                  <span className="text-[10.5px] text-[#064E3B]/50 dark:text-white/40">
                    Supports PDF, JPG, PNG up to 25MB (Encrypted via Sovereign ABDM Gate)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingDoc}
              className="w-full rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-3 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-101 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              <span>{isSubmittingDoc ? "Transmitting Document..." : `Submit Document to ${attendingDoctor.name}`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
