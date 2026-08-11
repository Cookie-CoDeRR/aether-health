"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sendTriageMessage } from "@/services/domain/triageService";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { TriageOutput, SpecialtySuggestion } from "@/types/ai";
import { UrgencyLevel } from "@/types/symptomLog";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  urgencyLevel?: UrgencyLevel;
  disclaimer?: string;
  emergencyGuidance?: SafetyWrappedResponse<TriageOutput>["emergencyGuidance"];
  specialties?: SpecialtySuggestion[];
  acknowledged?: boolean;
}

const MOCK_PROMPTS = [
  { text: "Mild headache and tiredness, two days running", tag: "Low", urgency: "low" as UrgencyLevel },
  { text: "Fever, dry cough, and body aches since last night", tag: "Moderate", urgency: "moderate" as UrgencyLevel },
  { text: "Sudden chest pain radiating to my left arm", tag: "Critical", urgency: "high_critical" as UrgencyLevel },
];

export default function TriagePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUrgency, setCurrentUrgency] = useState<UrgencyLevel>("low");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tracePathRef = useRef<SVGPathElement>(null);

  // Smooth live heartbeat waveform animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let t = 0;

    const animateTrace = () => {
      t += 0.02;
      const bump = Math.sin(t) * 1.5;

      let yPeak1 = 18;
      let yPeak2 = 18;

      if (currentUrgency === "moderate") {
        yPeak1 = 8;
        yPeak2 = 28;
      } else if (currentUrgency === "high_critical") {
        yPeak1 = -2;
        yPeak2 = 38;
      }

      if (tracePathRef.current) {
        tracePathRef.current.setAttribute(
          "d",
          `M0,32 L40,${32 + bump * 0.3} L48,32 L54,${yPeak1 + bump} L60,32 L280,32`
        );
      }

      animationFrameId = requestAnimationFrame(animateTrace);
    };

    animateTrace();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentUrgency]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setErrorMessage(null);
    setInput("");

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendTriageMessage({
        userId: "demo-user-123",
        symptoms: queryText,
      });

      if (response.status === 429) {
        setErrorMessage(response.error?.message || "Rate limit exceeded. Please wait a moment.");
        setIsLoading(false);
        return;
      }

      if (response.data) {
        setCurrentUrgency(response.data.urgencyLevel);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          urgencyLevel: response.data.urgencyLevel,
          disclaimer: response.disclaimer,
          emergencyGuidance: response.emergencyGuidance,
          specialties: response.data.specialties,
          acknowledged: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setErrorMessage("Unable to connect to AI triage assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, acknowledged: true } : msg))
    );
  };

  return (
    <div className="flex flex-1 min-h-0 divide-x divide-[rgba(246,241,233,0.09)]">
      {/* ---------- CHAT COLUMN (Left) ---------- */}
      <section className="flex flex-1 flex-col min-h-0 min-w-0">
        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-full flex-col justify-center max-w-[640px] space-y-6">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#7C8A93] font-sans">
                Start a read
              </div>

              <h2 className="font-serif font-normal text-3xl sm:text-[38px] leading-[1.15] tracking-[-0.01em] text-[#F6F1E9] max-w-[480px]">
                What are you<br />
                <em className="not-italic italic text-[#E8674A]">feeling</em> right now?
              </h2>

              <p className="text-sm sm:text-[15px] text-[#B9C4CC] leading-relaxed max-w-[420px]">
                Describe it plainly — where, how long, how it started. AETHER asks follow-ups to narrow it down, then routes you to the right next step.
              </p>

              {/* Sample Prompt Chips */}
              <div className="flex flex-col gap-2 max-w-[460px] pt-2">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#7C8A93] mb-1 font-sans">
                  Common starting points
                </div>
                {MOCK_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[rgba(246,241,233,0.16)] bg-transparent p-3 sm:px-4 text-left text-[13.5px] text-[#B9C4CC] transition-all hover:border-[#E8674A] hover:bg-[#E8674A]/5 hover:text-[#F6F1E9] hover:translate-x-0.5"
                  >
                    <span>{chip.text}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-[#7C8A93] group-hover:text-[#E8674A] font-sans">
                      {chip.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Stream */
            <div className="space-y-6 max-w-[640px]">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#132A38] text-[#F6F1E9] border border-[rgba(246,241,233,0.16)]"
                          : "bg-[#0F2130] text-[#F6F1E9] border border-[rgba(246,241,233,0.09)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Urgency Tag */}
                      {msg.sender === "ai" && msg.urgencyLevel && (
                        <div className="mt-3 flex items-center justify-between border-t border-[rgba(246,241,233,0.09)] pt-2 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded uppercase font-semibold ${
                              msg.urgencyLevel === "high_critical"
                                ? "bg-[#D14343] text-white"
                                : msg.urgencyLevel === "moderate"
                                ? "bg-[#D9A441] text-[#0A1620]"
                                : "bg-[#4F9D8C] text-white"
                            }`}
                          >
                            Urgency: {msg.urgencyLevel.replace("_", " ")}
                          </span>
                          <span className="text-[#7C8A93]">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specialist Routing Section */}
                  {msg.sender === "ai" && msg.specialties && msg.specialties.length > 0 && (
                    <div className="max-w-[85%] rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-3 space-y-2 text-xs">
                      <div className="text-[#F6F1E9] font-medium">💡 You may want to consider consulting:</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {msg.specialties.map((spec, idx) => (
                          <div key={idx} className="rounded-lg border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-2.5 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#E8674A]">{spec.specialty}</span>
                              <span className="font-mono text-[10px] text-[#7C8A93]">{Math.round(spec.confidenceScore * 100)}%</span>
                            </div>
                            <p className="text-[11px] text-[#B9C4CC] leading-snug">{spec.reasoning}</p>
                            <Link href={`/doctors?specialty=${encodeURIComponent(spec.specialty)}`} className="inline-block text-[10px] font-semibold text-[#4F9D8C] hover:underline pt-1">
                              Find {spec.specialty} doctors →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* High Critical Emergency Alert */}
                  {msg.sender === "ai" && msg.urgencyLevel === "high_critical" && msg.emergencyGuidance && !msg.acknowledged && (
                    <div className="rounded-xl border border-[#D14343] bg-[#D14343]/15 p-4 space-y-2 text-xs text-[#F6F1E9]">
                      <div className="font-bold text-[#D14343] uppercase tracking-wider">⚠️ {msg.emergencyGuidance.title}</div>
                      <p className="leading-relaxed text-[#B9C4CC]">{msg.emergencyGuidance.message}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.emergencyGuidance.emergencyNumbers.map((num, idx) => (
                          <span key={idx} className="rounded bg-[#D14343] text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                            📞 {num}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleAcknowledge(msg.id)}
                          className="rounded-lg bg-[#D14343] hover:bg-[#D14343]/90 text-white font-bold px-4 py-1.5 text-xs transition-colors"
                        >
                          ✓ I Acknowledge & Understand
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer Footer */}
                  {msg.sender === "ai" && msg.disclaimer && (
                    <p className="text-[10px] text-[#7C8A93] italic px-1">ℹ️ {msg.disclaimer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-[#132A38] px-4 py-3 text-xs text-[#B9C4CC] animate-pulse flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#E8674A] animate-ping" />
                AETHER is processing your symptoms...
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-[#D14343] bg-[#D14343]/10 p-3 text-xs text-[#D14343] flex justify-between items-center">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold underline">Dismiss</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2.5 p-6 lg:px-9 lg:pb-7 border-t border-[rgba(246,241,233,0.09)] items-end"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms — fever, headache, stomach ache…"
            disabled={isLoading}
            className="flex-1 min-h-[48px] rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-4 py-3 text.sm text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#E8674A]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-[#E8674A] px-5 py-3 text.sm font-semibold text-[#0A1620] hover:brightness-108 active:scale-97 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>Send</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </section>

      {/* ---------- SIGNAL PANEL (Right - 320px) ---------- */}
      <aside className="hidden lg:flex w-[320px] shrink-0 flex-col bg-[#0F2130] p-7 gap-6">
        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.14em] text-[#7C8A93] font-sans">
          <span>Live Signal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D8C] shadow-[0_0_0_3px_rgba(79,157,140,0.2)]" />
        </div>

        {/* Urgency Trace Card */}
        <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 pt-5">
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#7C8A93] mb-3 font-sans">
            Urgency Trace
          </div>
          <svg className="w-full h-16 block" viewBox="0 0 280 64" preserveAspectRatio="none">
            <path
              ref={tracePathRef}
              className="fill-none stroke-[#4F9D8C] stroke-2 stroke-round stroke-linejoin-round"
              d="M0,32 L40,32 L48,32 L54,18 L60,32 L280,32"
            />
          </svg>
          <div className="flex justify-between text-[11px] text-[#7C8A93] mt-2 font-sans">
            <span>Status</span>
            <b className="font-mono text-[#4F9D8C] font-medium">
              {currentUrgency === "high_critical" ? "acute" : currentUrgency === "moderate" ? "elevated" : "steady"}
            </b>
          </div>
        </div>

        {/* Urgency Scale Bar Visualizer */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-[12.5px] text-[#B9C4CC]">
            <span className="w-16">Low</span>
            <div className="flex-1 h-1.5 rounded bg-[rgba(246,241,233,0.08)] overflow-hidden">
              <div className="h-full w-[22%] rounded bg-[#4F9D8C]" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[12.5px] text-[#B9C4CC]">
            <span className="w-16">Moderate</span>
            <div className="flex-1 h-1.5 rounded bg-[rgba(246,241,233,0.08)] overflow-hidden">
              <div className="h-full w-[55%] rounded bg-[#D9A441]" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[12.5px] text-[#B9C4CC]">
            <span className="w-16">Critical</span>
            <div className="flex-1 h-1.5 rounded bg-[rgba(246,241,233,0.08)] overflow-hidden">
              <div className="h-full w-[88%] rounded bg-[#D14343]" />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-auto border-t border-[rgba(246,241,233,0.09)] pt-4 text-[11.5px] text-[#7C8A93] leading-relaxed">
          <strong className="font-medium text-[#B9C4CC]">Not a diagnosis.</strong> AETHER is an informational navigation tool. In an emergency, contact local emergency services directly rather than waiting on this chat.
        </div>
      </aside>
    </div>
  );
}
