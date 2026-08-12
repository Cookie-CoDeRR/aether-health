"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DailyMedicationItem,
  getTodayAssignedMedications,
  toggleMedicationDoseTaken,
  addAssignedMedication,
} from "@/services/domain/medicationScheduleService";

interface TodayMedicationsCardProps {
  userId: string;
  isMobileCompact?: boolean;
}

export default function TodayMedicationsCard({ userId, isMobileCompact = false }: TodayMedicationsCardProps) {
  const [medications, setMedications] = useState<DailyMedicationItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newBrand, setNewBrand] = useState("");
  const [newGeneric, setNewGeneric] = useState("");
  const [newDosage, setNewDosage] = useState("1 Tablet");
  const [newTime, setNewTime] = useState("08:00 AM");
  const [newInstruction, setNewInstruction] = useState("After Meal");

  const reloadMeds = () => {
    setMedications(getTodayAssignedMedications(userId));
  };

  useEffect(() => {
    reloadMeds();
  }, [userId]);

  const handleToggle = (id: string) => {
    toggleMedicationDoseTaken(id);
    reloadMeds();
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    addAssignedMedication({
      userId,
      brandName: newBrand,
      genericName: newGeneric || newBrand,
      dosage: newDosage,
      scheduleTime: newTime,
      instruction: newInstruction,
    });

    setNewBrand("");
    setNewGeneric("");
    setIsAddModalOpen(false);
    reloadMeds();
  };

  const takenCount = medications.filter((m) => m.isTaken).length;
  const totalCount = medications.length;
  const progressPct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-3.5 sm:p-4 space-y-3 text-[#F6F1E9]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 font-serif text-sm sm:text-base font-medium text-[#F6F1E9]">
            <span>💊 Today&apos;s Assigned Medications</span>
          </div>
          <p className="text-[9.5px] font-mono text-[#7C8A93] uppercase tracking-wider pt-0.5">
            Active Patient Dosing Schedule
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-[#E8674A] hover:bg-[#E8674A]/90 text-[#0A1620] px-2.5 py-1 text-[11px] font-bold transition-all shrink-0"
        >
          + Add
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 font-mono text-xs">
        <div className="flex justify-between text-[10.5px] text-[#7C8A93]">
          <span>Dose Compliance</span>
          <span className="text-[#4F9D8C] font-bold">{takenCount}/{totalCount} Taken ({progressPct}%)</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#0F2130] overflow-hidden border border-[rgba(246,241,233,0.09)]">
          <div
            className="h-full bg-[#4F9D8C] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Medication Dosing List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`rounded-lg border p-2.5 space-y-1.5 transition-all ${
              med.isTaken
                ? "border-[#4F9D8C]/40 bg-[#4F9D8C]/10 opacity-90"
                : "border-[rgba(246,241,233,0.09)] bg-[#0F2130]"
            }`}
          >
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#F6F1E9] truncate">
                    {med.brandName}
                  </h4>
                  <span className="font-mono text-[9px] text-[#E8674A] bg-[#E8674A]/10 px-1.5 py-0.5 rounded shrink-0">
                    {med.dosage}
                  </span>
                </div>
                <p className="text-[10px] text-[#7C8A93] font-mono truncate">{med.genericName}</p>
              </div>

              <button
                onClick={() => handleToggle(med.id)}
                className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold transition-all shrink-0 ${
                  med.isTaken
                    ? "bg-[#4F9D8C] text-white"
                    : "bg-[#132A38] border border-[rgba(246,241,233,0.16)] text-[#B9C4CC] hover:border-[#4F9D8C] hover:text-[#F6F1E9]"
                }`}
              >
                {med.isTaken ? `✓ Taken` : "⏰ Take"}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#7C8A93] pt-0.5">
              <span>🕒 {med.scheduleTime} • {med.instruction}</span>
            </div>

            {med.allergySafeWarning && (
              <div className="text-[9.5px] font-mono text-[#4F9D8C] flex items-center gap-1 pt-0.5 border-t border-[rgba(246,241,233,0.09)] truncate">
                <span>🛡️ {med.allergySafeWarning}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="flex justify-between items-center border-t border-[rgba(246,241,233,0.09)] pt-2.5 text-xs">
        <span className="text-[10px] text-[#7C8A93] font-mono">Penicillin Allergy Checked</span>
        <Link href="/medicines" className="font-mono text-[10px] font-semibold text-[#E8674A] hover:underline">
          View All →
        </Link>
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddMed}
            className="w-full max-w-sm rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-5 shadow-2xl space-y-3"
          >
            <div className="flex justify-between items-center border-b border-[rgba(246,241,233,0.09)] pb-2">
              <h4 className="font-serif text-base font-medium text-[#F6F1E9]">Assign New Medication</h4>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[#7C8A93]">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-[#F6F1E9]">Brand / Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 650mg"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#F6F1E9]">Generic / Active Ingredient</label>
                <input
                  type="text"
                  placeholder="e.g. Acetaminophen"
                  value={newGeneric}
                  onChange={(e) => setNewGeneric(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#F6F1E9]">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#F6F1E9]">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#F6F1E9]">Instruction</label>
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-[#7C8A93]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#E8674A] px-4 py-1.5 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all"
              >
                Assign Medication
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
