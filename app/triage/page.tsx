"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sendTriageMessage } from "@/services/domain/triageService";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { TriageOutput, SpecialtySuggestion } from "@/types/ai";
import { UrgencyLevel } from "@/types/symptomLog";
import ClinicalResponseCard from "@/components/triage/ClinicalResponseCard";
import PatientRecordsModal from "@/components/triage/PatientRecordsModal";
import TodayMedicationsCard from "@/components/triage/TodayMedicationsCard";

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

const MOCK_PROMPTS = [
  { text: "i am having some pain in my stomach", tag: "Moderate", urgency: "moderate" as UrgencyLevel },
  { text: "Mild headache and tiredness, two days running", tag: "Low", urgency: "low" as UrgencyLevel },
  { text: "Fever, dry cough, and body aches since last night", tag: "Moderate", urgency: "moderate" as UrgencyLevel },
  { text: "Sudden chest pain radiating to my left arm", tag: "Critical", urgency: "high_critical" as UrgencyLevel },
];

export default function TriagePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUrgency, setCurrentUrgency] = useState<UrgencyLevel>("low");
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [showMobileMeds, setShowMobileMeds] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setErrorMessage(null);
    setInput("");

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
        setCurrentUrgency(response.data.urgencyLevel);
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
      setErrorMessage("Unable to connect to AI triage assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, acknowledged: true } : msg))
    );
  };

  return (
    <div className="flex flex-1 min-h-0 divide-x divide-[rgba(246,241,233,0.09)] font-sans text-[#F6F1E9]">
      {/* Patient Medical Record Management Modal */}
      <PatientRecordsModal
        userId={ACTIVE_PATIENT_USER_ID}
        isOpen={isRecordsModalOpen}
        onClose={() => setIsRecordsModalOpen(false)}
      />

      {/* ---------- CHAT COLUMN (Left) ---------- */}
      <section className="flex flex-1 flex-col min-h-0 min-w-0">
        {/* Mobile Quick Action Banner (Visible on mobile/tablet screens < lg) */}
        <div className="flex flex-col border-b border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-3 lg:hidden space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowMobileMeds((prev) => !prev)}
              className="flex items-center gap-1.5 font-mono text-xs text-[#E8674A] font-semibold hover:underline"
            >
              <span>💊 Today&apos;s Medications</span>
              <span>{showMobileMeds ? "▲ Hide" : "▼ View"}</span>
            </button>

            <button
              onClick={() => setIsRecordsModalOpen(true)}
              className="rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-2.5 py-1 text-[11px] font-mono text-[#B9C4CC]"
            >
              🩺 Medical Records
            </button>
          </div>

          {showMobileMeds && (
            <div className="pt-1">
              <TodayMedicationsCard userId={ACTIVE_PATIENT_USER_ID} isMobileCompact />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-full flex-col justify-center max-w-[640px] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#7C8A93] font-sans flex items-center gap-2">
                  <span>Start a read</span>
                  <span>•</span>
                  <span className="text-[#E8674A] font-semibold">Patient History Enabled</span>
                </div>

                <button
                  onClick={() => setIsRecordsModalOpen(true)}
                  className="hidden sm:inline-flex rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] px-3 py-1 text-xs text-[#B9C4CC] hover:text-[#F6F1E9] hover:border-[#E8674A] transition-all font-mono"
                >
                  🩺 Manage Medical Records
                </button>
              </div>

              <h2 className="font-serif font-normal text-3xl sm:text-[38px] leading-[1.15] tracking-[-0.01em] text-[#F6F1E9] max-w-[480px]">
                What are you<br />
                <em className="not-italic italic text-[#E8674A]">feeling</em> right now?
              </h2>

              <p className="text-xs sm:text-sm text-[#B9C4CC] leading-relaxed max-w-[420px]">
                Describe it plainly — where, how long, how it started. AETHER cross-references your past health history (lab reports, allergies), then routes you to the right next step.
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-col gap-2 max-w-[460px] pt-2">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#7C8A93] mb-1 font-sans">
                  Common starting points
                </div>
                {MOCK_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[rgba(246,241,233,0.16)] bg-transparent p-3 sm:px-4 text-left text-xs sm:text-[13.5px] text-[#B9C4CC] transition-all hover:border-[#E8674A] hover:bg-[#E8674A]/5 hover:text-[#F6F1E9] hover:translate-x-0.5"
                  >
                    <span className="min-w-0 truncate">{chip.text}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-[#7C8A93] group-hover:text-[#E8674A] font-sans">
                      {chip.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Stream */
            <div className="space-y-6 max-w-[660px]">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[98%] sm:max-w-[90%] rounded-2xl p-3.5 sm:p-5 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#132A38] text-[#F6F1E9] border border-[rgba(246,241,233,0.16)]"
                          : "bg-[#0F2130] text-[#F6F1E9] border border-[rgba(246,241,233,0.09)] space-y-3"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <p className="whitespace-pre-wrap text-xs sm:text-sm">{msg.text}</p>
                      ) : (
                        /* Styled Clinical Consultant Card */
                        <ClinicalResponseCard
                          text={msg.text}
                          urgencyLevel={msg.urgencyLevel}
                          patientRecordContext={msg.patientRecordContext}
                          onOpenManageRecords={() => setIsRecordsModalOpen(true)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Suggested Follow-up Chat Chips */}
                  {msg.sender === "ai" && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="max-w-[98%] sm:max-w-[90%] rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-3 space-y-2 text-xs">
                      <div className="text-[#E8674A] font-semibold flex items-center gap-1.5 font-sans text-[11.5px]">
                        <span>💬 Suggested Follow-up Questions (Based on Your Medical Record)</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedFollowUps.map((promptText, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(promptText)}
                            className="text-left rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-2.5 text-[11.5px] sm:text-[12px] text-[#B9C4CC] hover:border-[#E8674A] hover:text-[#F6F1E9] hover:bg-[#E8674A]/10 transition-all font-sans"
                          >
                            👉 {promptText}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialist Routing Section */}
                  {msg.sender === "ai" && msg.specialties && msg.specialties.length > 0 && (
                    <div className="max-w-[98%] sm:max-w-[90%] rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-3 space-y-2 text-xs">
                      <div className="text-[#F6F1E9] font-medium font-serif">💡 Recommended Specialist Consultation:</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {msg.specialties.map((spec, idx) => (
                          <div key={idx} className="rounded-lg border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-2.5 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#E8674A]">{spec.specialty}</span>
                              <span className="font-mono text-[10px] text-[#7C8A93]">{Math.round(spec.confidenceScore * 100)}%</span>
                            </div>
                            <p className="text-[11px] text-[#B9C4CC] leading-snug">{spec.reasoning}</p>
                            <Link href={`/doctors?specialty=${encodeURIComponent(spec.specialty)}`} className="inline-block text-[10px] font-semibold text-[#4F9D8C] hover:underline pt-1 font-mono">
                              Find {spec.specialty} doctors →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* High Critical Emergency Alert */}
                  {msg.sender === "ai" && msg.urgencyLevel === "high_critical" && msg.emergencyGuidance && !msg.acknowledged && (
                    <div className="rounded-xl border border-[#D14343] bg-[#D14343]/15 p-4 space-y-2 text-xs text-[#F6F1E9]">
                      <div className="font-bold text-[#D14343] uppercase tracking-wider">⚠️ {msg.emergencyGuidance.title}</div>
                      <p className="leading-relaxed text-[#B9C4CC]">{msg.emergencyGuidance.message}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.emergencyGuidance.emergencyNumbers.map((num, idx) => (
                          <span key={idx} className="rounded bg-[#D14343] text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                            📞 {num}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleAcknowledge(msg.id)}
                          className="rounded-lg bg-[#D14343] hover:bg-[#D14343]/90 text-white font-bold px-4 py-1.5 text-xs transition-colors"
                        >
                          ✓ I Acknowledge & Understand
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer Footer */}
                  {msg.sender === "ai" && msg.disclaimer && (
                    <p className="text-[10px] text-[#7C8A93] italic px-1">ℹ️ {msg.disclaimer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-[#132A38] px-4 py-3 text-xs text-[#B9C4CC] animate-pulse flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#E8674A] animate-ping" />
                AETHER Clinical Consultant is evaluating symptoms...
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-[#D14343] bg-[#D14343]/10 p-3 text-xs text-[#D14343] flex justify-between items-center">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold underline">Dismiss</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 p-4 sm:p-6 lg:px-9 lg:pb-7 border-t border-[rgba(246,241,233,0.09)] items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms — fever, stomach ache, headache…"
            disabled={isLoading}
            className="flex-1 min-h-[44px] rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs sm:text-sm text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#E8674A]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-[#E8674A] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#0A1620] hover:brightness-108 active:scale-97 disabled:opacity-50 transition-all shrink-0"
          >
            <span>Send</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </section>

      {/* ---------- SIGNAL PANEL (Right - 320px Desktop Only) ---------- */}
      <aside className="hidden lg:flex w-[320px] shrink-0 flex-col bg-[#0F2130] p-5 gap-4 overflow-y-auto">
        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.14em] text-[#7C8A93] font-sans border-b border-[rgba(246,241,233,0.09)] pb-2">
          <span>Active Patient Telemetry</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D8C] shadow-[0_0_0_3px_rgba(79,157,140,0.2)]" />
        </div>

        {/* Assigned Medication For Today Card */}
        <TodayMedicationsCard userId={ACTIVE_PATIENT_USER_ID} />

        {/* Doctor Clearance Action Card */}
        <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-2 text-xs">
          <div className="font-serif font-medium text-[#F6F1E9] flex items-center gap-1.5">
            <span>🩺 Cured a Condition?</span>
          </div>
          <p className="text-[11px] text-[#B9C4CC] leading-relaxed font-sans">
            If a certified doctor has cured a condition or allergy, update your records so future AI assessments stay accurate.
          </p>
          <button
            onClick={() => setIsRecordsModalOpen(true)}
            className="w-full mt-1 rounded-lg bg-[#4F9D8C] text-white py-1.5 px-3 font-semibold hover:bg-[#4F9D8C]/90 transition-colors text-xs font-mono"
          >
            Manage & Mark Cured
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-auto border-t border-[rgba(246,241,233,0.09)] pt-3 text-[11px] text-[#7C8A93] leading-relaxed font-sans">
          <strong className="font-medium text-[#B9C4CC]">Not a diagnosis.</strong> AETHER is an informational navigation tool. In an emergency, contact local emergency services directly.
        </div>
      </aside>
    </div>
  );
}
