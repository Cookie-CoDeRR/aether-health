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

function isDemoModeActive(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  );
}

/**
 * Enhanced Clinical Consultant Fallback Generator when API key is offline or throttled.
 * Integrates baseline patient medical records (allergies, lab reports, history) into clinical reasoning.
 */
function generateFallbackTriageOutput(symptoms: string, userId: string): TriageOutput {
  const lower = symptoms.toLowerCase();
  const patientContext = getPatientHistoryContextItems(userId);

  // High / Critical Emergency Trigger
  if (
    lower.includes("chest pain") ||
    lower.includes("shortness of breath") ||
    lower.includes("fainting") ||
    lower.includes("severe bleeding") ||
    lower.includes("numbness on one side")
  ) {
    return {
      status: "ok",
      urgencyLevel: "high_critical",
      summary: "High-critical symptoms identified: acute emergency protocols indicated.",
      message: `Your reported symptoms (**${symptoms}**) could indicate a serious cardiovascular or respiratory emergency that needs **immediate medical attention**.

#### Immediate Recommended Actions
- **Do not drive yourself.** Call local emergency services (108 / 112 / 911) or have someone take you to the nearest Emergency Room right away.
- Sit upright in a comfortable position and take slow, calm breaths while awaiting emergency help.

#### Clinical Breakdown & Lab History
- **Primary Clinical Concern**: Sudden onset chest discomfort, breathing difficulties, or acute weakness require immediate evaluation to rule out acute cardiac or pulmonary events.
- **Cross-Referenced Patient Context**: ${
  patientContext.length > 0
    ? `Medical history reviewed (${patientContext[0]}). Urgent physician evaluation is strongly advised.`
    : "No prior records logged. Urgent physician evaluation is strongly advised."
}`,
      patientRecordContext: patientContext.slice(0, 2),
      suggestedFollowUps: [
        "Should I call emergency services (108/911) or go directly to the nearest ER?",
        "What position should I sit in while waiting for emergency assistance?",
        "Show nearby hospitals with 24/7 ICU & Emergency services",
      ],
    };
  }

  // Moderate / Persistent Symptoms
  if (
    lower.includes("stomach") ||
    lower.includes("abdominal") ||
    lower.includes("belly") ||
    lower.includes("fever") ||
    lower.includes("vomiting") ||
    lower.includes("cough") ||
    lower.includes("nausea")
  ) {
    const isStomach =
      lower.includes("stomach") ||
      lower.includes("abdominal") ||
      lower.includes("belly") ||
      lower.includes("nausea");

    return {
      status: "ok",
      urgencyLevel: "moderate",
      summary: isStomach
        ? "Moderate abdominal discomfort evaluated against patient baseline profile."
        : "Moderate systemic/respiratory symptoms logged requiring clinical evaluation.",
      message: `It sounds like you're experiencing uncomfortable **${symptoms}**. This is commonly related to ${
        isStomach
          ? "stomach irritation, indigestion, or a mild digestive upset."
          : "a common viral infection or upper respiratory inflammation."
      } While usually manageable, having a doctor examine you within the next 24 to 48 hours is recommended.

#### Immediate Recommended Actions
- **Stay well-hydrated**: Sip warm water, clear broths, or oral hydration fluids throughout the day.
- **Gentle diet**: Stick to light, non-greasy foods (bananas, rice, toast) and avoid caffeine or spicy items.
- **Rest**: Give your body adequate rest and monitor how your symptoms develop over the next 24 hours.

#### Clinical Breakdown & Lab History
- **Diagnostic Considerations**: Gastric inflammation or mild viral syndrome.
- **Cross-Referenced Patient Context**: ${
  patientContext.length > 0
    ? `Patient history reviewed (${patientContext[0]}).`
    : "No conflicting baseline records logged."
}`,
      patientRecordContext: patientContext.slice(0, 2),
      suggestedFollowUps: [
        "What dietary adjustments can help reduce these symptoms?",
        "What over-the-counter medications are safe for me?",
        "What red flags mean I should go to urgent care?",
      ],
    };
  }

  // Routine / Mild Symptoms
  return {
    status: "ok",
    urgencyLevel: "low",
    summary: `Routine symptom evaluation for: ${symptoms.substring(0, 50)}`,
    message: `Thank you for sharing your symptoms (**${symptoms}**). Based on what you've described, this appears to be a routine, mild concern that is often manageable with rest and home care.

#### Immediate Recommended Actions
- **Adequate Rest**: Ensure you get 7-8 hours of sleep and avoid strenuous activities.
- **Hydration**: Drink plenty of fluids throughout the day.
- **Observation**: Keep note of any changes in your symptoms over the next 48 to 72 hours.

#### Clinical Breakdown & Lab History
- **Cross-Referenced Patient Context**: ${
  patientContext.length > 0
    ? `Reviewed patient profile (${patientContext[0]}).`
    : "No prior records logged."
}`,
    patientRecordContext: patientContext.slice(0, 2),
    suggestedFollowUps: [
      "Could hydration or sleep quality be causing these symptoms?",
      "Which over-the-counter fever or pain relievers are safe for me?",
      "When should I follow up with a primary care doctor?",
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
      urgencyLevel: rawOutput.urgencyLevel,
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
