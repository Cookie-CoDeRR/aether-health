"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnalyticsSection() {
  const [activeTab, setActiveTab] = useState<"triage" | "cost" | "ocr">("triage");

  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 border-t border-[rgba(246,241,233,0.09)]">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E8674A] font-semibold">
          Data & Impact Analysis
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-medium text-[#F6F1E9]">
          Why Modern Healthcare Navigation Matters
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#7C8A93] font-sans leading-relaxed">
          Quantitative breakdown of critical bottlenecks in patient triage, emergency hospital discovery, and prescription cost transparency.
        </p>
      </div>

      {/* Analytics Tabs */}
      <div className="flex justify-center gap-2 font-mono text-xs max-w-md mx-auto p-1 bg-[#132A38] rounded-xl border border-[rgba(246,241,233,0.09)]">
        <button
          onClick={() => setActiveTab("triage")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === "triage"
              ? "bg-[#E8674A] text-[#0A1620] font-bold shadow-md"
              : "text-[#B9C4CC] hover:text-[#F6F1E9]"
          }`}
        >
          🚑 Emergency Delay
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === "cost"
              ? "bg-[#E8674A] text-[#0A1620] font-bold shadow-md"
              : "text-[#B9C4CC] hover:text-[#F6F1E9]"
          }`}
        >
          💊 Medicine Cost
        </button>
        <button
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === "ocr"
              ? "bg-[#E8674A] text-[#0A1620] font-bold shadow-md"
              : "text-[#B9C4CC] hover:text-[#F6F1E9]"
          }`}
        >
          📄 Lab OCR Speed
        </button>
      </div>

      {/* Graph Display Card */}
      <div className="rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 sm:p-10 shadow-2xl space-y-8">
        {activeTab === "triage" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(246,241,233,0.09)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#F6F1E9]">
                  Emergency Facility Finding & Triage Time
                </h3>
                <p className="text-xs text-[#7C8A93] mt-0.5">
                  Comparison between traditional search methods vs AETHER OSM Overpass live map routing.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#E8674A] bg-[#E8674A]/10 px-3 py-1 rounded-full border border-[#E8674A]/20">
                73% Faster Emergency Care
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[#B9C4CC] mb-1">
                  <span>Traditional Hospital Search & Calling</span>
                  <span className="text-[#E8674A] font-bold">45 - 60 mins</span>
                </div>
                <div className="h-4 w-full bg-[#132A38] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1 }}
                    className="h-full bg-[#E8674A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#B9C4CC] mb-1">
                  <span>AETHER Overpass GPS + On-Duty Doctor Roster</span>
                  <span className="text-[#00F0FF] font-bold">2 - 3 mins</span>
                </div>
                <div className="h-4 w-full bg-[#132A38] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12%" }}
                    transition={{ duration: 1 }}
                    className="h-full bg-[#00F0FF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cost" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(246,241,233,0.09)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#F6F1E9]">
                  Out-of-Pocket Prescription Expenditure
                </h3>
                <p className="text-xs text-[#7C8A93] mt-0.5">
                  Brand name prescription costs vs. AETHER active ingredient generic equivalents.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#4F9D8C] bg-[#4F9D8C]/10 px-3 py-1 rounded-full border border-[#4F9D8C]/20">
                42% Average Savings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#132A38] border border-[rgba(246,241,233,0.09)] space-y-2">
                <span className="text-[#7C8A93] uppercase text-[10px]">Brand Name Prescription</span>
                <span className="block text-2xl font-bold text-[#F6F1E9]">₹1,850 / mo</span>
                <p className="text-[11px] text-[#7C8A93]">Proprietary formulation pricing across retail pharmacies.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#132A38] border border-[#4F9D8C]/40 space-y-2">
                <span className="text-[#4F9D8C] uppercase text-[10px]">AETHER Generic Matching</span>
                <span className="block text-2xl font-bold text-[#4F9D8C]">₹1,073 / mo</span>
                <p className="text-[11px] text-[#B9C4CC]">Same active pharmaceutical ingredient at fraction of price.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ocr" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(246,241,233,0.09)] pb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#F6F1E9]">
                  Medical Report OCR & Metric Detection
                </h3>
                <p className="text-xs text-[#7C8A93] mt-0.5">
                  Lab report metric parsing and automatic out-of-range flag highlighting.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20">
                Sub-Second Extraction
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#132A38]">
                <span className="block text-xl font-bold text-[#F6F1E9]">99.2%</span>
                <span className="text-[10px] text-[#7C8A93] uppercase">OCR Precision</span>
              </div>
              <div className="p-4 rounded-xl bg-[#132A38]">
                <span className="block text-xl font-bold text-[#E8674A]">0.8s</span>
                <span className="text-[10px] text-[#7C8A93] uppercase">Parse Latency</span>
              </div>
              <div className="p-4 rounded-xl bg-[#132A38]">
                <span className="block text-xl font-bold text-[#00F0FF]">100%</span>
                <span className="text-[10px] text-[#7C8A93] uppercase">Flag Detection</span>
              </div>
              <div className="p-4 rounded-xl bg-[#132A38]">
                <span className="block text-xl font-bold text-[#4F9D8C]">Plain Text</span>
                <span className="text-[10px] text-[#7C8A93] uppercase">AI Summaries</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
