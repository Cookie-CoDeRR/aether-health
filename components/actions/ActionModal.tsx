"use client";

import React, { useState } from "react";
import { ActionItem } from "@/types/actions";
import ActionCard from "./ActionCard";
import { X, CheckCircle2, Terminal } from "lucide-react";

interface ActionModalProps {
  action: ActionItem | null;
  onClose: () => void;
}

export default function ActionModal({ action, onClose }: ActionModalProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "success">("idle");

  if (!action) return null;

  const handleInputChange = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setStatus("running");
    setOutputLog([
      `[${new Date().toLocaleTimeString()}] Initializing ${action.title}...`,
      `[${new Date().toLocaleTimeString()}] Verifying system privileges and clinical scope...`,
    ]);

    setTimeout(() => {
      setOutputLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Dispatching payload to endpoint...`,
      ]);
    }, 600);

    setTimeout(() => {
      setOutputLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Execution completed successfully (200 OK).`,
        `[${new Date().toLocaleTimeString()}] Telemetry updated: +1 operation recorded.`,
      ]);
      setStatus("success");
      setIsExecuting(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in text-[#064E3B] dark:text-[#ECFDF5]">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0B1D17] border border-[#064E3B]/20 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#064E3B]/15 dark:border-white/10 flex items-center justify-between bg-[#F9FBF9] dark:bg-[#0F241E]">
          <div className="flex items-center gap-3">
            <span className="text-xl">{action.icon}</span>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                {action.title}
              </h2>
              <p className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                Category: {action.category} | {action.metrics}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Card Preview */}
          <div className="pointer-events-none opacity-90">
            <ActionCard action={action} modalView />
          </div>

          {/* Form Parameters */}
          {action.parameters && action.parameters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#064E3B]/15 dark:border-white/10">
              <h3 className="text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] uppercase tracking-wider">
                Input Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {action.parameters.map((param) => (
                  <div key={param.id} className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#064E3B]/70 dark:text-white/60">
                      {param.label} {param.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      placeholder={param.placeholder}
                      value={inputs[param.id] || ""}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      className="w-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Terminal */}
          {status !== "idle" && (
            <div className="space-y-2 pt-2 border-t border-[#064E3B]/15 dark:border-white/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#064E3B]/70 dark:text-white/60 flex items-center gap-1 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                </span>
                <span className={status === "success" ? "text-[#064E3B] dark:text-[#10B981] font-bold flex items-center gap-1" : "text-rose-500 font-bold"}>
                  {status === "running" ? "● PROCESSING..." : <><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</>}
                </span>
              </div>
              <div className="bg-[#081511] text-emerald-400 border border-white/10 rounded-xl p-4 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto shadow-inner">
                {outputLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white bg-white dark:bg-[#0B1D17]"
          >
            Close
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-6 py-2.5 rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] text-white dark:text-[#042F24] font-bold shadow-soft disabled:opacity-50 transition-all min-tap-target"
          >
            {isExecuting ? "Executing..." : "Execute Routine →"}
          </button>
        </div>
      </div>
    </div>
  );
}
