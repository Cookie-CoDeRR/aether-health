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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-[#1E293B]">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-[#E2E8F0] rounded-2xl shadow-elevated overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-3">
            <span className="text-xl">{action.icon}</span>
            <div>
              <h2 className="text-sm font-serif font-semibold text-[#1E293B]">
                {action.title}
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Category: {action.category} | {action.metrics}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors"
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
            <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
              <h3 className="text-xs font-semibold text-[#1E293B] uppercase tracking-wider">
                Input Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {action.parameters.map((param) => (
                  <div key={param.id} className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#64748B]">
                      {param.label} {param.required && <span className="text-[#C85339]">*</span>}
                    </label>
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      placeholder={param.placeholder}
                      value={inputs[param.id] || ""}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      className="w-full bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#1E5D57]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Terminal */}
          {status !== "idle" && (
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B] flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                </span>
                <span className={status === "success" ? "text-[#1E5D57] font-bold flex items-center gap-1" : "text-[#C85339]"}>
                  {status === "running" ? "● PROCESSING..." : <><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</>}
                </span>
              </div>
              <div className="bg-[#1E293B] text-emerald-300 rounded-xl p-4 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto shadow-inner">
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
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAF9] flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] bg-white"
          >
            Close
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-6 py-2.5 rounded-xl bg-[#1E5D57] hover:bg-[#134E48] text-white font-semibold shadow-soft disabled:opacity-50 transition-all min-tap-target"
          >
            {isExecuting ? "Executing..." : "Execute Routine →"}
          </button>
        </div>
      </div>
    </div>
  );
}
