"use client";

import React from "react";
import { Pill, Plus, Trash2, ShieldCheck, Zap } from "lucide-react";
import { PatientRecord } from "@/services/clinicalHandoverService";

export interface MultiRxItem {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  mealTiming: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  instructions: string;
}

interface PrescriptionDispenserTabProps {
  patient: PatientRecord;
  rxList: MultiRxItem[];
  onAddRxItem: () => void;
  onRemoveRxItem: (id: string) => void;
  onUpdateRxItem: (id: string, field: keyof MultiRxItem, value: any) => void;
  onToggleTimeOfDay: (id: string, timeOption: string) => void;
  onPrescribeAllMedications: (e: React.FormEvent) => void;
  prescriptionError: string | null;
  prescriptionSuccess: string | null;
}

const SCHEDULE_OPTIONS = [
  "Morning (08:00 AM)",
  "Afternoon (01:00 PM)",
  "Evening (06:30 PM)",
  "Night (09:30 PM)",
];

export default function PrescriptionDispenserTab({
  patient,
  rxList,
  onAddRxItem,
  onRemoveRxItem,
  onUpdateRxItem,
  onToggleTimeOfDay,
  onPrescribeAllMedications,
  prescriptionError,
  prescriptionSuccess,
}: PrescriptionDispenserTabProps) {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              <Pill className="w-4.5 h-4.5 text-emerald-600" />
              <span>Prescriptions & Dosing Dispenser</span>
            </div>
            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
              Broadcasts directly to {patient.name}&apos;s live daily medication schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddRxItem}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Status alerts */}
        {prescriptionError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 font-bold">
            {prescriptionError}
          </div>
        )}

        {prescriptionSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
            {prescriptionSuccess}
          </div>
        )}

        {/* Multi-Rx Form */}
        <form onSubmit={onPrescribeAllMedications} className="space-y-3.5">
          {rxList.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/5 pb-2">
                <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#064E3B] text-white text-[10px]">
                    {index + 1}
                  </span>
                  <span>Medication #{index + 1}</span>
                </span>

                {rxList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRxItem(item.id)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Medicine & Formulation
                  </label>
                  <input
                    type="text"
                    required
                    value={item.brandName}
                    onChange={(e) => onUpdateRxItem(item.id, "brandName", e.target.value)}
                    placeholder="e.g. Pantoprazole 40"
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    value={item.dosage}
                    onChange={(e) => onUpdateRxItem(item.id, "dosage", e.target.value)}
                    placeholder="e.g. 40 mg"
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={item.totalDays}
                    onChange={(e) => onUpdateRxItem(item.id, "totalDays", Number(e.target.value))}
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>

              {/* Time of Day Checkboxes */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Time of Day Schedule
                </label>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  {SCHEDULE_OPTIONS.map((timeOpt) => {
                    const isChecked = item.timesOfDay.includes(timeOpt);
                    return (
                      <button
                        key={timeOpt}
                        type="button"
                        onClick={() => onToggleTimeOfDay(item.id, timeOpt)}
                        className={`px-3 py-1 rounded-xl border text-[11px] transition-all cursor-pointer ${
                          isChecked
                            ? "bg-[#064E3B] text-white border-[#064E3B] dark:bg-[#10B981] dark:text-[#042F24] dark:border-[#10B981]"
                            : "bg-white dark:bg-[#0B1D17] border-[#064E3B]/20 text-[#064E3B]/80 dark:text-white/80"
                        }`}
                      >
                        {isChecked ? "✓ " : "+ "}
                        {timeOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meal Timing & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Meal Timing
                  </label>
                  <select
                    value={item.mealTiming}
                    onChange={(e) => onUpdateRxItem(item.id, "mealTiming", e.target.value)}
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  >
                    <option value="Before Food (Empty stomach)">Before Food (Empty stomach)</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                    <option value="At Bedtime">At Bedtime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={item.instructions}
                    onChange={(e) => onUpdateRxItem(item.id, "instructions", e.target.value)}
                    placeholder="e.g. Take 30 mins before breakfast."
                    className="w-full rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-white dark:bg-[#0B1D17] px-3 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-600/20 p-3 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-[#10B981] shrink-0" />
            <span>Aether Allergy Guard automatically evaluates each formulation against Penicillin & Amoxicillin sensitivities.</span>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-3 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Dispense & Sync All {rxList.length} Prescription(s) Live</span>
          </button>
        </form>
      </div>
    </div>
  );
}
