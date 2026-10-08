"use client";

import React from "react";
import { PatientRecord } from "@/services/clinicalHandoverService";

interface LabBiomarkersTabProps {
  patient: PatientRecord;
}

export default function LabBiomarkersTab({ patient }: LabBiomarkersTabProps) {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-2xs">
        <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
          Extracted Lab Biometrics & ECG Scans
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {patient.recentLabMarkers.map((marker, idx) => {
            const isHigh = marker.status === "high";
            return (
              <div
                key={idx}
                className={`rounded-2xl p-4 border transition-all ${
                  isHigh
                    ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300"
                    : "bg-[#F9FBF9] dark:bg-[#0F241E] border-[#064E3B]/10 dark:border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#064E3B]/75 dark:text-white/75 truncate">
                    {marker.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase ${
                      isHigh
                        ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    }`}
                  >
                    {marker.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-2.5">
                  <span className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    {marker.value}
                  </span>
                  <span className="text-[10px] font-mono text-[#064E3B]/50 dark:text-white/50">
                    {marker.unit}
                  </span>
                </div>

                <span className="block text-[10px] text-[#064E3B]/50 dark:text-white/40 mt-1 font-mono">
                  Ref Range: {marker.reference} {marker.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
