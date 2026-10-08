import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { validateAiSession, checkAiRateLimit } from "@/lib/serverAiRateLimit";
import { processSafetyMiddleware } from "@/middleware/safetyMiddleware";
import { isDemoModeActive } from "@/services/authService";
import { reportParseOutputZodSchema } from "@/lib/aiValidationSchemas";

const reportParseRequestSchema = z.object({
  fileName: z.string().min(1),
  fileBase64: z.string().optional(),
  mimeType: z.string().optional(),
  userId: z.string().min(1),
  forcedStatus: z.enum(["ok", "low_confidence", "failed"]).optional(),
});

const rawApiKey = process.env.GEMINI_API_KEY || process.env.VERTEX_AI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: rawApiKey || "AIzaSyDummyKeyForVercelBuildBuild12345" });

export async function POST(req: NextRequest) {
  try {
    // 1. Session Check (Reject unauthenticated AI calls)
    const session = validateAiSession(req);
    if (!session.authenticated || !session.userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Session authentication required to analyze medical reports.",
        },
        { status: 401 }
      );
    }

    // 2. Rate Limit Check (Check BEFORE calling Gemini)
    const rateLimit = checkAiRateLimit(session.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `AI report analysis rate limit exceeded. Please retry in ${Math.ceil(
            rateLimit.resetInMs / 1000
          )} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetInMs / 1000)),
          },
        }
      );
    }

    // 3. Parse Request Payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const parseResult = reportParseRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid report analysis payload.",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { fileName, fileBase64, mimeType, userId, forcedStatus } = parseResult.data;

    let rawOutput: any = null;

    // If real file bytes and API key exist, invoke Gemini Vision / Document model
    if (fileBase64 && mimeType && rawApiKey && rawApiKey !== "AIzaSyDummyKeyForVercelBuildBuild12345") {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                data: fileBase64,
                mimeType,
              },
            },
            `Extract medical lab metrics from this report document and return structured JSON.
Required JSON format:
{
  "parseStatus": "ok" | "low_confidence" | "failed",
  "rawOcrText": "Extracted OCR text from document",
  "plainSummary": "Plain-language summary of findings",
  "parsedMetrics": [
    { "name": "Metric Name", "value": "13.5", "reference": "12-16", "status": "normal" | "high" | "low", "unit": "g/dL" }
  ]
}`,
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const text = typeof response.text === "function" ? (response.text as any)() : response.text;
        if (text) {
          rawOutput = JSON.parse(text);
        }
      } catch (ocrErr) {
        console.warn("[Server AI Report] Gemini extraction error:", ocrErr);
      }
    }

    // Fallback handling according to PR 1 rules
    if (!rawOutput) {
      const isDemo = isDemoModeActive();
      if (!isDemo || forcedStatus === "failed") {
        rawOutput = {
          parseStatus: "failed",
          rawOcrText: "",
          plainSummary: "Could not read this report",
          parsedMetrics: [],
        };
      } else {
        rawOutput = {
          parseStatus: forcedStatus || "ok",
          rawOcrText: "Sample data, not a real result: CBC panel normal metrics.",
          plainSummary: "Sample data, not a real result: Hemoglobin 13.5 g/dL (Normal).",
          parsedMetrics: [
            {
              name: "Hemoglobin",
              value: "13.5",
              reference: "12.0 - 15.5",
              status: "normal",
              unit: "g/dL",
            },
            {
              name: "WBC Count",
              value: "11.2",
              reference: "4.5 - 11.0",
              status: "high",
              unit: "x10^3/uL",
            },
          ],
        };
      }
    }

    // 4. Validate Structured Output with Zod
    const validation = reportParseOutputZodSchema.safeParse(rawOutput);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid AI Output",
          message: "Report parser returned an invalid schema.",
          details: validation.error.issues,
        },
        { status: 502 }
      );
    }

    const safetyWrapped = processSafetyMiddleware({
      rawResponseData: validation.data as any,
      promptText: `Report: ${fileName}`,
      userId,
      urgencyLevel: "low",
    });

    return NextResponse.json(safetyWrapped, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message || "Failed to execute server-side report analysis.",
      },
      { status: 500 }
    );
  }
}
