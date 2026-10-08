"use client";

import React from "react";
import { PatientRecord } from "@/services/clinicalHandoverService";

interface TimelineTabProps {
  patient: PatientRecord;
}

export default function TimelineTab({ patient }: TimelineTabProps) {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-4 shadow-2xs">
        <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
          Longitudinal Medical Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#064E3B]/20 dark:before:bg-white/20">
          {patient.timelineMilestones.map((event) => (
            <div key={event.id} className="relative space-y-1">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[#064E3B] dark:bg-[#10B981] ring-4 ring-white dark:ring-[#0B1D17]" />
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                  {event.title}
                </h4>
                <span className="text-[10px] font-mono text-[#064E3B]/50 dark:text-white/50">
                  {event.date}
                </span>
              </div>
              <p className="text-xs text-[#064E3B]/80 dark:text-[#ECFDF5]/80 leading-relaxed">
                {event.summary}
              </p>
              <span className="block text-[10px] font-mono text-emerald-700 dark:text-[#10B981]">
                {event.facility}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
