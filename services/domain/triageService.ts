import { runTriageChat } from "@/services/gcp/vertexAI";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { TriageInput, TriageOutput, SpecialtySuggestion } from "@/types/ai";

/**
 * Generates specialty suggestions based on symptom text context.
 * Rule: If top confidence score < 80% (0.80), returns at least 2 suggestions.
 */
export function suggestSpecialties(symptoms: string): SpecialtySuggestion[] {
  const lower = symptoms.toLowerCase();

  if (lower.includes("chest pain") || lower.includes("heart") || lower.includes("palpitations")) {
    // High confidence single specialty candidate
    return [
      {
        specialty: "Cardiology",
        confidenceScore: 0.88,
        reasoning: "Chest pain and heart-related symptoms strongly align with cardiovascular evaluation.",
      },
      {
        specialty: "Emergency Medicine",
        confidenceScore: 0.82,
        reasoning: "Acute thoracic pain warrants emergency clinical assessment.",
      },
    ];
  }

  if (lower.includes("fever") || lower.includes("cough") || lower.includes("throat") || lower.includes("breath")) {
    // Top confidence 75% (<80%) -> MUST return at least 2 suggestions
    return [
      {
        specialty: "Pulmonology",
        confidenceScore: 0.75,
        reasoning: "Respiratory symptoms such as cough or fever suggest pulmonary examination.",
      },
      {
        specialty: "General Internal Medicine",
        confidenceScore: 0.70,
        reasoning: "Systemic viral or bacterial infection symptoms warrant primary medical evaluation.",
      },
    ];
  }

  if (lower.includes("headache") || lower.includes("dizziness") || lower.includes("numbness") || lower.includes("migraine")) {
    // Top confidence 72% (<80%) -> MUST return at least 2 suggestions
    return [
      {
        specialty: "Neurology",
        confidenceScore: 0.72,
        reasoning: "Neurological complaints like persistent headaches or sensory changes.",
      },
      {
        specialty: "General Practice",
        confidenceScore: 0.65,
        reasoning: "Primary consultation to rule out tension, hydration, or vascular causes.",
      },
    ];
  }

  // General/Uncertain symptoms fallback -> Top confidence 65% (<80%) -> 2 suggestions
  return [
    {
      specialty: "General Practice / Family Medicine",
      confidenceScore: 0.68,
      reasoning: "Broad non-specific symptoms benefit from comprehensive primary care screening.",
    },
    {
      specialty: "Internal Medicine",
      confidenceScore: 0.60,
      reasoning: "General diagnostic evaluation for persistent or multi-system discomfort.",
    },
  ];
}

/**
 * Triage Domain Service: Gateway between UI components and Vertex AI GCP service layer.
 * Includes specialist routing suggestions.
 */
export async function sendTriageMessage(
  input: TriageInput
): Promise<SafetyWrappedResponse<TriageOutput>> {
  const result = await runTriageChat(input);

  if (result.data && result.data.status === "ok") {
    // Attach specialty suggestions generated from domain logic
    const suggestions = suggestSpecialties(input.symptoms);
    result.data.specialties = suggestions;
  }

  return result;
}
