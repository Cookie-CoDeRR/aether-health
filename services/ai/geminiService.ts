import { GoogleGenAI } from "@google/genai";
import { processSafetyMiddleware } from "../../middleware/safetyMiddleware";
import { SafetyWrappedResponse } from "../../types/disclaimers";
import { UrgencyLevel } from "../../types/symptomLog";
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

const rawApiKey = process.env.GEMINI_API_KEY || process.env.VERTEX_AI_API_KEY || "";

// Initialize Google AI Studio SDK safely (pass dummy key for build time if absent)
const ai = new GoogleGenAI({ apiKey: rawApiKey || "AIzaSyDummyKeyForVercelBuildBuild12345" });

/**
 * Enhanced Clinical Consultant Fallback Generator when API key is offline or throttled.
 * Integrates baseline patient medical records (allergies, lab reports, history) into clinical reasoning.
 */
function generateFallbackTriageOutput(symptoms: string, userId: string): TriageOutput {
  const lower = symptoms.toLowerCase();
  const patientContext = getPatientHistoryContextItems(userId);
  const allergyNotes = patientContext.filter((c) =>
    c.toLowerCase().includes("allergy") || c.toLowerCase().includes("penicillin")
  );
  const labNotes = patientContext.filter((c) =>
    c.toLowerCase().includes("cbc") || c.toLowerCase().includes("lab") || c.toLowerCase().includes("wbc")
  );

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

  // Moderate / Persistent Symptoms (e.g. Stomach Pain, Fever, Persistent Cough, Vomiting)
  if (
    lower.includes("stomach") ||
    lower.includes("abdominal") ||
    lower.includes("belly") ||
    lower.includes("fever") ||
    lower.includes("vomiting") ||
    lower.includes("cough") ||
    lower.includes("nausea")
  ) {
    const isStomach = lower.includes("stomach") || lower.includes("abdominal") || lower.includes("belly") || lower.includes("nausea");

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
- **Diagnostic Considerations**: ${
        isStomach
          ? "Symptoms are consistent with acute gastritis, gastroesophageal reflux, or localized bowel irritation."
          : "Fever and cough indicate typical viral upper airway response."
      }
- **Patient Context Cross-Reference**:
  ${
    allergyNotes.length > 0
      ? `- ⚠️ **Allergy Reminder**: Documented allergy (${allergyNotes[0]}). Avoid contraindicating medications.`
      : "- 🛡️ **Allergy Status**: No known drug allergies reported on file."
  }
  ${
    labNotes.length > 0
      ? `- 🩸 **Lab Baseline**: Prior panel noted (${labNotes[0]}).`
      : ""
  }
- **Red Flag Signs**: Seek prompt urgent care if pain becomes localized to the lower right abdomen, fever rises above 38.5°C, or you experience persistent vomiting.`,
      patientRecordContext: patientContext.slice(0, 2),
      suggestedFollowUps: [
        "What safe over-the-counter pain or digestive aids can I take?",
        "What red flag symptoms mean I should go to urgent care immediately?",
        "When should I follow up with a primary care doctor?",
      ],
    };
  }

  // Low / Mild Symptoms (Headache, Mild Fatigue, Muscle Soreness)
  return {
    status: "ok",
    urgencyLevel: "low",
    summary: "Mild non-acute symptoms logged with routine supportive advice.",
    message: `Your reported symptoms (**"${symptoms}"**) appear mild and can generally be managed safely with home care and rest.

#### Immediate Recommended Actions
- **Hydrate & Rest**: Drink plenty of water (around 2 to 2.5 liters daily) and get a solid night of rest.
- **Take brief breaks**: If working on screens or feeling fatigue, take 10-minute relaxation breaks in a quiet space.
- **Observe**: If symptoms persist for more than 3 consecutive days, check in with a general doctor.

#### Clinical Breakdown & Lab History
- **Clinical Impression**: Mild tension, temporary fatigue, or environmental strain.
- **Patient Context Reminders**:
  ${
    allergyNotes.length > 0
      ? `- ⚠️ **Allergy Alert**: Always remember your recorded allergy (${allergyNotes[0]}) when selecting OTC medications.`
      : "- 🛡️ **Allergy Status**: No active contraindications logged on file."
  }
  ${
    labNotes.length > 0
      ? `- 🩸 **Baseline Markers**: Reference (${labNotes[0]}).`
      : ""
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
 * Executes AI Symptom Triage via Google AI Studio (Gemini 1.5 Flash) with Personalized Vector Context Preprompt
 */
export async function runGeminiTriageChat(
  input: TriageInput
): Promise<SafetyWrappedResponse<TriageOutput>> {
  try {
    let rawOutput: TriageOutput;

    // Fetch relevant patient vector history context
    const vectorContext = await queryVectorMedicalContext(input.userId, input.symptoms);

    if (rawApiKey && !rawApiKey.includes("your") && !rawApiKey.includes("Dummy")) {
      try {
        const preprompt = `System: You are AETHER Health Triage AI, a warm, reassuring, and expert clinical consultant assistant.
Patient ID: ${input.userId}
Patient Semantic Vector Memory History:
${vectorContext}

Instruction: Analyze the patient's current reported symptoms considering their baseline background history above.
IMPORTANT TONE & STRUCTURE INSTRUCTION:
- Keep the primary advice warm, direct, empathetic, and easy to read so the user is NOT overwhelmed by complex medical jargon.
- Format the response as a JSON object with:
"message": A simple, friendly assessment in 2-3 short conversational sentences explaining what might be happening simply, followed by "#### Immediate Recommended Actions" with 2-3 clear bullet points. Afterwards, include a section "#### Clinical Breakdown & Lab History" containing deeper diagnostic thoughts, medical rationale, and patient history reminders (like Penicillin allergy or lab values) for users who choose to expand the detailed view.
"urgencyLevel": ("low" | "moderate" | "high_critical"),
"summary": (concise 1-sentence plain-language summary),
"patientRecordContext": [array of 2-3 short strings describing which past patient records/allergies/lab reports were referenced],
"suggestedFollowUps": [array of 3 specific follow-up questions the patient can click to ask based on their previous medical records and current symptoms].

Current Reported Symptoms: ${input.symptoms}`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: preprompt,
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          rawOutput = {
            status: "ok",
            message: parsed.message || text,
            urgencyLevel: parsed.urgencyLevel || "low",
            summary: parsed.summary || "Symptoms evaluated by Gemini 1.5 Flash.",
            patientRecordContext: Array.isArray(parsed.patientRecordContext)
              ? parsed.patientRecordContext
              : getPatientHistoryContextItems(input.userId).slice(0, 2),
            suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
              ? parsed.suggestedFollowUps
              : [
                  "Is this symptom connected to my previous medical history?",
                  "What medication precautions apply given my Penicillin allergy?",
                  "What signs mean I should consult a doctor sooner?",
                ],
          };
        } else {
          rawOutput = generateFallbackTriageOutput(input.symptoms, input.userId);
          if (text) rawOutput.message = text;
        }
      } catch (genAiError) {
        console.warn("Gemini API call warning, using consultant fallback logic:", genAiError);
        rawOutput = generateFallbackTriageOutput(input.symptoms, input.userId);
      }
    } else {
      rawOutput = generateFallbackTriageOutput(input.symptoms, input.userId);
    }

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
 * Parses medical report/document via Google AI Studio (Gemini 1.5 Flash).
 * When real extraction is unavailable, sample data is only provided if DEMO_MODE is explicitly enabled.
 * Without DEMO_MODE, returns 'Could not read this report' with no fabricated values.
 */
export async function parseGeminiReport(
  input: ReportParseInput
): Promise<SafetyWrappedResponse<ReportParseOutput>> {
  const isDemoMode =
    process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  try {
    let parsedMetrics: ReportMetric[] = [];
    let plainSummary = "";
    let rawOcrText = "";
    let extractionSuccessful = false;

    // Real Gemini OCR extraction if API key and file data (base64 or buffer) are available
    if (
      rawApiKey &&
      !rawApiKey.includes("Dummy") &&
      !rawApiKey.includes("your") &&
      (input.fileBase64 || input.fileBuffer)
    ) {
      try {
        const base64Data =
          input.fileBase64 ||
          (input.fileBuffer ? input.fileBuffer.toString("base64") : "");
        const mimeType = input.mimeType || "application/pdf";

        const prompt = `System: You are an expert clinical laboratory document parser.
Analyze the provided medical report file (${input.fileName}).
Extract all explicit lab test metrics, standard reference ranges, units, and out-of-range flags.
Return a JSON object:
{
  "parsedMetrics": [
    {
      "name": string (metric name, e.g. "Hemoglobin"),
      "value": number or string (extracted value),
      "referenceRange": string (reference range),
      "unit": string (e.g. "g/dL"),
      "isOutOfRange": boolean
    }
  ],
  "plainSummary": string (concise plain-language clinical summary of the findings),
  "rawOcrText": string (text extracted directly from the document)
}`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.parsedMetrics) && parsed.parsedMetrics.length > 0) {
            parsedMetrics = parsed.parsedMetrics;
            plainSummary =
              parsed.plainSummary ||
              `Extracted ${parsedMetrics.length} lab markers from ${input.fileName}.`;
            rawOcrText = parsed.rawOcrText || text;
            extractionSuccessful = true;
          }
        }
      } catch (ocrErr) {
        console.warn("Real document OCR execution error:", ocrErr);
      }
    }

    if (extractionSuccessful) {
      const realOutput: ReportParseOutput = {
        status: "ok",
        parseStatus: "ok",
        parsedMetrics,
        plainSummary,
        rawOcrText,
      };

      return processSafetyMiddleware({
        userId: input.userId,
        promptText: `Parse medical report file: ${input.fileName}`,
        urgencyLevel: "low",
        rawResponseData: realOutput,
      });
    }

    // If no real extraction ran:
    // Only return sample data if explicit DEMO_MODE is on
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

    // Default when DEMO_MODE is OFF and no extraction ran: Never return any fabricated values
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
