"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { sendTriageMessage } from "@/services/domain/triageService";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { TriageOutput, SpecialtySuggestion } from "@/types/ai";
import { UrgencyLevel } from "@/types/symptomLog";
import ClinicalResponseCard from "@/components/triage/ClinicalResponseCard";
import PatientRecordsModal from "@/components/triage/PatientRecordsModal";
import TodayMedicationsCard from "@/components/triage/TodayMedicationsCard";
import TriageNatureBackground from "@/components/triage/TriageNatureBackground";
import {
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Pill,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  Activity,
  HeartPulse,
  RotateCcw,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  urgencyLevel?: UrgencyLevel;
  disclaimer?: string;
  emergencyGuidance?: SafetyWrappedResponse<TriageOutput>["emergencyGuidance"];
  specialties?: SpecialtySuggestion[];
  patientRecordContext?: string[];
  suggestedFollowUps?: string[];
  acknowledged?: boolean;
}

const ACTIVE_PATIENT_USER_ID = "aether_usr_8f92a170b4c2";

// Clean 1-2 word quick clinical prompt chips
const QUICK_PROMPTS = [
  { label: "Headache & Fatigue", query: "I have had a mild throbbing headache and fatigue for the past 2 days." },
  { label: "Safe Painkillers", query: "What over-the-counter pain relievers are safe for me given my Penicillin allergy?" },
  { label: "Fever & Chills", query: "I have a moderate fever and body chills since last night." },
  { label: "CBC Blood Check", query: "Is my mild stomach pain related to my recent elevated WBC count (11.2 K/µL)?" },
  { label: "Stomach Ache", query: "I have mild cramps and discomfort after meals." },
  { label: "Specialist Care", query: "Which specialist should I consult for persistent morning dizziness?" },
];

