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
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface ClinicalResponseCardProps {
  text: string;
  intent?: string;
  urgencyLevel?: UrgencyLevel | null;
  patientRecordContext?: string[];
  onOpenManageRecords?: () => void;
}

function parseClinicalSections(rawText: string) {
  const cleaned = rawText
    .replace(/^###\s+Clinical Consultant Assessment.*$/gm, "")
    .replace(/^###\s+/gm, "")
    .replace(/^####\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1") // Strip double asterisks
    .trim();

  const chunks = cleaned.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);

  let acknowledgement = "";
  const whatsWorthNoticing: string[] = [];
  const selfCare: string[] = [];
  const watchFor: string[] = [];
  let whenToSeeDoctor = "";
  let hasStructuredSections = false;
  const otherParagraphs: string[] = [];

  for (const chunk of chunks) {
    if (/^What's worth noticing:/i.test(chunk)) {
      hasStructuredSections = true;
      const lines = chunk.replace(/^What's worth noticing:\s*/i, "").split("\n");
      for (const line of lines) {
        const item = line.replace(/^[•\-\*]\s*/, "").trim();
        if (item) whatsWorthNoticing.push(item);
      }
    } else if (/^Self-care(\s+steps)?:/i.test(chunk)) {
      hasStructuredSections = true;
      const lines = chunk.replace(/^Self-care(\s+steps)?:\s*/i, "").split("\n");
      for (const line of lines) {
        const item = line.replace(/^[•\-\*]\s*/, "").trim();
        if (item) selfCare.push(item);
      }
    } else if (/^Watch for:/i.test(chunk)) {
      hasStructuredSections = true;
      const lines = chunk.replace(/^Watch for:\s*/i, "").split("\n");
      for (const line of lines) {
        const item = line.replace(/^[•\-\*]\s*/, "").trim();
        if (item && !item.toLowerCase().includes("seek prompt medical")) {
          watchFor.push(item);
        }
      }
    } else if (/^When to see a doctor:/i.test(chunk)) {
      hasStructuredSections = true;
      whenToSeeDoctor = chunk.replace(/^When to see a doctor:\s*/i, "").trim();
    } else if (/^This is general guidance/i.test(chunk)) {
      // Handled by standard bottom disclaimer
    } else if (!acknowledgement && !hasStructuredSections) {
      acknowledgement = chunk;
    } else {
      otherParagraphs.push(chunk);
    }
  }

  return {
    acknowledgement: acknowledgement || otherParagraphs[0] || "",
    whatsWorthNoticing,
    selfCare,
    watchFor,
    whenToSeeDoctor,
    hasStructuredSections,
    otherParagraphs: acknowledgement ? otherParagraphs : otherParagraphs.slice(1),
    cleaned,
  };
}

export default function ClinicalResponseCard({
  text,
  intent,
  urgencyLevel = null,
  patientRecordContext,
  onOpenManageRecords,
}: ClinicalResponseCardProps) {
  const [showDetailed, setShowDetailed] = useState(false);

  const parsed = parseClinicalSections(text);

  // If this is a non-clinical intent or no triage level assigned:
  // Render a clean conversational card without triage badges or Care Advice header.
  const isConversational =
    !urgencyLevel ||
    (intent && intent !== "symptom_report" && intent !== "emergency");

  if (isConversational) {
    return (
      <div className="space-y-2.5 text-sm leading-relaxed text-[#064E3B] dark:text-[#ECFDF5]">
        <div className="whitespace-pre-wrap font-normal leading-relaxed">
          {parsed.cleaned}
        </div>
      </div>
    );
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
              Structured Guidance & Next Steps
            </p>
          </div>
        </div>

        {urgencyLevel && (
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
        )}
      </div>

      {/* Structured Clinical Sections */}
      {parsed.hasStructuredSections ? (
        <div className="space-y-3 font-sans leading-relaxed">
          {/* Acknowledgement Opening */}
          {parsed.acknowledgement && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#064E3B]/90 dark:text-[#ECFDF5]/90 font-medium">
              {parsed.acknowledgement}
            </p>
          )}

          {/* What's worth noticing */}
          {parsed.whatsWorthNoticing.length > 0 && (
            <div className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#064E3B] dark:text-[#10B981]">
                <Eye className="w-3.5 h-3.5" />
                <span>What&apos;s Worth Noticing</span>
              </div>
              <ul className="space-y-1 text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed pl-1">
                {parsed.whatsWorthNoticing.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#064E3B] dark:text-[#10B981] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Self-care Steps */}
          {parsed.selfCare.length > 0 && (
            <div className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#064E3B] dark:text-[#10B981]">
                <Activity className="w-3.5 h-3.5" />
                <span>Self-Care Steps</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed pl-1">
                {parsed.selfCare.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#064E3B] dark:text-[#10B981] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Watch for / Warning Signs */}
          {parsed.watchFor.length > 0 && (
            <div className="rounded-2xl border border-amber-500/25 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Watch For (Seek Urgent Care If These Develop)</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed pl-1">
                {parsed.watchFor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to see a doctor */}
          {parsed.whenToSeeDoctor && (
            <div className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 sm:p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#064E3B] dark:text-[#10B981]">
                <Calendar className="w-3.5 h-3.5" />
                <span>When to See a Doctor</span>
              </div>
              <p className="text-xs text-[#064E3B]/90 dark:text-[#ECFDF5]/90 leading-relaxed pl-1">
                {parsed.whenToSeeDoctor}
              </p>
            </div>
          )}

          {/* Fallback extra paragraphs */}
          {parsed.otherParagraphs.map((p, idx) => (
            <p key={idx} className="whitespace-pre-wrap text-sm leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      ) : (
        /* Fallback Simple Paragraphs */
        <div className="space-y-3 font-sans leading-relaxed">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {parsed.cleaned}
          </p>
        </div>
      )}

      {/* Non-Diagnosis Disclaimer */}
      <div className="pt-2 text-[11.5px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 italic border-t border-[#064E3B]/10 dark:border-white/10">
        This is general guidance, not a diagnosis.
      </div>

      {/* Cross-Referenced Medical History Toggle (if context exists) */}
      {patientRecordContext && patientRecordContext.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDetailed(!showDetailed)}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-[#064E3B]/5 dark:hover:bg-white/5 border border-[#064E3B]/20 dark:border-white/10 px-3.5 py-2.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
              <span>
                {showDetailed
                  ? "Hide Cross-Referenced Medical History"
                  : `Show Cross-Referenced Medical History (${patientRecordContext.length})`}
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showDetailed ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showDetailed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden space-y-3 pt-3"
              >
                <div className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                      <FileText className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                      <span>Cross-Referenced Medical History</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

