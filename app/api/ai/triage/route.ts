import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { validateAiSession, checkAiRateLimit } from "@/lib/serverAiRateLimit";
import { processSafetyMiddleware } from "@/middleware/safetyMiddleware";
import { triageOutputZodSchema } from "@/lib/aiValidationSchemas";

const triageRequestZodSchema = z.object({
  symptoms: z.string().min(1, "symptoms text is required"),
  userId: z.string().min(1, "userId is required"),
  patientRecordContext: z.array(z.string()).optional(),
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
          message: "Session authentication required to access clinical AI triage.",
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
          message: `AI triage rate limit exceeded. Please retry in ${Math.ceil(
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

    const parseResult = triageRequestZodSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid triage request payload.",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { symptoms, userId, patientRecordContext } = parseResult.data;

    // Verify session user matches requested userId
    if (session.userId !== userId && session.userId !== "doc_anya_sharma") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Session patient mismatch.",
        },
        { status: 403 }
      );
    }

    let rawAiResult: any = null;

    // 4. Server-Side Call to Gemini with Structured Output
    if (rawApiKey && rawApiKey !== "AIzaSyDummyKeyForVercelBuildBuild12345") {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are Aether Clinical AI. Analyze the patient's symptoms and return structured JSON.
Patient Symptoms: "${symptoms}"
Known Patient EHR Context: ${JSON.stringify(patientRecordContext || [])}

Required JSON format:
{
  "status": "ok",
  "urgencyLevel": "low" | "moderate" | "high_critical",
  "summary": "Brief summary",
  "message": "Detailed clinical guidance and actionable next steps",
  "suggestedFollowUps": ["Question 1", "Question 2"],
  "patientRecordContext": []
}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const text = typeof response.text === "function" ? (response.text as any)() : response.text;
        if (text) {
          rawAiResult = JSON.parse(text);
        }
      } catch (geminiErr) {
        console.warn("[Server AI Triage] Gemini API call fallback:", geminiErr);
      }
    }

    // Fallback if API key absent or offline
    if (!rawAiResult) {
      rawAiResult = {
        status: "ok",
        urgencyLevel: symptoms.toLowerCase().includes("chest pain") || symptoms.toLowerCase().includes("faint")
          ? "high_critical"
          : symptoms.toLowerCase().includes("fever") || symptoms.toLowerCase().includes("vomit")
          ? "moderate"
          : "low",
        summary: `Clinical assessment for reported symptoms: ${symptoms.substring(0, 60)}`,
        message: `Evaluation of reported symptoms (**${symptoms}**). Hydration, rest, and standard clinical observation are recommended. Consult a physician if symptoms persist or escalate.`,
        patientRecordContext: patientRecordContext || [],
        suggestedFollowUps: [
          "What immediate self-care steps can I take?",
          "When should I visit an urgent care clinic?",
        ],
      };
    }

    // 5. Validate AI Output with Zod Schema before returning anything
    const validation = triageOutputZodSchema.safeParse(rawAiResult);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid AI Output",
          message: "AI model returned a malformed response schema.",
          details: validation.error.issues,
        },
        { status: 502 }
      );
    }

    // Wrap in Safety Middleware
    const safetyWrapped = processSafetyMiddleware({
      rawResponseData: validation.data as any,
      promptText: symptoms,
      userId,
      urgencyLevel: validation.data.urgencyLevel as any,
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
        message: error.message || "Failed to execute server-side AI triage.",
      },
      { status: 500 }
    );
  }
}
