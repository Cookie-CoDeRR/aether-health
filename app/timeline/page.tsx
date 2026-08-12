"use client";

import { useState, useEffect } from "react";
import {
  getHealthTimeline,
  issueClearanceCertificate,
  markTimelineEntryAsCured,
  deleteTimelineEntry,
  updateTimelineEntry,
} from "@/services/domain/timelineService";
import { TimelineEntry, TimelineEntryType } from "@/types/timeline";

export default function TimelinePage() {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [filterType, setFilterType] = useState<"all" | TimelineEntryType>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Active Edit States
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certSubtitle, setCertSubtitle] = useState("");
  const [certDoctorName, setCertDoctorName] = useState("");
  const [certNote, setCertNote] = useState("");

  const [activeEntryForCured, setActiveEntryForCured] = useState<TimelineEntry | null>(null);
  const [markCuredDoctor, setMarkCuredDoctor] = useState("");
  const [markCuredNote, setMarkCuredNote] = useState("");

  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");

  const reloadTimeline = () => {
    setIsLoading(true);
    getHealthTimeline("aether_usr_8f92a170b4c2").then((data) => {
      setTimelineEntries(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    reloadTimeline();
  }, []);

  const filteredEntries = timelineEntries.filter(
    (entry) => filterType === "all" || entry.type === filterType
  );

  const handleCreateCertificate = async () => {
    if (!certTitle.trim() || !certDoctorName.trim()) return;
    await issueClearanceCertificate({
      userId: "aether_usr_8f92a170b4c2",
      title: certTitle,
      subtitle: certSubtitle || "Patient condition certified fully cured and cleared.",
      doctorName: certDoctorName,
      certificateNote: certNote || "Condition evaluated and verified completely resolved.",
    });

    setIsCertModalOpen(false);
    setCertTitle("");
    setCertSubtitle("");
    setCertDoctorName("");
    setCertNote("");
    reloadTimeline();
  };

  const handleMarkCuredSubmit = async () => {
    if (!activeEntryForCured) return;
    await markTimelineEntryAsCured(
      activeEntryForCured.id,
      markCuredDoctor || "Certified Specialist Practitioner",
      markCuredNote || "Evaluated and certified cured."
    );

    setActiveEntryForCured(null);
    setMarkCuredDoctor("");
    setMarkCuredNote("");
    reloadTimeline();
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    await updateTimelineEntry(editingEntry.id, {
      title: editTitle,
      subtitle: editSubtitle,
    });
    setEditingEntry(null);
    reloadTimeline();
  };

  const handleDelete = async (entryId: string) => {
    await deleteTimelineEntry(entryId);
    reloadTimeline();
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-12 max-w-4xl mx-auto text-[#F6F1E9]">
      {/* Issue Clearance Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[rgba(246,241,233,0.09)] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#4F9D8C]">
                  Official Clearance
                </div>
                <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                  Issue Certificate of Being Cured
                </h3>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="text-[#7C8A93]">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#F6F1E9]">Condition / Medical Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Gastroenteritis / Stomach Infection"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#F6F1E9]">Certified Doctor Name & Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins (Gastroenterology)"
                  value={certDoctorName}
                  onChange={(e) => setCertDoctorName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#F6F1E9]">Summary Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Patient fully recovered after 5-day course."
                  value={certSubtitle}
                  onChange={(e) => setCertSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#F6F1E9]">Doctor Resolution / Clearance Note</label>
                <textarea
                  rows={2}
                  placeholder="Detailed notes confirming patient has no active symptoms or lab abnormalities..."
                  value={certNote}
                  onChange={(e) => setCertNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs text-[#7C8A93]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCertificate}
                disabled={!certTitle.trim() || !certDoctorName.trim()}
                className="rounded-xl bg-[#4F9D8C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#4F9D8C]/90 disabled:opacity-50 transition-colors"
              >
                📜 Issue & Update Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Existing Card as Cured Modal */}
      {activeEntryForCured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[rgba(246,241,233,0.09)] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                Mark Condition as Cured
              </h3>
              <button onClick={() => setActiveEntryForCured(null)} className="text-[#7C8A93]">✕</button>
            </div>

            <p className="text-xs text-[#B9C4CC]">
              Marking <strong>&quot;{activeEntryForCured.title}&quot;</strong> as cured will update the health timeline and resolve AI vector memories.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#F6F1E9]">Clearing Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Michael Vance"
                  value={markCuredDoctor}
                  onChange={(e) => setMarkCuredDoctor(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#F6F1E9]">Resolution / Clearance Details</label>
                <textarea
                  rows={2}
                  placeholder="Notes on recovery, follow-up tests, or doctor verification..."
                  value={markCuredNote}
                  onChange={(e) => setMarkCuredNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#4F9D8C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <button
                onClick={() => setActiveEntryForCured(null)}
                className="rounded-lg px-4 py-2 text-xs text-[#7C8A93]"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkCuredSubmit}
                className="rounded-xl bg-[#4F9D8C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#4F9D8C]/90 transition-colors"
              >
                ✓ Mark Cured & Update Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[rgba(246,241,233,0.09)] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">Edit Timeline Entry</h3>
              <button onClick={() => setEditingEntry(null)} className="text-[#7C8A93]">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#F6F1E9]">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#F6F1E9]">Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <button onClick={() => setEditingEntry(null)} className="rounded-lg px-4 py-2 text-xs text-[#7C8A93]">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-4 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-sans font-medium mb-1">
            Chronological Signal Feed
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Health Activity Timeline
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="rounded-lg bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white font-semibold px-3.5 py-1.5 text-xs transition-all flex items-center gap-1.5 font-mono shadow-xs"
          >
            <span>📜 + Issue Clearance Certificate</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-1 text-xs font-mono">
            {[
              { id: "all", label: "All" },
              { id: "symptom_log", label: "Symptoms" },
              { id: "report", label: "Reports" },
              { id: "cured_certificate", label: "Clearances" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id as any)}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
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
        /* Vertical Chronological Timeline Feed */
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[rgba(246,241,233,0.09)]">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Connector Dot */}
              <div
                className={`absolute -left-6 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0A1620] text-white shadow-xs ${
                  entry.isCuredCleared || entry.type === "cured_certificate"
                    ? "bg-[#4F9D8C]"
                    : entry.type === "symptom_log"
                    ? "bg-[#E8674A]"
                    : entry.type === "report"
                    ? "bg-[#132A38]"
                    : "bg-[#0F2130]"
                }`}
              >
                {entry.isCuredCleared || entry.type === "cured_certificate" ? (
                  "✓"
                ) : entry.type === "symptom_log" ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  </svg>
                )}
              </div>

              {/* Event Card */}
              <div
                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                  entry.isCuredCleared || entry.type === "cured_certificate"
                    ? "border-[#4F9D8C]/50 bg-[#4F9D8C]/10"
                    : "border-[rgba(246,241,233,0.09)] bg-[#132A38] group-hover:border-[#E8674A]/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-medium text-[#F6F1E9]">{entry.title}</h3>

                    {entry.isCuredCleared ? (
                      <span className="rounded bg-[#4F9D8C] text-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        ✓ CURED & CLEARED
                      </span>
                    ) : (
                      entry.badgeText && (
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
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#7C8A93]">
                    <time>
                      {entry.timestamp.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>

                <p className="text-xs text-[#B9C4CC] leading-relaxed font-sans">{entry.subtitle}</p>

                {/* Certified Clearance Note Block */}
                {entry.isCuredCleared && (
                  <div className="rounded-lg border border-[#4F9D8C]/30 bg-[#0F2130] p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#4F9D8C]">
                      <span>📜 Certified Medical Clearance</span>
                      {entry.curedDoctorName && <span className="font-normal text-[#B9C4CC]">({entry.curedDoctorName})</span>}
                    </div>
                    <p className="text-[#B9C4CC] text-[11px] leading-relaxed">{entry.curedCertificateNote}</p>
                  </div>
                )}

                {entry.details?.aiSummary && !entry.isCuredCleared && (
                  <div className="rounded-lg bg-[#0F2130] p-2.5 text-[11px] text-[#7C8A93] space-y-1">
                    <p className="font-serif font-medium text-[#F6F1E9]">AI Guidance:</p>
                    <p>{entry.details.aiSummary}</p>
                  </div>
                )}

                {/* Card Action Controls: Edit, Mark Cured, Delete */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)] text-[11px] font-mono">
                  {!entry.isCuredCleared && (
                    <button
                      onClick={() => {
                        setActiveEntryForCured(entry);
                        setMarkCuredDoctor("");
                        setMarkCuredNote("");
                      }}
                      className="rounded bg-[#4F9D8C]/20 border border-[#4F9D8C] text-[#4F9D8C] hover:bg-[#4F9D8C] hover:text-white px-2.5 py-1 font-semibold transition-colors"
                    >
                      ✓ Mark Cured & Attach Cert
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingEntry(entry);
                      setEditTitle(entry.title);
                      setEditSubtitle(entry.subtitle);
                    }}
                    className="rounded bg-[#0F2130] border border-[rgba(246,241,233,0.16)] text-[#B9C4CC] hover:text-[#F6F1E9] px-2.5 py-1 transition-colors"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded bg-[#D14343]/10 border border-[#D14343]/30 text-[#D14343] hover:bg-[#D14343] hover:text-white px-2 py-1 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