function TriageContent() {
  const searchParams = useSearchParams();
  const { userName } = useSettings();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Check URL query param ?q=
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      handleSend(q);
    }
  }, [searchParams]);

  // Listen for prompt events dispatched from floating dock
  useEffect(() => {
    const handleTriagePromptEvent = (e: any) => {
      const query = e.detail?.query || "";
      if (query) {
        handleSend(query);
      }
    };

    window.addEventListener("aether-triage-prompt", handleTriagePromptEvent);
    return () =>
      window.removeEventListener("aether-triage-prompt", handleTriagePromptEvent);
  }, []);

  const handleSend = async (textToSend: string) => {
    const queryText = textToSend.trim();
    if (!queryText || isLoading) return;

    setErrorMessage(null);

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendTriageMessage({
        userId: ACTIVE_PATIENT_USER_ID,
        symptoms: queryText,
      });

      if (response.status === 429) {
        setErrorMessage(response.error?.message || "Rate limit exceeded. Please wait a moment.");
        setIsLoading(false);
        return;
      }

      if (response.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          urgencyLevel: response.data.urgencyLevel,
          disclaimer: response.disclaimer,
          emergencyGuidance: response.emergencyGuidance,
          specialties: response.data.specialties,
          patientRecordContext: response.data.patientRecordContext,
          suggestedFollowUps: response.data.suggestedFollowUps,
          acknowledged: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setErrorMessage("Unable to connect to Aether health assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, acknowledged: true } : msg))
    );
  };

  const handleResetChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const firstName = userName ? userName.split(" ")[0] : "Alex";

  return (
    <div className="relative flex flex-1 h-full min-h-0 divide-x divide-[#064E3B]/15 dark:divide-white/10 font-sans text-[#064E3B] dark:text-[#ECFDF5] bg-transparent overflow-hidden">
      {/* Patient Record Management Modal */}
      <PatientRecordsModal
        userId={ACTIVE_PATIENT_USER_ID}
        isOpen={isRecordsModalOpen}
        onClose={() => setIsRecordsModalOpen(false)}
      />

      {/* ---------- MAIN AI TRIAGE CHAT PANEL (Left / Center) ---------- */}
      <section className="relative flex flex-1 flex-col h-full min-h-0 min-w-0 bg-transparent overflow-hidden">
        {/* Dedicated Botanical Nature Canvas Layer for AI Chat Viewport */}
        <TriageNatureBackground />

        {/* Top Control Bar (Visible when conversation is active) */}
        {messages.length > 0 && (
          <div className="relative z-10 shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9]/90 dark:bg-[#0B1D17]/90 backdrop-blur-xs text-xs">
            <div className="flex items-center gap-2 font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              <Sparkles className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
              <span>Active Consultation • Aether Clinical AI</span>
            </div>

            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] px-3 py-1.5 font-bold text-[#064E3B] dark:text-[#ECFDF5] hover:bg-[#064E3B]/5 dark:hover:bg-white/10 transition-all shadow-2xs min-tap-target cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>
        )}

        {/* Scrollable Conversation Stream / Minimal Greet View */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28">
          {messages.length === 0 ? (
            /* CLEAN MINIMAL GREETING & CONCISE QUICK PROMPTS */
            <div className="max-w-2xl mx-auto space-y-7 py-4 animate-fade-in">
              {/* Header Badge & Patient Greeting */}
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/25 dark:border-white/15 px-3.5 py-1 text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                  <span>Clinical Health Assistant • Real-Time Triage</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5] leading-[1.12]">
                  Hello {firstName}, <br />
                  <span>how are you feeling today?</span>
                </h1>

                <p className="text-xs sm:text-sm text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed max-w-lg font-normal">
                  Ask any health doubt or describe what you feel in the bottom bar. Aether cross-checks your records and known allergies for immediate clinical care advice.
                </p>
              </div>

              {/* Clean Inline Health Context Separator Line */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold text-[#064E3B] dark:text-[#ECFDF5]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-3 py-1 text-[11.5px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                  Penicillin Guard
                </span>
                <span className="text-[#064E3B]/30 dark:text-white/20 font-bold">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-3 py-1 text-[11.5px]">
                  <FileText className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                  CBC Panel Normal
                </span>
                <span className="text-[#064E3B]/30 dark:text-white/20 font-bold">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-3 py-1 text-[11.5px]">
                  <Pill className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                  2/3 Doses Taken
                </span>
              </div>

              {/* Clean Divider Line */}
              <div className="w-full h-[1px] bg-[#064E3B]/10 dark:bg-white/10 my-2" />

              {/* Concise 1-2 Word Quick Health Prompts */}
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/60 dark:text-white/50">
                  Quick Topics to Explore
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.query)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:bg-[#064E3B] dark:hover:bg-[#10B981] hover:text-white dark:hover:text-[#042F24] px-3.5 py-1.5 text-xs font-semibold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10.5px] opacity-50 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE CONVERSATION STREAM */
            <div className="space-y-5 max-w-3xl mx-auto pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[96%] sm:max-w-[88%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-xs ${
                        msg.sender === "user"
                          ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] rounded-br-xs font-medium"
                          : "bg-white dark:bg-[#0B1D17] text-[#064E3B] dark:text-[#ECFDF5] border border-[#064E3B]/20 dark:border-white/15 rounded-bl-xs space-y-3"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <ClinicalResponseCard
                          text={msg.text}
                          urgencyLevel={msg.urgencyLevel}
                          patientRecordContext={msg.patientRecordContext}
                          onOpenManageRecords={() => setIsRecordsModalOpen(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Suggested Follow-up Questions */}
                  {msg.sender === "ai" &&
                    msg.suggestedFollowUps &&
                    msg.suggestedFollowUps.length > 0 && (
                      <div className="max-w-[96%] sm:max-w-[88%] rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-4 space-y-2.5 shadow-xs">
                        <div className="text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                          <span>Helpful follow-up questions:</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {msg.suggestedFollowUps.map((promptText, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(promptText)}
                              className="text-left rounded-xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-[#064E3B] dark:hover:bg-[#10B981] hover:text-white dark:hover:text-[#042F24] p-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] font-semibold transition-all"
                            >
                              👉 {promptText}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Specialist Consultation Routing */}
                  {msg.sender === "ai" &&
                    msg.specialties &&
                    msg.specialties.length > 0 && (
                      <div className="max-w-[96%] sm:max-w-[88%] rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-4 space-y-3 shadow-xs">
                        <div className="text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
                          <span>Recommended Specialist Care:</span>
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {msg.specialties.map((spec, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 space-y-1.5 flex flex-col justify-between"
                            >
                              <div>
                                <div className="font-bold text-sm text-[#064E3B] dark:text-[#ECFDF5]">
                                  {spec.specialty}
                                </div>
                                <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-snug mt-0.5">
                                  {spec.reasoning}
                                </p>
                              </div>
                              <Link
                                href={`/discovery?specialty=${encodeURIComponent(
                                  spec.specialty
                                )}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#064E3B] dark:text-[#10B981] hover:underline pt-1.5"
                              >
                                <span>Find {spec.specialty} Doctors</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* High Urgency Emergency Alert Banner */}
                  {msg.sender === "ai" &&
                    msg.urgencyLevel === "high_critical" &&
                    msg.emergencyGuidance &&
                    !msg.acknowledged && (
                      <div className="rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-5 space-y-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] shadow-md">
                        <div className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span>{msg.emergencyGuidance.title}</span>
                        </div>
                        <p className="leading-relaxed text-[#064E3B]/80 dark:text-rose-200">
                          {msg.emergencyGuidance.message}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.emergencyGuidance.emergencyNumbers.map((num, idx) => (
                            <a
                              key={idx}
                              href={`tel:${num}`}
                              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <span>📞 Call {num}</span>
                            </a>
                          ))}
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleAcknowledge(msg.id)}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs transition-colors"
                          >
                            ✓ I Acknowledge & Understand
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Medical Disclaimer */}
                  {msg.sender === "ai" && msg.disclaimer && (
                    <p className="text-[11px] text-[#064E3B]/60 dark:text-white/40 italic px-2">
                      ℹ️ {msg.disclaimer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start max-w-3xl mx-auto py-2">
              <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 px-4 py-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-2.5 shadow-xs font-semibold">
                <div className="h-2 w-2 rounded-full bg-[#064E3B] dark:bg-[#10B981] animate-ping" />
                <span>Aether health assistant is evaluating symptoms...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 font-bold flex justify-between items-center max-w-3xl mx-auto shadow-xs">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold underline">
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* ---------- RIGHT RAIL: PERMANENTLY VISIBLE PATIENT CONTEXT (380px - 410px) ---------- */}
      <aside className="hidden lg:flex w-[380px] xl:w-[410px] shrink-0 flex-col h-full min-h-0 bg-white dark:bg-[#0B1D17] p-6 space-y-5 overflow-y-auto border-l border-[#064E3B]/15 dark:border-white/10 pb-28 transition-colors">
        {/* Today's Active Medications Card */}
        <TodayMedicationsCard userId={ACTIVE_PATIENT_USER_ID} />

        {/* Resolved Conditions / Doctor Clearance Card */}
        <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-5 space-y-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#064E3B] dark:text-[#ECFDF5]">
              <ShieldCheck className="w-4.5 h-4.5 text-[#064E3B] dark:text-[#10B981]" />
              <span>Health History & Allergies</span>
            </div>
            <span className="text-[10.5px] font-bold bg-white dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] px-2 py-0.5 rounded-full">
              Protected
            </span>
          </div>

          <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed font-normal">
            Active penicillin allergy guard is enabled. Baseline conditions are automatically cross-referenced in triage.
          </p>

          <button
            onClick={() => setIsRecordsModalOpen(true)}
            className="w-full rounded-2xl bg-white dark:bg-[#132D26] border border-[#064E3B]/25 dark:border-white/15 hover:bg-[#064E3B] dark:hover:bg-[#10B981] hover:text-white dark:hover:text-[#042F24] text-[#064E3B] dark:text-[#ECFDF5] py-2.5 px-4 font-bold transition-all text-xs shadow-2xs min-tap-target"
          >
            Review & Edit History
          </button>
        </div>

        {/* Emergency Assistance Quick Card */}
        <div className="rounded-3xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/10 p-5 space-y-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#064E3B] dark:text-[#ECFDF5]">
              <span>🚨</span>
              <span>Emergency Ambulance</span>
            </div>
            <span className="text-[10.5px] font-mono font-bold text-[#064E3B] dark:text-[#10B981] bg-white dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 px-2 py-0.5 rounded-full">
              24/7
            </span>
          </div>

          <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed font-normal">
            For acute chest pain, trauma, or sudden breathing difficulty:
          </p>

          <div className="flex gap-2.5 pt-0.5">
            <a
              href="tel:108"
              className="flex-1 text-center rounded-2xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] py-2.5 font-bold text-xs shadow-xs hover:bg-[#043327] dark:hover:bg-[#059669] transition-colors"
            >
              Call 108
            </a>
            <a
              href="tel:112"
              className="flex-1 text-center rounded-2xl border border-[#064E3B] dark:border-white/20 text-[#064E3B] dark:text-[#ECFDF5] bg-white dark:bg-transparent py-2.5 font-bold text-xs shadow-xs hover:bg-[#064E3B]/5 dark:hover:bg-white/10 transition-colors"
            >
              Call 112
            </a>
          </div>
        </div>

        {/* Patient Notice */}
        <div className="mt-auto rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 text-[11.5px] text-[#064E3B]/70 dark:text-white/50 leading-relaxed border border-[#064E3B]/15 dark:border-white/10">
          <strong className="text-[#064E3B] dark:text-[#10B981]">Patient Note:</strong> Aether provides preliminary triage assistance. Always consult a certified doctor for medical treatment.
        </div>
      </aside>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-12 text-xs text-[#064E3B]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent mr-2" />
          <span>Loading Health Navigator...</span>
        </div>
      }
    >
      <TriageContent />
    </Suspense>
  );
}
