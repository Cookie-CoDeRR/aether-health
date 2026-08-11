import { UrgencyLevel } from "./symptomLog";

export const STANDARD_DISCLAIMER =
  "AETHER is an informational health navigation assistant and not a medical device. This information does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical conditions or symptoms.";

export const EMERGENCY_GUIDANCE = {
  title: "Urgent Medical Attention Recommended",
  message:
    "Based on the symptoms described, immediate medical evaluation may be required. Please contact emergency services (e.g., 911 or local emergency number) or proceed to the nearest emergency department immediately.",
  emergencyNumbers: ["108 (India Emergency)", "112 (National Emergency)", "911 (US/Canada)"],
};

export interface SafetyLogPayload {
  timestamp: string;
  userId: string;
  promptHash: string;
  urgencyLevel: UrgencyLevel;
}

export interface SafetyWrappedResponse<T> {
  status: 200 | 429;
  data?: T;
  disclaimer?: string;
  emergencyGuidance?: typeof EMERGENCY_GUIDANCE | null;
  error?: {
    code: string;
    message: string;
    retryAfterSeconds: number;
  };
}

export interface ProcessSafetyInput<T> {
  userId: string;
  promptText: string;
  urgencyLevel: UrgencyLevel;
  rawResponseData: T;
}
