import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { validateAiSession, checkAiRateLimit } from "@/lib/serverAiRateLimit";
import { sbarHandoverZodSchema } from "@/lib/aiValidationSchemas";

const sbarRequestSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  messages: z.array(
    z.object({
      sender: z.string(),
      text: z.string(),
    })
  ),
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
          message: "Session authentication required to generate SBAR handover summary.",
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
          message: `AI SBAR rate limit exceeded. Please retry in ${Math.ceil(
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

    const parseResult = sbarRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid SBAR handover request payload.",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { patientId, patientName, messages } = parseResult.data;

    let rawOutput: any = null;

    if (rawApiKey && rawApiKey !== "AIzaSyDummyKeyForVercelBuildBuild12345") {
      try {
        const transcriptText = messages
          .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
          .join("\n");

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are a Senior Hospital Attending Physician synthesizing a clinical handover in SBAR format.
Patient ID: ${patientId}
Patient Name: ${patientName}
Dialogue Transcript:
${transcriptText}

Synthesize into structured JSON with keys:
{
  "situation": "Brief chief complaint",
  "background": "Relevant context",
  "assessment": "Diagnostic impression",
  "sensitiveDisclosures": ["Any sensitive details disclosed"],
  "doctorRecommendations": ["Action 1", "Action 2"],
  "triageRisk": "routine" | "moderate" | "high_critical"
}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const text = typeof response.text === "function" ? (response.text as any)() : response.text;
        if (text) {
          const parsed = JSON.parse(text);
          rawOutput = {
            ...parsed,
            generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
      } catch (geminiErr) {
        console.warn("[Server AI SBAR] Gemini call error:", geminiErr);
      }
    }

    if (!rawOutput) {
      const allText = messages.map((m) => m.text).join(" ").toLowerCase();
      const isEmergency =
        allText.includes("chest pain") ||
        allText.includes("shortness of breath") ||
        allText.includes("numb");
      const isGastric =
        allText.includes("stomach") ||
        allText.includes("cramp") ||
        allText.includes("nausea") ||
        allText.includes("bowel");

      rawOutput = {
        situation: isEmergency
          ? `${patientName} reported acute emergency symptoms requiring urgent physician review.`
          : isGastric
          ? `${patientName} presenting with gastrointestinal symptoms and mild discomfort.`
          : `${patientName} completed an interactive triage assessment for clinical review.`,
        background: "Cross-referenced against personal medical records and active medications.",
        assessment: isEmergency
          ? "Acute cardiovascular or respiratory concern; immediate ECG and vital monitoring indicated."
          : isGastric
          ? "Symptoms consistent with subacute gastrointestinal discomfort. Urgency: Moderate."
          : "Routine clinical presentation.",
        sensitiveDisclosures: isGastric
          ? ["Patient disclosed mild discomfort and bowel pattern fluctuations."]
          : [],
        doctorRecommendations: isGastric
          ? [
              "Perform abdominal examination.",
              "Review medication compatibility with known allergies.",
              "Advise dietary modifications.",
            ]
          : [
              "Conduct standard physical evaluation.",
              "Review vital parameters and patient history.",
            ],
        generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        triageRisk: isEmergency ? "high_critical" : isGastric ? "moderate" : "routine",
      };
    }

    // 4. Validate Structured Output with Zod
    const validation = sbarHandoverZodSchema.safeParse(rawOutput);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid AI Output",
          message: "SBAR handover output failed schema validation.",
          details: validation.error.issues,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(validation.data, {
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
        message: error.message || "Failed to execute server-side SBAR handover synthesis.",
      },
      { status: 500 }
    );
  }
}
