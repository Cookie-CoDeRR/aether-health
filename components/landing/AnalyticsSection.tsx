"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnalyticsSection() {
  const [activeTab, setActiveTab] = useState<"triage" | "cost" | "ocr">("triage");

  return (
    <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 border-t border-[#E2E8F0] text-[#1E293B]">
      {/* Title */}
      <div className="text-center space-y-2.5">
        <span className="text-xs uppercase tracking-wider text-[#1E5D57] font-semibold">
          Patient Impact & Clinical Benefits
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E293B]">
          Why Accessible Healthcare Navigation Matters
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#64748B] leading-relaxed">
          Quantitative improvements in emergency facility discovery, specialist routing speed, and medication cost transparency.
        </p>
      </div>

      {/* Analytics Tabs */}
      <div className="flex justify-center gap-2 text-xs max-w-md mx-auto p-1 bg-[#F1F5F4] rounded-2xl border border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab("triage")}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "triage"
              ? "bg-[#1E5D57] text-white shadow-soft"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          🚑 Care Response
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "cost"
              ? "bg-[#1E5D57] text-white shadow-soft"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          💊 Medicine Pricing
        </button>
        <button
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "ocr"
              ? "bg-[#1E5D57] text-white shadow-soft"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          📄 Report Insights
        </button>
      </div>

      {/* Graph Display Card */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-10 shadow-card space-y-6">
        {activeTab === "triage" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                  Emergency Facility Discovery & Routing Speed
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Comparison between traditional search methods vs Aether instant map routing.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#134E48] bg-[#E6F4F1] px-3 py-1 rounded-full border border-[#D0EAE4]">
                73% Faster Emergency Discovery
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-[#475569] mb-1 font-medium">
                  <span>Traditional Hospital Search & Calling</span>
                  <span className="text-[#C85339] font-bold">45 - 60 mins</span>
                </div>
                <div className="h-4 w-full bg-[#F1F5F4] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1 }}
                    className="h-full bg-[#E06D53] rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#475569] mb-1 font-medium">
                  <span>Aether Real-Time GPS Routing + On-Duty Doctor Roster</span>
                  <span className="text-[#1E5D57] font-bold">2 - 3 mins</span>
                </div>
                <div className="h-4 w-full bg-[#F1F5F4] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12%" }}
                    transition={{ duration: 1 }}
                    className="h-full bg-[#1E5D57] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cost" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                  Out-of-Pocket Prescription Expenditure
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Brand name costs vs. verified generic equivalent formulations.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#134E48] bg-[#E6F4F1] px-3 py-1 rounded-full border border-[#D0EAE4]">
                42% Average Patient Savings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0] space-y-2">
                <span className="text-[#64748B] uppercase text-[10px] font-semibold">Brand Name Prescription</span>
                <span className="block text-2xl font-bold text-[#1E293B]">₹1,850 / mo</span>
                <p className="text-[11px] text-[#64748B]">Retail proprietary packaging and marketing premium.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#E6F4F1] border border-[#D0EAE4] space-y-2">
                <span className="text-[#134E48] uppercase text-[10px] font-semibold">Aether Generic Matching</span>
                <span className="block text-2xl font-bold text-[#134E48]">₹1,073 / mo</span>
                <p className="text-[11px] text-[#1E5D57]">Exact same active ingredient at transparent pharmacy pricing.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ocr" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                  Medical Report OCR & Metric Detection
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Lab report metric parsing and automatic out-of-range flag highlighting.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#134E48] bg-[#E6F4F1] px-3 py-1 rounded-full border border-[#D0EAE4]">
                Sub-Second Extraction
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
                <span className="block text-2xl font-bold text-[#1E293B]">99.2%</span>
                <span className="text-[11px] text-[#64748B]">OCR Accuracy</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
                <span className="block text-2xl font-bold text-[#1E5D57]">0.8s</span>
                <span className="text-[11px] text-[#64748B]">Parse Latency</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
                <span className="block text-2xl font-bold text-[#1E293B]">100%</span>
                <span className="text-[11px] text-[#64748B]">Flag Detection</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#E6F4F1] border border-[#D0EAE4]">
                <span className="block text-2xl font-bold text-[#134E48]">Plain Text</span>
                <span className="text-[11px] text-[#1E5D57]">Summaries</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
