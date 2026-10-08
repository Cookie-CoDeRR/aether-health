"use client";

import React from "react";
import { Stethoscope, Sparkles, Send } from "lucide-react";
import { PatientRecord } from "@/services/clinicalHandoverService";

export interface CopilotMessage {
  sender: "doctor" | "ai";
  text: string;
  timestamp: string;
}

interface DoctorCopilotTabProps {
  patient: PatientRecord;
  copilotMessages: CopilotMessage[];
  copilotQuery: string;
  onCopilotQueryChange: (query: string) => void;
  onSendCopilotMessage: (queryOverride?: string) => void;
  isCopilotLoading: boolean;
}

const COPILOT_QUICK_ACTIONS = [
  {
    label: "Check Penicillin Allergy Safety",
    query: "Are there any contraindications with prescribing cephalosporins or beta-lactams for this patient's Penicillin allergy?",
  },
  {
    label: "Summarize WBC & Labs",
    query: "Summarize the patient's recent CBC panel and clinical significance of WBC at 11.2 K/µL.",
  },
  {
    label: "Dyspepsia Dosing Advice",
    query: "Recommend first-line dosage and duration for acute non-ulcer dyspepsia.",
  },
];

export default function DoctorCopilotTab({
  patient,
  copilotMessages,
  copilotQuery,
  onCopilotQueryChange,
  onSendCopilotMessage,
  isCopilotLoading,
}: DoctorCopilotTabProps) {
  return (
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
            onClick={() => onSendCopilotMessage(action.query)}
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
              Clinical AI Copilot • Patient Context: {patient.name} ({patient.patientId})
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-[#10B981] font-semibold">
            ABDM Sovereign Enclave
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
            onChange={(e) => onCopilotQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendCopilotMessage()}
            placeholder={`Ask AI about ${patient.name}'s CBC markers, allergy safety, or dosage regimen...`}
            className="flex-1 h-10 rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-4 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
            aria-label="Doctor copilot prompt query"
          />
          <button
            type="button"
            onClick={() => onSendCopilotMessage()}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs cursor-pointer hover:scale-105 transition-transform"
            aria-label="Send copilot query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
