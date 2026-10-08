"use client";

import React from "react";
import { Activity, Search, Clock } from "lucide-react";
import { PatientRecord } from "@/services/clinicalHandoverService";

export interface PatientDisplayInfo {
  name: string;
  initials: string;
  complaint: string;
  abha: string;
  demographics: string;
  allergies: string;
  isMasked: boolean;
  isEmergencyBypass: boolean;
}

interface PatientQueueSidebarProps {
  patients: PatientRecord[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  urgencyFilter: "all" | "high_critical" | "moderate" | "routine";
  onUrgencyFilterChange: (filter: "all" | "high_critical" | "moderate" | "routine") => void;
  getPatientDisplay: (patient: PatientRecord) => PatientDisplayInfo;
}

export default function PatientQueueSidebar({
  patients,
  selectedPatientId,
  onSelectPatient,
  searchQuery,
  onSearchChange,
  urgencyFilter,
  onUrgencyFilterChange,
  getPatientDisplay,
}: PatientQueueSidebarProps) {
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency = urgencyFilter === "all" ? true : p.urgencyLevel === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <aside className="w-72 lg:w-80 shrink-0 flex flex-col h-full bg-white dark:bg-[#0B1D17] overflow-hidden">
      {/* Queue Header & Search */}
      <div className="p-3.5 border-b border-[#064E3B]/10 dark:border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-serif text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
            <span>Patient Triage Queue</span>
          </span>
          <span className="rounded-full bg-[#064E3B]/10 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#064E3B] dark:text-[#ECFDF5]">
            {filteredPatients.length} Active
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#064E3B]/50 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patient, ID, symptoms..."
            className="w-full h-8.5 rounded-xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] pl-9 pr-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/50 dark:placeholder-white/40 focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
            aria-label="Search patients queue"
          />
        </div>

        {/* Urgency Filter Badges */}
        <div className="flex items-center gap-1 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => onUrgencyFilterChange("all")}
            className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
              urgencyFilter === "all"
                ? "bg-[#064E3B] text-white dark:bg-[#10B981] dark:text-[#042F24]"
                : "bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B]/70 dark:text-white/70"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onUrgencyFilterChange("high_critical")}
            className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
              urgencyFilter === "high_critical"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
            }`}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => onUrgencyFilterChange("moderate")}
            className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
              urgencyFilter === "moderate"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
            }`}
          >
            Moderate
          </button>
          <button
            type="button"
            onClick={() => onUrgencyFilterChange("routine")}
            className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
              urgencyFilter === "routine"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            Routine
          </button>
        </div>
      </div>

      {/* Patients List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#064E3B]/10 dark:divide-white/5">
        {filteredPatients.map((patient) => {
          const isSelected = patient.patientId === selectedPatientId;
          const isCritical = patient.urgencyLevel === "high_critical";
          const isModerate = patient.urgencyLevel === "moderate";
          const display = getPatientDisplay(patient);

          return (
            <button
              key={patient.patientId}
              type="button"
              onClick={() => onSelectPatient(patient.patientId)}
              className={`w-full text-left p-3.5 transition-all flex flex-col gap-1 relative cursor-pointer ${
                isSelected
                  ? "bg-[#F9FBF9] dark:bg-[#132D26] border-l-4 border-l-[#064E3B] dark:border-l-[#10B981]"
                  : "hover:bg-[#F9FBF9]/60 dark:hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                    {display.name}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider ${
                    isCritical
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300"
                      : isModerate
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300"
                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                  }`}
                >
                  {patient.urgencyLevel.replace("_", " ")}
                </span>
              </div>

              <p className="text-[11px] text-[#064E3B]/75 dark:text-[#A7F3D0]/75 line-clamp-1 leading-snug">
                {display.complaint}
              </p>

              <div className="flex items-center justify-between text-[9.5px] text-[#064E3B]/50 dark:text-white/40 pt-0.5">
                <span>
                  {display.isMasked ? "Consent Protected" : `${patient.age}y • ${patient.gender} • ${patient.bloodGroup}`}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#064E3B]/60 dark:text-white/40" />
                  <span>{patient.lastTriageAt}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
