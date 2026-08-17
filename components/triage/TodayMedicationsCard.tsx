"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DailyMedicationItem,
  getTodayAssignedMedications,
  toggleMedicationDoseTaken,
  addAssignedMedication,
} from "@/services/domain/medicationScheduleService";
import { Check, Plus, Clock, Pill, ShieldCheck, X } from "lucide-react";

interface TodayMedicationsCardProps {
  userId: string;
}

export default function TodayMedicationsCard({ userId }: TodayMedicationsCardProps) {
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
    <div className="rounded-3xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-4.5 shadow-sm text-[#064E3B] dark:text-[#ECFDF5] transition-colors">
      {/* Sleek Header */}
      <div className="flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-xs">
            <Pill className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#064E3B] dark:text-[#ECFDF5] tracking-tight">
              Medication Schedule
            </h3>
            <span className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-medium block">
              Today&apos;s Active Reminders
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-[#064E3B] dark:hover:bg-[#10B981] hover:text-white dark:hover:text-[#042F24] px-3 py-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Dose</span>
        </button>
      </div>

      {/* Mini Adherence Indicator */}
      <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/15 dark:border-white/10 p-3 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#064E3B] dark:text-[#ECFDF5]">Daily Adherence</span>
          <span className="font-bold text-[#064E3B] dark:text-[#10B981] bg-white dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 px-2.5 py-0.5 rounded-full text-[11px]">
            {takenCount} of {totalCount} Taken ({progressPct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-white dark:bg-[#132D26] overflow-hidden border border-[#064E3B]/15 dark:border-white/10">
          <div
            className="h-full bg-[#064E3B] dark:bg-[#10B981] transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Medication Dosing Item Cards with Generous Spacing */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {medications.map((med) => (
          <div
            key={med.id}
            onClick={() => handleToggle(med.id)}
            className={`group rounded-2xl border p-3.5 flex items-center justify-between gap-3.5 cursor-pointer transition-all ${
              med.isTaken
                ? "border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9]/90 dark:bg-[#0F241E]/60 opacity-80"
                : "border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0F241E] hover:border-[#064E3B] dark:hover:border-[#10B981] hover:shadow-sm"
            }`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-bold text-xs sm:text-sm text-[#064E3B] dark:text-[#ECFDF5] truncate ${
                    med.isTaken ? "line-through text-[#064E3B]/50 dark:text-white/40" : ""
                  }`}
                >
                  {med.brandName}
                </span>
                <span className="rounded-lg bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 px-2 py-0.5 text-[10.5px] font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                  {med.dosage}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
                <span>{med.scheduleTime} • {med.instruction}</span>
              </div>
            </div>

            {/* Circular Checkmark Button */}
            <div
              className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                med.isTaken
                  ? "bg-[#064E3B] dark:bg-[#10B981] border-[#064E3B] dark:border-[#10B981] text-white dark:text-[#042F24] shadow-2xs"
                  : "bg-white dark:bg-transparent border-[#064E3B]/30 dark:border-white/30 text-transparent group-hover:border-[#064E3B] dark:group-hover:border-[#10B981]"
              }`}
            >
              <Check className="w-4.5 h-4.5 stroke-[3]" />
            </div>
          </div>
        ))}
      </div>

      {/* Safety & Prescription Footer */}
      <div className="flex items-center justify-between border-t border-[#064E3B]/15 dark:border-white/10 pt-3 text-xs">
        <span className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-medium">Allergy checks active</span>
        <Link
          href="/medicines"
          className="font-bold text-[#064E3B] dark:text-[#10B981] hover:underline"
        >
          Pharmacy Prices →
        </Link>
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in text-[#064E3B] dark:text-[#ECFDF5]">
          <form
            onSubmit={handleAddMed}
            className="w-full max-w-sm rounded-3xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <h4 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Add Daily Medication
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crocin 650mg, Glycomet 500mg"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Active Ingredient (Generic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol, Metformin"
                  value={newGeneric}
                  onChange={(e) => setNewGeneric(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Instruction
                </label>
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="e.g. After breakfast, with water"
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#064E3B]/15 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2 text-xs font-bold text-white dark:text-[#042F24] shadow-xs transition-all min-tap-target"
              >
                Save Medication
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
