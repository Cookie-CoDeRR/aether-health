import { parseReport } from "@/services/gcp/vertexAI";
import { SafetyWrappedResponse } from "@/types/disclaimers";
import { ReportParseInput, ReportParseOutput } from "@/types/ai";
import { ParseStatus } from "@/types/report";

/**
 * OCR Domain Service: Proxy for report parsing via Vertex AI.
 * Supports optional forceStatus override for UI demonstration of all 4 parseStatus states.
 */
export async function analyzeReport(
  input: ReportParseInput,
  forceStatus?: ParseStatus
): Promise<SafetyWrappedResponse<ReportParseOutput>> {
  const result = await parseReport(input);

  if (forceStatus && result.data) {
    result.data.parseStatus = forceStatus;

    if (forceStatus === "failed") {
      result.data.status = "failed";
      result.data.parsedMetrics = [];
      result.data.plainSummary = "Failed to parse document structure or extract text.";
    } else if (forceStatus === "low_confidence") {
      result.data.parseStatus = "low_confidence";
    }
  }

  return result;
}
