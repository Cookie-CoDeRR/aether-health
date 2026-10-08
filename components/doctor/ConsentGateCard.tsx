"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { PatientRecord } from "@/services/clinicalHandoverService";
import { DoctorProfile } from "@/services/authService";

interface ConsentGateCardProps {
  patient: PatientRecord;
  doctorProfile: DoctorProfile;
  consentNotice: string | null;
  onVerifyConsent: () => void;
}

export default function ConsentGateCard({
  patient,
  doctorProfile,
  consentNotice,
  onVerifyConsent,
}: ConsentGateCardProps) {
  return (
    <div className="max-w-xl mx-auto my-6 rounded-3xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-8 shadow-sm space-y-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#10B981] mx-auto">
        <ShieldCheck className="w-7 h-7" />
      </div>
      <div>
        <h3 className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
          Patient Telemetry Consent Gate
        </h3>
        <p className="text-xs text-[#064E3B]/75 dark:text-white/70 mt-1.5 max-w-md mx-auto leading-relaxed">
          Under ABDM Sovereign Health Regulations, access to <strong>{patient.name}</strong>&apos;s live AI triage chat, SBAR clinical handover, and biomarker records requires an active, unexpired patient consent grant for Dr. {doctorProfile.name}.
        </p>
      </div>

      <div className="max-w-xs mx-auto space-y-3 pt-2">
        {consentNotice && (
          <p className="text-xs text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
            {consentNotice}
          </p>
        )}

        <button
          type="button"
          onClick={onVerifyConsent}
          className="w-full h-11 rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
        >
          Verify ABDM Consent Grant
        </button>
      </div>

      <p className="text-[10.5px] text-[#064E3B]/60 dark:text-white/50">
        Patients can grant or revoke 24h/7d telemetry access anytime via their <strong>My Doctor & Care Plan</strong> portal.
      </p>
    </div>
  );
}
