import React from "react";
import ActionsGrid from "@/components/actions/ActionsGrid";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Operations | Aether Health",
  description:
    "Execute clinical triage, emergency facility dispatch, pharmacy pricing sync, and EHR data pipeline tasks.",
};

export default function ActionsPage() {
  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto text-[#064E3B] dark:text-[#ECFDF5] w-full pb-28 transition-colors">
      {/* Header Banner */}
      <div className="border-b border-[#064E3B]/15 dark:border-white/10 pb-5 space-y-2">
        <Link
          href="/settings"
          className="text-xs font-bold text-[#064E3B] dark:text-[#10B981] hover:underline inline-flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings & Profile</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-xs font-bold text-[#064E3B] dark:text-[#10B981]">
          <Terminal className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
          <span>System Operations & Diagnostic Modules</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-[#064E3B] dark:text-[#ECFDF5] tracking-tight font-bold">
          System Action Modules
        </h1>

        <p className="max-w-2xl text-xs sm:text-sm text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-relaxed">
          Trigger real-time clinical triage routines, dispatch emergency hospital routing, query pharmaceutical datasets, or synchronize patient EHR health records.
        </p>
      </div>

      {/* Interactive Actions Grid */}
      <ActionsGrid />
    </div>
  );
}
