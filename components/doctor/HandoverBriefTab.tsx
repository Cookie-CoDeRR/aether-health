"use client";

import React, { useState } from "react";
import { Sparkles, Lock, CheckCircle2, Eye } from "lucide-react";
import { PatientRecord } from "@/services/clinicalHandoverService";

interface HandoverBriefTabProps {
  patient: PatientRecord;
}

export default function HandoverBriefTab({ patient }: HandoverBriefTabProps) {
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  return (
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
            Generated {patient.handoverSummary.generatedAt}
          </span>
        </div>

        {/* SBAR Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5">
            <span className="font-bold text-[10.5px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              S • Situation & Complaint
            </span>
            <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
              {patient.handoverSummary.situation}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5">
            <span className="font-bold text-[10.5px] uppercase tracking-wider text-blue-800 dark:text-blue-300">
              B • Background & Lab Correlation
            </span>
            <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
              {patient.handoverSummary.background}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] p-4 border border-[#064E3B]/10 dark:border-white/5 space-y-1.5 sm:col-span-2">
            <span className="font-bold text-[10.5px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
              A • Assessment
            </span>
            <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed">
              {patient.handoverSummary.assessment}
            </p>
          </div>
        </div>

        {/* Confidential Disclosures Box */}
        {patient.handoverSummary.sensitiveDisclosures.length > 0 && (
          <div className="rounded-2xl border border-purple-300 bg-purple-50/70 dark:bg-purple-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Confidential Disclosures (Shields Patient Awkwardness)</span>
            </div>
            <ul className="list-disc list-inside text-xs text-purple-900 dark:text-purple-300 space-y-1 pl-1">
              {patient.handoverSummary.sensitiveDisclosures.map((item, idx) => (
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
            {patient.handoverSummary.doctorRecommendations.map((rec, idx) => (
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
            {patient.compressedChat}
          </pre>
        )}
      </div>
    </div>
  );
}
