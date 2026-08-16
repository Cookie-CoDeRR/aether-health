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
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto text-[#1E293B] w-full">
      {/* Header Banner */}
      <div className="border-b border-[#E2E8F0] pb-5 space-y-2">
        <Link
          href="/settings"
          className="text-xs font-semibold text-[#1E5D57] hover:underline inline-flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings & Profile</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#D0EAE4] text-xs font-medium text-[#134E48]">
          <Terminal className="w-3.5 h-3.5 text-[#1E5D57]" />
          <span>System Operations & Diagnostic Modules</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-[#1E293B] tracking-tight font-semibold">
          System Action Modules
        </h1>

        <p className="max-w-2xl text-xs sm:text-sm text-[#64748B] leading-relaxed">
          Trigger real-time clinical triage routines, dispatch emergency hospital routing, query pharmaceutical datasets, or synchronize patient EHR health records.
        </p>
      </div>

      {/* Interactive Actions Grid */}
      <ActionsGrid />
    </div>
  );
}
