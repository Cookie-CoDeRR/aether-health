import { processSafetyMiddleware } from "../../middleware/safetyMiddleware";
import { SafetyWrappedResponse } from "../../types/disclaimers";
import {
  TriageInput,
  TriageOutput,
  ReportParseInput,
  ReportParseOutput,
  ReportMetric,
} from "../../types/ai";
import {
  queryVectorMedicalContext,
  getPatientHistoryContextItems,
} from "../domain/vectorHistoryService";

import {
  classifyUserIntent,
  sanitizeClinicalReplyText,
} from "../domain/intentClassification";

function isDemoModeActive(): boolean {
  if (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  ) {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("aether_demo_mode") === "true";
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Enhanced Clinical Consultant Fallback Generator when API key is offline or throttled.
 * Integrates baseline patient medical records (allergies, lab reports, history) into clinical reasoning.
 */
function generateFallbackTriageOutput(symptoms: string, userId: string): TriageOutput {
  const deterministic = classifyUserIntent(symptoms);
  const patientContext = getPatientHistoryContextItems(userId);

  // 1. Emergency Red Flag Trigger
  if (deterministic.isEmergency) {
    const emergencyMsg = sanitizeClinicalReplyText(
      deterministic.deterministicReply ||
        "Urgent medical attention is recommended. Please contact national emergency services immediately (112 or 108 in India) or go to the nearest emergency department."
    );

    return {
      status: "ok",
      intent: "emergency",
      red_flags: deterministic.redFlags,
      urgencyLevel: "high_critical",
      triage_level: "high_critical",
      summary: "High-critical symptoms identified: acute emergency protocols indicated.",
      message: emergencyMsg,
      reply: emergencyMsg,
      patientRecordContext: patientContext.slice(0, 2),
      suggestedFollowUps: deterministic.followUpQuestions,
      follow_up_questions: deterministic.followUpQuestions,
    };
  }

  // 2. Non-symptom intents: greeting, app_question, general_health_question, unclear, off_topic
  if (deterministic.intent !== "symptom_report") {
    const replyText = sanitizeClinicalReplyText(deterministic.deterministicReply || "How can I help you today?");

    return {
      status: "ok",
      intent: deterministic.intent,
      red_flags: [],
      urgencyLevel: null,
      triage_level: null,
      summary: `${deterministic.intent.replace("_", " ")} response`,
      message: replyText,
      reply: replyText,
      patientRecordContext: [],
      suggestedFollowUps: deterministic.followUpQuestions,
      follow_up_questions: deterministic.followUpQuestions,
    };
  }

  // 3. Symptom report with missing details
  if (deterministic.needsMoreInfo) {
    const replyText = sanitizeClinicalReplyText(deterministic.deterministicReply || "Could you share how long you've had this symptom?");

    return {
      status: "ok",
      intent: "symptom_report",
      red_flags: [],
      urgencyLevel: null,
      triage_level: null,
      needsMoreInfo: true,
      summary: "Symptom clarification",
      message: replyText,
      reply: replyText,
      patientRecordContext: [],
      suggestedFollowUps: deterministic.followUpQuestions,
      follow_up_questions: deterministic.followUpQuestions,
    };
  }

  // 4. Detailed Symptom Report (Moderate / Routine)
  const lower = symptoms.toLowerCase();
  const isModerate =
    lower.includes("fever") ||
    lower.includes("vomit") ||
    lower.includes("stomach") ||
    lower.includes("severe") ||
    lower.includes("cramp");

  const message = isModerate
    ? `Based on the symptoms you reported, this appears to be a moderate condition that warrants medical evaluation within the next 24 to 48 hours if it does not improve. Stay hydrated, eat light foods, and rest.`
    : `Thank you for sharing your symptoms. Based on your description, this appears to be a routine, mild concern that is often manageable with rest, adequate hydration, and standard home observation. If symptoms worsen, consult a healthcare professional.`;

  return {
    status: "ok",
    intent: "symptom_report",
    red_flags: [],
    urgencyLevel: isModerate ? "moderate" : "low",
    triage_level: isModerate ? "moderate" : "low",
    summary: `Symptom evaluation for reported condition`,
    message: sanitizeClinicalReplyText(message),
    reply: sanitizeClinicalReplyText(message),
    patientRecordContext: patientContext.slice(0, 2),
    suggestedFollowUps: [
      "What home care steps can help relieve these symptoms?",
      "When should I follow up with a primary care doctor?",
      "Show nearby verified clinics and doctors",
    ],
  };
}

/**
 * Executes AI Symptom Triage via Server-Side API endpoint (/api/ai/triage)
 * Enforces server session authentication, rate limits, structured output, and zod validation.
 */
export async function runGeminiTriageChat(
  input: TriageInput
): Promise<SafetyWrappedResponse<TriageOutput>> {
  try {
    const patientContext = getPatientHistoryContextItems(input.userId);

    // Call server AI route when in browser environment
    if (typeof window !== "undefined") {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": input.userId,
        },
        body: JSON.stringify({
          symptoms: input.symptoms,
          userId: input.userId,
          patientRecordContext: patientContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    }

    // Direct server-side / SSR fallback
    const rawOutput = generateFallbackTriageOutput(input.symptoms, input.userId);
    return processSafetyMiddleware({
      userId: input.userId,
      promptText: input.symptoms,
      urgencyLevel: (rawOutput.urgencyLevel || "low") as any,
      rawResponseData: rawOutput,
    });
  } catch (err) {
    const fallbackOutput: TriageOutput = {
      status: "failed",
      message: "An unexpected error occurred while processing your triage request. Please try again.",
      urgencyLevel: "low",
      summary: "Triage request failed.",
      patientRecordContext: [],
      suggestedFollowUps: [],
    };

    return processSafetyMiddleware({
      userId: input.userId,
      promptText: input.symptoms,
      urgencyLevel: "low",
      rawResponseData: fallbackOutput,
    });
  }
}

/**
 * Parses medical report/document via Server-Side API endpoint (/api/ai/analyze-report)
 * When real extraction is unavailable, sample data is only provided if DEMO_MODE is explicitly enabled.
 * Without DEMO_MODE, returns 'Could not read this report' with no fabricated values.
 */
export async function parseGeminiReport(
  input: ReportParseInput
): Promise<SafetyWrappedResponse<ReportParseOutput>> {
  const isDemoMode = isDemoModeActive();

  try {
    // Call server AI route when in browser environment
    if (typeof window !== "undefined") {
      const res = await fetch("/api/ai/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": input.userId,
        },
        body: JSON.stringify({
          fileName: input.fileName,
          fileBase64: input.fileBase64,
          mimeType: input.mimeType,
          userId: input.userId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    }

    // SSR / direct fallback
    if (isDemoMode) {
      const sampleOutput: ReportParseOutput = {
        status: "ok",
        parseStatus: "ok",
        parsedMetrics: [
          { name: "Hemoglobin", value: 13.5, referenceRange: "12.0 - 15.5", unit: "g/dL", isOutOfRange: false },
          { name: "WBC Count", value: 11.2, referenceRange: "4.5 - 11.0", unit: "10^3/µL", isOutOfRange: true },
          { name: "Fasting Blood Sugar", value: 95, referenceRange: "70 - 99", unit: "mg/dL", isOutOfRange: false },
          { name: "Serum Creatinine", value: 0.9, referenceRange: "0.6 - 1.2", unit: "mg/dL", isOutOfRange: false },
        ],
        plainSummary: `[Sample data, not a real result] Demonstration CBC analysis for ${input.fileName}.`,
        rawOcrText: `[Sample data, not a real result - ${input.fileName}]\nHemoglobin: 13.5 g/dL (Normal: 12.0 - 15.5)\nWBC: 11.2 x10^3/uL (Normal: 4.5 - 11.0) *HIGH*\nFasting Glucose: 95 mg/dL\nCreatinine: 0.9 mg/dL`,
      };

      return processSafetyMiddleware({
        userId: input.userId,
        promptText: `Parse medical report file: ${input.fileName}`,
        urgencyLevel: "low",
        rawResponseData: sampleOutput,
      });
    }

    const unreadOutput: ReportParseOutput = {
      status: "failed",
      parseStatus: "failed",
      parsedMetrics: [],
      plainSummary: "Could not read this report",
      rawOcrText: "",
    };

    return processSafetyMiddleware({
      userId: input.userId,
      promptText: `Parse medical report file: ${input.fileName}`,
      urgencyLevel: "low",
      rawResponseData: unreadOutput,
    });
  } catch (err) {
    const errorOutput: ReportParseOutput = {
      status: "failed",
      parseStatus: "failed",
      parsedMetrics: [],
      plainSummary: "Could not read this report",
      rawOcrText: "",
    };

    return processSafetyMiddleware({
      userId: input.userId,
      promptText: `Parse medical report file: ${input.fileName}`,
      urgencyLevel: "low",
      rawResponseData: errorOutput,
    });
  }
}
