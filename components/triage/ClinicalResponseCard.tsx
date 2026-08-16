"use client";

import { UrgencyLevel } from "@/types/symptomLog";
import { Stethoscope, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

interface ClinicalResponseCardProps {
  text: string;
  urgencyLevel?: UrgencyLevel;
  patientRecordContext?: string[];
  onOpenManageRecords?: () => void;
}

export default function ClinicalResponseCard({
  text,
  urgencyLevel = "low",
  patientRecordContext,
  onOpenManageRecords,
}: ClinicalResponseCardProps) {
  // Parse raw text sections cleanly to remove markdown hashtags
  const cleanText = text
    .replace(/^###\s+Clinical Consultant Assessment.*$/gm, "")
    .replace(/^####\s+/gm, "")
    .trim();

  // Split sections by double line breaks or major topics
  const paragraphs = cleanText.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-[#064E3B]">
      {/* Top Banner & Urgency Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#064E3B]/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064E3B] text-white">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Clinical Care Summary
            </h3>
            <p className="text-[11px] text-[#064E3B]/70 font-medium">
              Assessed by Aether Health Assistant
            </p>
          </div>
        </div>

        <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs border border-[#064E3B]/30 bg-[#F9FBF9] text-[#064E3B]">
          {urgencyLevel === "high_critical" ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>
            {urgencyLevel === "high_critical"
              ? "Urgent Care Recommended"
              : urgencyLevel === "moderate"
              ? "Moderate Priority"
              : "Routine / Home Care"}
          </span>
        </span>
      </div>

      {/* Applied Patient Records Context Pill */}
      {patientRecordContext && patientRecordContext.length > 0 && (
        <div className="rounded-xl border border-[#064E3B]/20 bg-[#F9FBF9] p-3.5 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-[#064E3B]">
              <FileText className="w-4 h-4 text-[#064E3B]" />
              <span>Cross-Referenced Medical History ({patientRecordContext.length})</span>
            </div>

            {onOpenManageRecords && (
              <button
                onClick={onOpenManageRecords}
                className="rounded-lg bg-white border border-[#064E3B]/25 hover:bg-[#064E3B] hover:text-white text-[#064E3B] font-bold px-2.5 py-1 text-[11px] transition-all shadow-2xs"
              >
                Manage History
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {patientRecordContext.map((item, idx) => (
              <span
                key={idx}
                className="rounded-full border border-[#064E3B]/20 bg-white px-2.5 py-0.5 text-[11px] text-[#064E3B] font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Clinical Body Content */}
      <div className="space-y-3 font-sans">
        {paragraphs.map((p, idx) => {
          const isHeading =
            p.startsWith("Clinical Breakdown") ||
            p.startsWith("Recommended Next") ||
            p.startsWith("Clinical Guidance") ||
            p.startsWith("Recommended Action");

          if (isHeading) {
            const parts = p.split("\n");
            const headingTitle = parts[0];
            const bodyLines = parts.slice(1).join("\n");

            return (
              <div
                key={idx}
                className="rounded-xl border border-[#064E3B]/15 bg-[#F9FBF9] p-4 space-y-2"
              >
                <h4 className="font-bold text-sm text-[#064E3B] border-b border-[#064E3B]/15 pb-1.5">
                  {headingTitle}
                </h4>
                <div className="text-xs text-[#064E3B]/85 leading-relaxed whitespace-pre-wrap">
                  {bodyLines}
                </div>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-[13.5px] text-[#064E3B]/90 leading-relaxed">
              {p.replace(/\*\*/g, "")}
            </p>
          );
        })}
      </div>
    </div>
  );
}
