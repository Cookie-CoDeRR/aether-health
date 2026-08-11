"use client";

import { useState, useEffect } from "react";
import { getHealthTimeline } from "@/services/domain/timelineService";
import { TimelineEntry, TimelineEntryType } from "@/types/timeline";

export default function TimelinePage() {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [filterType, setFilterType] = useState<"all" | TimelineEntryType>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getHealthTimeline("demo-user-123").then((data) => {
      setTimelineEntries(data);
      setIsLoading(false);
    });
  }, []);

  const filteredEntries = timelineEntries.filter(
    (entry) => filterType === "all" || entry.type === filterType
  );

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-4 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-sans font-medium mb-1">
            Chronological Signal Feed
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Health Activity Timeline
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-1 text-xs">
          {[
            { id: "all", label: "All Signal Feed" },
            { id: "symptom_log", label: "Symptoms" },
            { id: "report", label: "Reports" },
            { id: "appointment", label: "Appointments" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id as any)}
              className={`rounded px-3 py-1 font-mono font-medium transition-colors ${
                filterType === pill.id
                  ? "bg-[#132A38] text-[#F6F1E9] font-bold"
                  : "text-[#7C8A93] hover:text-[#F6F1E9]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8674A] border-t-transparent" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(246,241,233,0.16)] p-12 text-center text-xs text-[#7C8A93]">
          No timeline events matching the selected filter.
        </div>
      ) : (
        /* Vertical Chronological Timeline Feed with Colored Connector Dots */
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[rgba(246,241,233,0.09)]">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Connector Dot */}
              <div
                className={`absolute -left-6 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0A1620] text-white shadow-xs ${
                  entry.type === "symptom_log"
                    ? "bg-[#E8674A]"
                    : entry.type === "report"
                    ? "bg-[#4F9D8C]"
                    : "bg-[#132A38]"
                }`}
              >
                {entry.type === "symptom_log" && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                {entry.type === "report" && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  </svg>
                )}
                {entry.type === "appointment" && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="7" r="4" />
                    <path d="M1 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
                  </svg>
                )}
              </div>

              {/* Event Card */}
              <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-2 group-hover:border-[#E8674A]/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-medium text-[#F6F1E9]">{entry.title}</h3>
                    {entry.badgeText && (
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          entry.badgeVariant === "emerald"
                            ? "bg-[#4F9D8C] text-white"
                            : entry.badgeVariant === "amber"
                            ? "bg-[#E8674A] text-white"
                            : entry.badgeVariant === "rose"
                            ? "bg-[#D14343] text-white"
                            : "bg-[#0F2130] text-[#7C8A93]"
                        }`}
                      >
                        {entry.badgeText}
                      </span>
                    )}
                  </div>
                  <time className="font-mono text-[11px] text-[#7C8A93]">
                    {entry.timestamp.toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                <p className="text-xs text-[#B9C4CC] leading-relaxed font-sans">{entry.subtitle}</p>

                {entry.details?.aiSummary && (
                  <div className="rounded-lg bg-[#0F2130] p-2.5 text-[11px] text-[#7C8A93] space-y-1">
                    <p className="font-serif font-medium text-[#F6F1E9]">AI Guidance:</p>
                    <p>{entry.details.aiSummary}</p>
                    {entry.details.suggestedSpecialties && (
                      <p className="text-[#E8674A] font-mono font-medium pt-0.5">Suggested: {entry.details.suggestedSpecialties}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
