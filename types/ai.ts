import { UrgencyLevel } from "./symptomLog";
import { ParseStatus } from "./report";

export interface TriageChatMessage {
  role: "user" | "model";
  content: string;
}

export interface TriageInput {
  userId: string;
  symptoms: string;
  history?: TriageChatMessage[];
}

export interface SpecialtySuggestion {
  specialty: string;
  confidenceScore: number; // 0 to 1 (e.g. 0.85 = 85%)
  reasoning: string;
}

export interface TriageOutput {
  status: "ok" | "failed";
  intent?: "emergency" | "greeting" | "app_question" | "general_health_question" | "symptom_report" | "unclear" | "off_topic";
  message: string;
  reply?: string;
  urgencyLevel?: UrgencyLevel | null;
  triage_level?: "low" | "moderate" | "high_critical" | null;
  red_flags?: string[];
  isEmergency?: boolean;
  needsMoreInfo?: boolean;
  summary?: string;
  specialties?: SpecialtySuggestion[];
  patientRecordContext?: string[];
  suggestedFollowUps?: string[];
  follow_up_questions?: string[];
}

export interface ReportMetric {
  name: string;
  value: string | number;
  referenceRange: string;
  unit?: string;
  isOutOfRange: boolean;
}

export interface ReportParseInput {
  userId: string;
  fileName: string;
  fileBuffer?: Buffer;
  fileBase64?: string;
  mimeType?: string;
}

export interface ReportParseOutput {
  status: "ok" | "failed";
  parseStatus: ParseStatus;
  parsedMetrics: ReportMetric[];
  plainSummary: string;
  rawOcrText: string;
}
