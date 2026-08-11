import React from "react";
import ActionsGrid from "@/components/actions/ActionsGrid";

export const dynamic = "force-dynamic";


export const metadata = {
  title: "Action Modules | AETHER Healthcare",
  description:
    "Execute clinical triage, emergency facility dispatch, pharmacy pricing sync, and EHR data pipeline tasks.",
};

export default function ActionsPage() {
  return (
    <div className="space-y-8 animate-fade-in p-6 lg:p-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132A38] border border-[rgba(246,241,233,0.16)] font-mono text-xs text-[#E8674A]">
          <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span>AETHER Operations & Dispatch Center</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif text-[#F6F1E9] tracking-tight font-medium">
          System Action Modules
        </h1>

        <p className="max-w-2xl text-xs sm:text-sm text-[#B9C4CC] font-sans leading-relaxed font-light">
          Trigger real-time clinical triage routines, dispatch emergency hospital routing via OpenStreetMap, query OpenFDA pharmaceutical datasets, or push patient EHR records.
        </p>
      </div>

      {/* Interactive Actions Grid */}
      <ActionsGrid />
    </div>
  );
}
