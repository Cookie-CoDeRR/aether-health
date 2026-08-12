"use client";

import { useState, useEffect } from "react";
import {
  VectorMedicalRecord,
  getPatientVectorRecords,
  markRecordAsCured,
  deletePatientRecord,
} from "@/services/domain/vectorHistoryService";

interface PatientRecordsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onRecordsUpdated?: () => void;
}

export default function PatientRecordsModal({
  userId,
  isOpen,
  onClose,
  onRecordsUpdated,
}: PatientRecordsModalProps) {
  const [records, setRecords] = useState<VectorMedicalRecord[]>([]);
  const [doctorNoteInput, setDoctorNoteInput] = useState<{ [key: string]: string }>({});

  const reloadRecords = () => {
    const list = getPatientVectorRecords(userId);
    setRecords(list);
    if (onRecordsUpdated) onRecordsUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      reloadRecords();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleMarkCured = (recordId: string) => {
    const note = doctorNoteInput[recordId] || "Cured / resolved by certified doctor.";
    markRecordAsCured(recordId, note);
    reloadRecords();
  };

  const handleDelete = (recordId: string) => {
    deletePatientRecord(recordId);
    reloadRecords();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-5 text-[#F6F1E9]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(246,241,233,0.09)] pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#E8674A]">
              Certified Doctor Verification
            </div>
            <h3 className="font-serif text-xl font-medium tracking-[0.01em] text-[#F6F1E9] pt-0.5">
              Active Medical Records & History
            </h3>
            <p className="text-xs text-[#B9C4CC] pt-1 leading-relaxed">
              Mark records as cured or remove resolved conditions. Cured conditions will no longer be factored into future AI triage assessments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#7C8A93] hover:text-[#F6F1E9] p-1 text-lg font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Records List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgba(246,241,233,0.16)] p-8 text-center text-xs text-[#7C8A93] space-y-1">
              <p className="font-serif text-sm font-medium text-[#F6F1E9]">No active medical records found.</p>
              <p>All past conditions have been marked as cured or resolved.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-3 transition-colors hover:border-[#E8674A]/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      rec.category === "allergy"
                        ? "bg-[#D14343] text-white"
                        : rec.category === "lab_report"
                        ? "bg-[#4F9D8C] text-white"
                        : "bg-[#E8674A] text-white"
                    }`}
                  >
                    {rec.category.replace("_", " ")}
                  </span>
                  <span className="font-mono text-[11px] text-[#7C8A93]">
                    Logged: {rec.createdAt.substring(0, 10)}
                  </span>
                </div>

                <p className="text-xs text-[#F6F1E9] leading-relaxed font-sans font-medium">
                  {rec.content}
                </p>

                {/* Doctor Clearance Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
                  <input
                    type="text"
                    placeholder="Doctor resolution note (optional)..."
                    value={doctorNoteInput[rec.id] || ""}
                    onChange={(e) =>
                      setDoctorNoteInput((prev) => ({ ...prev, [rec.id]: e.target.value }))
                    }
                    className="flex-1 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#0F2130] px-3 py-1.5 text-[11px] text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#4F9D8C]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleMarkCured(rec.id)}
                      className="rounded-lg bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
                    >
                      ✓ Mark Cured
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="rounded-lg border border-[#D14343]/40 bg-[#D14343]/10 text-[#D14343] hover:bg-[#D14343] hover:text-white font-semibold px-3 py-1.5 text-xs transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[rgba(246,241,233,0.09)] pt-3 text-xs text-[#7C8A93]">
          <span>Active Baseline Records: {records.length}</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
