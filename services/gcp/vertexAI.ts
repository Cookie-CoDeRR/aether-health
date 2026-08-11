import { runGeminiTriageChat, parseGeminiReport } from "../ai/geminiService";
import { TriageInput, ReportParseInput } from "@/types/ai";

/**
 * Re-export runTriageChat using Google AI Studio (Gemini 1.5 Flash) service.
 */
export async function runTriageChat(input: TriageInput) {
  return runGeminiTriageChat(input);
}

/**
 * Re-export parseReport using Google AI Studio (Gemini 1.5 Flash) service.
 */
export async function parseReport(input: ReportParseInput) {
  return parseGeminiReport(input);
}
