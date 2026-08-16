"use client";

import { useState, useEffect } from "react";
import {
  VectorMedicalRecord,
  getPatientVectorRecords,
  markRecordAsCured,
  deletePatientRecord,
} from "@/services/domain/vectorHistoryService";
import { CheckCircle2, Trash2, X, ShieldAlert, FileText, Activity } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064E3B]/40 p-4 backdrop-blur-xs animate-fade-in text-[#064E3B]">
      <div className="w-full max-w-xl rounded-2xl border border-[#064E3B]/20 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#064E3B]/15 pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]">
              Medical Records Management
            </div>
            <h3 className="font-serif text-xl font-bold tracking-tight text-[#064E3B] pt-0.5">
              Active Medical History & Conditions
            </h3>
            <p className="text-xs text-[#064E3B]/70 pt-1 leading-relaxed">
              Mark records as cured or update resolved conditions. Resolved conditions will no longer affect future AI triage recommendations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#064E3B]/70 hover:text-[#064E3B] p-1.5 rounded-lg hover:bg-[#F9FBF9]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#064E3B]/20 bg-[#F9FBF9] p-8 text-center text-xs text-[#064E3B]/70 space-y-1">
              <p className="font-bold text-sm text-[#064E3B]">No active medical records found.</p>
              <p>All recorded conditions have been resolved.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-[#064E3B]/20 bg-[#F9FBF9] p-4 space-y-3 transition-colors hover:border-[#064E3B]/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 bg-white border border-[#064E3B]/20 text-[#064E3B]">
                    {rec.category === "allergy" ? (
                      <ShieldAlert className="w-3 h-3" />
                    ) : rec.category === "lab_report" ? (
                      <FileText className="w-3 h-3" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    <span>{rec.category.replace("_", " ")}</span>
                  </span>
                  <span className="text-[11px] text-[#064E3B]/60 font-mono">
                    Logged: {rec.createdAt.substring(0, 10)}
                  </span>
                </div>

                <p className="text-xs text-[#064E3B] leading-relaxed font-semibold">
                  {rec.content}
                </p>

                {/* Doctor Clearance Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-[#064E3B]/10">
                  <input
                    type="text"
                    placeholder="Doctor resolution note (optional)..."
                    value={doctorNoteInput[rec.id] || ""}
                    onChange={(e) =>
                      setDoctorNoteInput((prev) => ({ ...prev, [rec.id]: e.target.value }))
                    }
                    className="flex-1 rounded-xl border border-[#064E3B]/20 bg-white px-3 py-1.5 text-xs text-[#064E3B] placeholder-[#064E3B]/50 focus:outline-none focus:border-[#064E3B]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleMarkCured(rec.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white font-bold px-3 py-1.5 text-xs transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Cured</span>
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="rounded-xl border border-[#064E3B]/20 bg-white text-[#064E3B] hover:bg-[#064E3B]/5 px-2.5 py-1.5 text-xs transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#064E3B]/15 pt-3 text-xs text-[#064E3B]">
          <span className="font-semibold">Active Baseline Records: {records.length}</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#064E3B] hover:bg-[#043327] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
