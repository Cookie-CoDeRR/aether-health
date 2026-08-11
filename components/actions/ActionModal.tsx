"use client";

import React, { useState } from "react";
import { ActionItem } from "@/types/actions";
import ActionCard from "./ActionCard";

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
      `[${new Date().toLocaleTimeString()}] Verifying system privileges and Gemini AI / OSM scope...`,
    ]);

    setTimeout(() => {
      setOutputLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Dispatching payload to endpoint...`,
      ]);
    }, 800);

    setTimeout(() => {
      setOutputLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Execution completed successfully (200 OK).`,
        `[${new Date().toLocaleTimeString()}] Telemetry updated: +1 operation recorded.`,
      ]);
      setStatus("success");
      setIsExecuting(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0F2130] border border-[rgba(246,241,233,0.16)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[rgba(246,241,233,0.09)] flex items-center justify-between bg-[#132A38]">
          <div className="flex items-center gap-3">
            <span className="text-xl">{action.icon}</span>
            <div>
              <h2 className="text-sm font-serif font-medium text-[#F6F1E9]">
                {action.title}
              </h2>
              <p className="text-[11px] font-mono text-[#7C8A93]">
                Category: {action.category} | Tier: {action.metrics}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7C8A93] hover:text-[#F6F1E9] hover:bg-[#0A1620] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Card Preview */}
          <div className="pointer-events-none opacity-90">
            <ActionCard action={action} modalView />
          </div>

          {/* Form Parameters */}
          {action.parameters && action.parameters.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <h3 className="text-xs font-mono font-semibold text-[#F6F1E9] uppercase tracking-wider">
                Input Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {action.parameters.map((param) => (
                  <div key={param.id} className="space-y-1">
                    <label className="block text-[11px] font-mono text-[#7C8A93]">
                      {param.label} {param.required && <span className="text-[#E8674A]">*</span>}
                    </label>
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      placeholder={param.placeholder}
                      value={inputs[param.id] || ""}
                      onChange={(e) => handleInputChange(param.id, e.target.value)}
                      className="w-full bg-[#132A38] border border-[rgba(246,241,233,0.16)] rounded-xl px-3.5 py-2.5 text-xs text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#E8674A] font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Terminal */}
          {status !== "idle" && (
            <div className="space-y-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7C8A93]">Execution Terminal Output</span>
                <span className={status === "success" ? "text-[#00F0FF] font-bold" : "text-[#E8674A]"}>
                  {status === "running" ? "● PROCESSING..." : "✓ COMPLETE"}
                </span>
              </div>
              <div className="bg-[#0A1620] border border-[rgba(246,241,233,0.09)] rounded-xl p-4 font-mono text-xs text-[#B9C4CC] space-y-1.5 max-h-40 overflow-y-auto">
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
        <div className="px-6 py-4 border-t border-[rgba(246,241,233,0.09)] bg-[#132A38] flex items-center justify-between font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[rgba(246,241,233,0.16)] text-[#B9C4CC] hover:text-[#F6F1E9]"
          >
            Close
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-6 py-2.5 rounded-xl bg-[#E8674A] text-[#0A1620] font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
          >
            {isExecuting ? "Executing..." : "Execute Now →"}
          </button>
        </div>
      </div>
    </div>
  );
}
