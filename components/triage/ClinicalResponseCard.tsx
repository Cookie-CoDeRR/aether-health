"use client";

import { UrgencyLevel } from "@/types/symptomLog";

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
  // Parse raw text sections cleanly to remove markdown hashtags (#, ##, ###, ####)
  const cleanText = text
    .replace(/^###\s+Clinical Consultant Assessment.*$/gm, "")
    .replace(/^####\s+/gm, "")
    .trim();

  // Split sections by double line breaks or major topics
  const paragraphs = cleanText.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-[#F6F1E9]">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8674A] text-[#0A1620] text-xs font-bold">
            🩺
          </div>
          <div>
            <h3 className="font-serif text-base font-medium tracking-tight text-[#F6F1E9]">
              Clinical Consultant Readout
            </h3>
            <p className="text-[10px] font-mono text-[#7C8A93] uppercase tracking-wider">
              Evaluated by AETHER Triage System
            </p>
          </div>
        </div>

        <span
          className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider ${
            urgencyLevel === "high_critical"
              ? "bg-[#D14343] text-white"
              : urgencyLevel === "moderate"
              ? "bg-[#D9A441] text-[#0A1620]"
              : "bg-[#4F9D8C] text-white"
          }`}
        >
          {urgencyLevel.replace("_", " ")} Urgency
        </span>
      </div>

      {/* Applied Patient Records Banner (Interactive) */}
      {patientRecordContext && patientRecordContext.length > 0 && (
        <div className="rounded-xl border border-[rgba(79,157,140,0.3)] bg-[#4F9D8C]/10 p-3.5 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-[#4F9D8C]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Applied Patient Medical Records ({patientRecordContext.length})</span>
            </div>

            {onOpenManageRecords && (
              <button
                onClick={onOpenManageRecords}
                className="rounded-lg bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white font-semibold px-2.5 py-1 text-[11px] transition-all flex items-center gap-1 shadow-xs"
              >
                <span>🩺 Manage / Clear Cured Records</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {patientRecordContext.map((item, idx) => (
              <span
                key={idx}
                className="rounded-md border border-[rgba(246,241,233,0.16)] bg-[#0F2130] px-2.5 py-1 text-[11px] text-[#B9C4CC] font-sans font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Clinical Body Paragraphs */}
      <div className="space-y-3 font-sans">
        {paragraphs.map((p, idx) => {
          const isHeading = p.startsWith("Clinical Breakdown") || p.startsWith("Recommended Next") || p.startsWith("Clinical Guidance") || p.startsWith("Recommended Action");

          if (isHeading) {
            const parts = p.split("\n");
            const headingTitle = parts[0];
            const bodyLines = parts.slice(1).join("\n");

            return (
              <div key={idx} className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-2">
                <h4 className="font-serif text-sm font-medium text-[#E8674A] border-b border-[rgba(246,241,233,0.09)] pb-1">
                  {headingTitle}
                </h4>
                <div className="text-xs text-[#B9C4CC] leading-relaxed whitespace-pre-wrap font-sans">
                  {bodyLines}
                </div>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-[13.5px] text-[#B9C4CC] leading-relaxed">
              {p.replace(/\*\*/g, "")}
            </p>
          );
        })}
      </div>
    </div>
  );
}
