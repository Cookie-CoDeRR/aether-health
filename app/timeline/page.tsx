"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getHealthTimeline,
  issueClearanceCertificate,
  markTimelineEntryAsCured,
  deleteTimelineEntry,
  updateTimelineEntry,
} from "@/services/domain/timelineService";
import { TimelineEntry, TimelineEntryType } from "@/types/timeline";
import {
  HeartPulse,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Stethoscope,
} from "lucide-react";

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
      subtitle: certSubtitle || "Condition certified resolved by licensed physician.",
      doctorName: certDoctorName,
      certificateNote: certNote || "Patient evaluated and certified fully recovered.",
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
      markCuredDoctor || "Certified Specialist",
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
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto text-[#064E3B] dark:text-[#ECFDF5] w-full pb-44 sm:pb-52 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-4 gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 dark:text-[#10B981] mb-1 flex items-center gap-2">
            <Link
              href="/reports"
              className="hover:underline flex items-center gap-1 text-[#064E3B] dark:text-[#10B981]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Reports</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5] mt-1">
            Health History Timeline
          </h1>
          <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
            Human-readable health journey & care milestones
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] px-4 py-2 text-xs font-bold shadow-soft transition-all min-tap-target"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Clearance</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Events" },
          { id: "symptom_log", label: "Symptom Checks" },
          { id: "report", label: "Lab Reports" },
          { id: "cured_certificate", label: "Doctor Clearances" },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilterType(pill.id as any)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap min-tap-target ${
              filterType === pill.id
                ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-soft"
                : "bg-white dark:bg-[#0F241E] text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#F9FBF9] dark:hover:bg-white/5 border border-[#064E3B]/20 dark:border-white/10"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#064E3B] dark:border-[#10B981] border-t-transparent" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-12 text-center text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 shadow-sm">
          No timeline events matching the selected filter.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:sm:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#064E3B]/15 dark:before:bg-white/10">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Connector Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 flex h-7 w-7 sm:h-8 sm:sm-w-8 items-center justify-center rounded-full border-2 border-white dark:border-[#081511] shadow-card text-white text-xs ${
                  entry.isCuredCleared || entry.type === "cured_certificate"
                    ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24]"
                    : entry.type === "symptom_log"
                    ? "bg-amber-600"
                    : "bg-[#064E3B]/80 dark:bg-emerald-900"
                }`}
              >
                {entry.isCuredCleared || entry.type === "cured_certificate" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : entry.type === "symptom_log" ? (
                  <HeartPulse className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>

              {/* Event Card formatted as Human-Readable Story */}
              <div
                className={`rounded-2xl border p-5 space-y-3 transition-all shadow-sm bg-white dark:bg-[#0B1D17] ${
                  entry.isCuredCleared || entry.type === "cured_certificate"
                    ? "border-[#064E3B]/30 dark:border-[#10B981]/40 ring-1 ring-[#064E3B]/10 dark:ring-[#10B981]/20"
                    : "border-[#064E3B]/20 dark:border-white/10 hover:border-[#064E3B] dark:hover:border-[#10B981]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#064E3B]/15 dark:border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                      {entry.title}
                    </h3>

                    {entry.isCuredCleared ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] px-2.5 py-0.5 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#064E3B] dark:text-[#10B981]" />
                        <span>Resolved & Cleared</span>
                      </span>
                    ) : (
                      entry.badgeText && (
                        <span className="rounded-full bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B]/80 dark:text-[#ECFDF5]/80 px-2.5 py-0.5 text-[11px] font-medium">
                          {entry.badgeText}
                        </span>
                      )
                    )}
                  </div>

                  <time className="text-xs text-[#064E3B]/60 dark:text-white/50 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#064E3B]/40 dark:text-white/40" />
                    <span>
                      {entry.timestamp.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </time>
                </div>

                <p className="text-xs sm:text-sm text-[#064E3B]/80 dark:text-[#ECFDF5]/80 leading-relaxed">
                  {entry.subtitle}
                </p>

                {/* Medical Clearance Detail Block */}
                {entry.isCuredCleared && (
                  <div className="rounded-xl border border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#064E3B] dark:text-[#10B981]">
                      <Stethoscope className="w-4 h-4 text-[#064E3B] dark:text-[#10B981]" />
                      <span>Certified Medical Resolution</span>
                      {entry.curedDoctorName && (
                        <span className="font-normal text-[#064E3B]/70 dark:text-white/60">
                          — {entry.curedDoctorName}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed">
                      {entry.curedCertificateNote}
                    </p>
                  </div>
                )}

                {/* Card Action Controls: Edit, Mark Cured, Delete */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#064E3B]/15 dark:border-white/10 text-xs">
                  {!entry.isCuredCleared && (
                    <button
                      onClick={() => {
                        setActiveEntryForCured(entry);
                        setMarkCuredDoctor("");
                        setMarkCuredNote("");
                      }}
                      className="rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] hover:bg-[#064E3B] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-[#042F24] px-3 py-1.5 font-bold transition-colors min-tap-target"
                    >
                      ✓ Mark Cured
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingEntry(entry);
                      setEditTitle(entry.title);
                      setEditSubtitle(entry.subtitle);
                    }}
                    className="rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#F9FBF9] dark:hover:bg-white/10 px-2.5 py-1.5 transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2.5 py-1.5 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clearance Certificate Creation Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4 text-[#064E3B] dark:text-[#ECFDF5]">
            <div className="flex justify-between items-center border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Add Medical Clearance Certificate
                </h3>
                <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">Document physician clearance for a condition</p>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Medical Topic / Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis / Bacterial Infection"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Attending Physician Name & Department</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins (Pulmonology)"
                  value={certDoctorName}
                  onChange={(e) => setCertDoctorName(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Summary Note</label>
                <input
                  type="text"
                  placeholder="e.g. Patient fully recovered after course of antibiotics."
                  value={certSubtitle}
                  onChange={(e) => setCertSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Clinical Clearance Details</label>
                <textarea
                  rows={2}
                  placeholder="Follow-up lab markers and chest scan verified normal..."
                  value={certNote}
                  onChange={(e) => setCertNote(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#064E3B]/15 dark:border-white/10">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCertificate}
                disabled={!certTitle.trim() || !certDoctorName.trim()}
                className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft disabled:opacity-50 transition-all min-tap-target"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Cured Modal */}
      {activeEntryForCured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4 text-[#064E3B] dark:text-[#ECFDF5]">
            <div className="flex justify-between items-center border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Mark Condition as Resolved
              </h3>
              <button onClick={() => setActiveEntryForCured(null)} className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
              Confirm that <strong>&quot;{activeEntryForCured.title}&quot;</strong> has resolved.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Physician / Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Michael Vance"
                  value={markCuredDoctor}
                  onChange={(e) => setMarkCuredDoctor(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Resolution Details</label>
                <textarea
                  rows={2}
                  placeholder="Notes on recovery, follow-up tests, or doctor verification..."
                  value={markCuredNote}
                  onChange={(e) => setMarkCuredNote(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#064E3B]/15 dark:border-white/10">
              <button
                onClick={() => setActiveEntryForCured(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkCuredSubmit}
                className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
              >
                ✓ Mark Cured & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4 text-[#064E3B] dark:text-[#ECFDF5]">
            <div className="flex justify-between items-center border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">Edit Timeline Entry</h3>
              <button onClick={() => setEditingEntry(null)} className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#064E3B]/15 dark:border-white/10">
              <button
                onClick={() => setEditingEntry(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
