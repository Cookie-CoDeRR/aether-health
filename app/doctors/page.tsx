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
} from "lucide-react";
import {
  DoctorProfile,
  VERIFIED_DOCTORS_REGISTRY,
  getActiveDoctorProfile,
} from "@/services/authService";
import { PrescribedMedication } from "@/services/clinicalHandoverService";

export default function MyDoctorPage() {
  const router = useRouter();

  // Active Attending Doctor (persisted in localStorage)
  const [attendingDoctor, setAttendingDoctor] = useState<DoctorProfile>(VERIFIED_DOCTORS_REGISTRY[0]);
  const [isDoctorSelectOpen, setIsDoctorSelectOpen] = useState(false);

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
            frequency: "Once daily before breakfast",
            totalDoses: 14,
            dosesRemaining: 12,
            takenToday: true,
            takenAt: "08:15 AM",
            hospitalName: "Apollo Specialty Hospital",
          },
          {
            id: "rx-2",
            brandName: "Azithromycin 500",
            genericName: "Azithromycin USP 500mg",
            dosage: "500 mg",
            frequency: "Once daily for 3 days",
            totalDoses: 3,
            dosesRemaining: 2,
            takenToday: false,
            hospitalName: "Apollo Specialty Hospital",
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
              Review medications prescribed to you, submit diagnostic documents directly to your clinician, or change your attending specialist.
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
            DOCTOR SELECTOR DRAWER (When Patient wants to switch doctor)
            ========================================================================= */}
        {isDoctorSelectOpen && (
          <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-5 shadow-lg space-y-4 animate-fade-in">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VERIFIED_DOCTORS_REGISTRY.map((doc) => {
                const isSelected = doc.doctorId === attendingDoctor.doctorId;
                return (
                  <button
                    key={doc.doctorId}
                    type="button"
                    onClick={() => handleSelectDoctor(doc)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-[#132D26] border-emerald-600/50 dark:border-[#10B981]/50 shadow-xs"
                        : "bg-[#F9FBF9] dark:bg-[#0F241E] border-[#064E3B]/10 dark:border-white/5 hover:border-[#064E3B]/30"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700/10 dark:bg-[#10B981]/20 font-serif text-base font-bold text-emerald-800 dark:text-[#10B981] shrink-0">
                      {doc.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] truncate">
                          {doc.name}
                        </span>
                        {isSelected && (
                          <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="block text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 truncate">
                        {doc.specialization}
                      </span>
                      <span className="block text-[10px] font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {doc.hospitalAffiliation} • {doc.registrationNumber}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ACTIVE ATTENDING DOCTOR CARD
            ========================================================================= */}
        <div className="rounded-3xl border border-emerald-600/25 dark:border-[#10B981]/20 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 dark:from-[#0B1D17] dark:via-[#0F241E] dark:to-[#0B1D17] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#064E3B]/10 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#064E3B] dark:bg-[#10B981] font-serif text-2xl font-bold text-white dark:text-[#042F24] shadow-soft">
                {attendingDoctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    {attendingDoctor.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>NMC Verified</span>
                  </span>
                </div>
                <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 font-medium mt-0.5">
                  {attendingDoctor.specialization} • {attendingDoctor.qualifications}
                </p>
                <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {attendingDoctor.hospitalAffiliation} • License: {attendingDoctor.registrationNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#081511] border border-[#064E3B]/15 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Telemetry Linked</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl bg-white/80 dark:bg-[#081511]/80 border border-[#064E3B]/10 dark:border-white/5 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#064E3B]/60 dark:text-white/50">
                Next Follow-Up Review
              </span>
              <p className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aug 28, 2026 • 10:30 AM</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 dark:bg-[#081511]/80 border border-[#064E3B]/10 dark:border-white/5 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#064E3B]/60 dark:text-white/50">
                Hospital Network
              </span>
              <p className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{attendingDoctor.hospitalAffiliation}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 dark:bg-[#081511]/80 border border-[#064E3B]/10 dark:border-white/5 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#064E3B]/60 dark:text-white/50">
                Clinical Handover Status
              </span>
              <p className="font-bold text-xs text-emerald-700 dark:text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SBAR Protocol Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TWO-COLUMN SECTION: WHAT DOCTOR HAS GIVEN & SUBMIT DOCUMENTS
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------------------------------------------------------------------
              LEFT COLUMN: WHAT DOCTOR HAS GIVEN (Prescriptions & Notes)
              --------------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
                  <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Prescriptions & Dosages
                  </h3>
                </div>
                <Link
                  href="/medicines"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Tracker</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {prescriptions.length === 0 ? (
                <p className="text-xs text-[#064E3B]/60 dark:text-white/50 py-4 text-center">
                  No active prescriptions assigned yet. Your doctor will prescribe your next dose here.
                </p>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((med) => (
                    <div
                      key={med.id}
                      className="rounded-2xl border border-[#064E3B]/10 dark:border-white/5 bg-[#F9FBF9] dark:bg-[#0F241E] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                            {med.brandName}
                          </h4>
                          <span className="text-[10.5px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                            {med.genericName}
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800/40 px-2.5 py-0.5 text-[10px] font-bold">
                          {med.dosage}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#064E3B]/70 dark:text-white/60 pt-1 border-t border-[#064E3B]/5 dark:border-white/5">
                        <span>Schedule: {med.frequency}</span>
                        <span className="font-mono text-emerald-700 dark:text-[#10B981] font-semibold">
                          {med.dosesRemaining} doses remaining
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Doctor Clinical Instructions Box */}
              <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-600/15 p-4 space-y-1.5 text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-800 dark:text-[#10B981]">
                  <Award className="w-3.5 h-3.5" />
                  <span>Clinical Instructions from {attendingDoctor.name}</span>
                </span>
                <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed">
                  Take Pantoprazole 30 minutes before morning meal. Avoid citrus and non-steroidal anti-inflammatory drugs. Continue monitoring symptoms via Aether triage.
                </p>
              </div>
            </div>

            {/* Quick Message to Doctor */}
            <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Send Query to {attendingDoctor.name}</span>
              </div>

              {messageSuccess && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  {messageSuccess}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows={2}
                  value={patientMessage}
                  onChange={(e) => setPatientMessage(e.target.value)}
                  placeholder={`Ask ${attendingDoctor.name} a question about your medication or recovery...`}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="w-full rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-2 text-xs font-bold text-white dark:text-[#042F24] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingMessage ? "Transmitting..." : "Send to Doctor's Queue"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT COLUMN: SUBMIT DOCUMENTS DIRECTLY TO DOCTOR
              --------------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 shadow-xs space-y-4">
              <div className="border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2 font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  <FileUp className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
                  <span>Submit Documents to Doctor</span>
                </div>
                <p className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
                  Upload lab reports, ECGs, or previous hospital summaries directly into {attendingDoctor.name}&apos;s review portal.
                </p>
              </div>

              {uploadSuccessMessage && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                  {uploadSuccessMessage}
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={handleSubmitDocument} className="space-y-3 text-xs">
                {/* File Dropzone Input */}
                <div className="relative border-2 border-dashed border-[#064E3B]/20 dark:border-white/15 rounded-2xl p-4 text-center bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white transition-colors group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                      {selectedFileName ? selectedFileName : "Choose File or Drop PDF / Image"}
                    </span>
                    <span className="text-[10px] text-[#064E3B]/60 dark:text-white/40 font-mono">
                      PDF, JPG, PNG up to 25MB
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-0.5">
                    Document Name / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Ultrasound Abdomen & Pelvis"
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-0.5">
                    Document Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  >
                    <option value="Lab Report / CBC">Lab Report / CBC</option>
                    <option value="Cardiology / ECG">Cardiology / ECG</option>
                    <option value="Radiology / X-Ray / MRI">Radiology / X-Ray / MRI</option>
                    <option value="Hospital Discharge Summary">Hospital Discharge Summary</option>
                    <option value="Previous Prescription">Previous Prescription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-0.5">
                    Notes for {attendingDoctor.name} (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="Provide any context or reason for this test..."
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="w-full rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-2.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isSubmittingDoc ? "Uploading to Doctor..." : "Submit Document to Doctor"}
                  </span>
                </button>
              </form>
            </div>

            {/* Submitted Documents History */}
            <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-2.5">
                <span className="font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Submitted Documents History ({submittedDocuments.length})</span>
                </span>
              </div>

              <div className="space-y-2">
                {submittedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-[#064E3B]/10 dark:border-white/5 bg-[#F9FBF9] dark:bg-[#0F241E] p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                        {doc.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#064E3B]/60 dark:text-white/50">
                        {doc.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                        Category: {doc.category}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-[#10B981]">
                        {doc.status}
                      </span>
                    </div>
                    {doc.notes && (
                      <p className="text-[10.5px] text-[#064E3B]/60 dark:text-white/40 italic pt-0.5">
                        &quot;{doc.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
