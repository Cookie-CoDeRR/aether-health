"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UrgencyLevel } from "@/types/symptomLog";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  Info,
  ShieldAlert,
  Activity,
  HeartPulse,
} from "lucide-react";

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
  const [showDetailed, setShowDetailed] = useState(false);

  // Clean raw markdown headers
  const cleaned = text
    .replace(/^###\s+Clinical Consultant Assessment.*$/gm, "")
    .replace(/^###\s+/gm, "")
    .trim();

  // Separate simple overview paragraphs from deep clinical breakdown sections
  const rawParagraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const simpleParagraphs: string[] = [];
  const detailedSections: { title: string; body: string }[] = [];

  rawParagraphs.forEach((p) => {
    // Detect deep diagnostic / clinical breakdown headers
    if (
      p.startsWith("#### Clinical Breakdown") ||
      p.startsWith("Clinical Breakdown") ||
      p.startsWith("#### Diagnostic Considerations") ||
      p.startsWith("Diagnostic Considerations") ||
      p.startsWith("#### Clinical Rationale") ||
      p.startsWith("Clinical Rationale") ||
      p.startsWith("#### Patient History") ||
      p.startsWith("Patient History") ||
      p.startsWith("#### Clinical Guidance") ||
      p.startsWith("#### Recommended Next Steps & Timeline") ||
      p.startsWith("Recommended Next Steps & Timeline")
    ) {
      const lines = p.split("\n");
      const title = lines[0].replace(/^####\s*/, "").replace(/^###\s*/, "").trim();
      const body = lines.slice(1).join("\n").trim();
      detailedSections.push({ title, body: body || lines.join("\n") });
    } else {
      // If it's general advice or simple actions, keep in primary view
      simpleParagraphs.push(p);
    }
  });

  // Fallback: If everything ended up in detailed, ensure at least the first is in simple
  if (simpleParagraphs.length === 0 && detailedSections.length > 0) {
    const first = detailedSections.shift()!;
    simpleParagraphs.push(first.body || first.title);
  }

  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-[#064E3B] dark:text-[#ECFDF5]">
      {/* Friendly Header Bar & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs">
            {urgencyLevel === "high_critical" ? (
              <HeartPulse className="w-4 h-4 text-rose-300" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              Aether Care Advice
            </h3>
            <p className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-medium">
              Simple Guidance & Next Steps
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs border ${
            urgencyLevel === "high_critical"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-700 dark:text-rose-300"
              : urgencyLevel === "moderate"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-amber-800 dark:text-amber-300"
              : "bg-[#F9FBF9] dark:bg-[#0F241E] border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981]"
          }`}
        >
          {urgencyLevel === "high_critical" ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
          )}
          <span>
            {urgencyLevel === "high_critical"
              ? "Urgent Care Recommended"
              : urgencyLevel === "moderate"
              ? "Doctor Check Recommended"
              : "Routine / Home Care"}
          </span>
        </span>
      </div>

      {/* Primary Simple & Friendly Assessment */}
      <div className="space-y-3 font-sans leading-relaxed">
        {simpleParagraphs.map((p, idx) => {
          const isAction =
            p.startsWith("#### Immediate Recommended") ||
            p.startsWith("Immediate Recommended") ||
            p.startsWith("#### Recommended Action") ||
            p.startsWith("Recommended Action") ||
            p.startsWith("Recommended Next Steps");

          if (isAction) {
            const lines = p.split("\n");
            const heading = lines[0].replace(/^####\s*/, "");
            const items = lines.slice(1).join("\n");

            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 sm:p-4 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#064E3B] dark:text-[#10B981]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{heading}</span>
                </div>
                <div className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed whitespace-pre-wrap pl-1">
                  {items}
                </div>
              </div>
            );
          }

          return (
            <p key={idx} className="whitespace-pre-wrap text-sm leading-relaxed">
              {p.replace(/^####\s*/, "")}
            </p>
          );
        })}
      </div>

      {/* Bottom Toggle Option for Detailed Clinical Breakdown */}
      <div className="pt-2 border-t border-[#064E3B]/10 dark:border-white/10">
        <button
          type="button"
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-[#064E3B]/5 dark:hover:bg-white/5 border border-[#064E3B]/20 dark:border-white/10 px-3.5 py-2.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
            <span>
              {showDetailed
                ? "Hide Detailed Clinical Breakdown"
                : "Show Detailed Clinical Breakdown & Lab History"}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              showDetailed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Expandable In-Depth Report & Medical History Details */}
        <AnimatePresence>
          {showDetailed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden space-y-3 pt-3"
            >
              {/* Patient Records Context */}
              {patientRecordContext && patientRecordContext.length > 0 && (
                <div className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                      <FileText className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                      <span>Cross-Referenced Medical History ({patientRecordContext.length})</span>
                    </div>

                    {onOpenManageRecords && (
                      <button
                        type="button"
                        onClick={onOpenManageRecords}
                        className="rounded-lg bg-white dark:bg-[#132D26] border border-[#064E3B]/25 dark:border-white/15 hover:bg-[#064E3B] dark:hover:bg-[#10B981] hover:text-white dark:hover:text-[#042F24] text-[#064E3B] dark:text-[#ECFDF5] font-bold px-2 py-0.5 text-[10.5px] transition-all shadow-2xs cursor-pointer"
                      >
                        Manage History
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {patientRecordContext.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#132D26] px-2.5 py-0.5 text-[11px] text-[#064E3B] dark:text-[#A7F3D0] font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Sections */}
              {detailedSections.length > 0 ? (
                detailedSections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-4 space-y-2 text-xs"
                  >
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[#064E3B] dark:text-[#10B981] border-b border-[#064E3B]/10 dark:border-white/10 pb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{sec.title}</span>
                    </h4>
                    <div className="text-[#064E3B]/85 dark:text-[#ECFDF5]/85 leading-relaxed whitespace-pre-wrap pl-0.5">
                      {sec.body}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 text-xs text-[#064E3B]/80 dark:text-[#ECFDF5]/80">
                  <p>
                    All key clinical recommendations and safety reminders are summarized above. If you experience any worsening signs, consult a licensed healthcare professional promptly.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
