import { z } from "zod";

export const triageOutputZodSchema = z.object({
  status: z.enum(["ok", "low_confidence", "failed"]).optional().default("ok"),
  urgencyLevel: z.enum(["low", "moderate", "high_critical", "emergency"]),
  summary: z.string().optional(),
  message: z.string().min(1),
  specialties: z
    .array(
      z.object({
        name: z.string(),
        reason: z.string(),
        urgency: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  suggestedSpecialties: z
    .array(
      z.object({
        specialty: z.string(),
        matchScore: z.number().optional(),
        reason: z.string().optional(),
      })
    )
    .optional(),
  suggestedFollowUps: z.array(z.string()).optional().default([]),
  patientRecordContext: z.array(z.string()).optional().default([]),
});

export type ValidatedTriageOutput = z.infer<typeof triageOutputZodSchema>;

export const reportMetricZodSchema = z.object({
  name: z.string(),
  value: z.string().or(z.number()),
  reference: z.string().optional(),
  status: z.enum(["normal", "high", "low", "critical", "abnormal"]).optional(),
  unit: z.string().optional(),
});

export const reportParseOutputZodSchema = z
  .object({
    parseStatus: z.enum(["ok", "low_confidence", "failed"]).optional(),
    testName: z.string().optional(),
    rawOcrText: z.string().optional(),
    plainSummary: z.string().optional(),
    summary: z.string().optional(),
    parsedMetrics: z.array(reportMetricZodSchema).optional(),
    biomarkers: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          unit: z.string().optional(),
          referenceRange: z.string().optional(),
          status: z.enum(["normal", "low", "high", "abnormal", "critical"]).optional(),
        })
      )
      .optional(),
    abnormalFindings: z.array(z.string()).optional(),
    doctorClearance: z.null().optional(),
    clearanceState: z.enum(["normal", "review_required", "critical_abnormal"]).optional(),
    confidenceScore: z.number().min(0).max(1).optional(),
  })
  .refine((data) => data.plainSummary || data.summary, {
    message: "Either plainSummary or summary is required",
  });

export type ValidatedReportParseOutput = z.infer<typeof reportParseOutputZodSchema>;

export const sbarHandoverZodSchema = z.object({
  situation: z.string().min(1),
  background: z.string().min(1),
  assessment: z.string().min(1),
  recommendation: z.string().optional(),
  doctorRecommendations: z.array(z.string()).optional(),
  sensitiveDisclosures: z.array(z.string()).optional(),
  generatedAt: z.string().optional(),
  triageRisk: z.enum(["routine", "moderate", "high_critical"]).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
});

export type ValidatedSbarHandoverOutput = z.infer<typeof sbarHandoverZodSchema>;
