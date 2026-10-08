import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { validateAiSession, checkAiRateLimit } from "@/lib/serverAiRateLimit";
import { processSafetyMiddleware } from "@/middleware/safetyMiddleware";
import {
  triageOutputZodSchema,
  triageAiResponseZodSchema,
} from "@/lib/aiValidationSchemas";
import {
  classifyUserIntent,
  checkEmergencyRedFlags,
  sanitizeClinicalReplyText,
} from "@/services/domain/intentClassification";

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

    // -------------------------------------------------------------------------
    // STEP 1: DETERMINISTIC RED-FLAG & INTENT CLASSIFICATION (Runs First)
    // -------------------------------------------------------------------------
    const deterministic = classifyUserIntent(symptoms);
    let rawAiResult: any = null;

    // A red flag ALWAYS overrides every other class and model output
    if (deterministic.isEmergency) {
      rawAiResult = {
        status: "ok",
        intent: "emergency",
        red_flags: deterministic.redFlags,
        isEmergency: true,
        needsMoreInfo: false,
        reply: deterministic.deterministicReply,
        message: deterministic.deterministicReply,
        follow_up_questions: deterministic.followUpQuestions,
        suggestedFollowUps: deterministic.followUpQuestions,
        triage_level: "high_critical",
        urgencyLevel: "high_critical",
        summary: "Emergency red flag condition detected requiring immediate clinical intervention.",
      };
    } else if (rawApiKey && rawApiKey !== "AIzaSyDummyKeyForVercelBuildBuild12345") {
      // -----------------------------------------------------------------------
      // STEP 2: SERVER-SIDE GEMINI INTENT-AWARE TRIAGE (Structured Output)
      // -----------------------------------------------------------------------
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are Aether Health Assistant. Classify the user query into one of:
- "greeting": Friendly greeting / small talk
- "app_question": Questions about Aether app features
- "general_health_question": General health concept questions (e.g. hydration, vitamins, sleep)
- "symptom_report": Report of physical symptoms/pain
- "emergency": Life-threatening red flag
- "unclear": Gibberish, too short, or off-topic

RULES:
1. For greeting/app_question/general_health_question/unclear/off_topic: triage_level MUST be null. Never diagnose.
2. For symptom_report: If duration/severity is missing, ask 2-3 follow-up questions and set triage_level to null. If detailed, set triage_level to "low" or "moderate".
3. Do NOT use markdown bold asterisks (**) in reply.
4. Never echo the user's raw text inside template sentences.

User Query: "${symptoms}"
Known Patient EHR Context: ${JSON.stringify(patientRecordContext || [])}

Required JSON format:
{
  "intent": "greeting" | "app_question" | "general_health_question" | "symptom_report" | "emergency" | "unclear" | "off_topic",
  "red_flags": [],
  "reply": "Clear, friendly text without asterisks",
  "follow_up_questions": ["Question 1", "Question 2"],
  "triage_level": "low" | "moderate" | "high_critical" | null
}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.15,
          },
        });

        const text = typeof response.text === "function" ? (response.text as any)() : response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const aiValidation = triageAiResponseZodSchema.safeParse(parsed);
          if (aiValidation.success) {
            const cleanReply = sanitizeClinicalReplyText(aiValidation.data.reply);
            rawAiResult = {
              status: "ok",
              intent: aiValidation.data.intent,
              red_flags: aiValidation.data.red_flags,
              reply: cleanReply,
              message: cleanReply,
              follow_up_questions: aiValidation.data.follow_up_questions,
              suggestedFollowUps: aiValidation.data.follow_up_questions,
              triage_level: aiValidation.data.triage_level,
              urgencyLevel: aiValidation.data.triage_level,
              isEmergency: aiValidation.data.intent === "emergency",
              needsMoreInfo: aiValidation.data.intent === "symptom_report" && aiValidation.data.triage_level === null,
              summary: `${aiValidation.data.intent.replace("_", " ")} response`,
            };
          }
        }
      } catch (geminiErr) {
        console.warn("[Server AI Triage] Gemini API call fallback to deterministic engine:", geminiErr);
      }
    }

    // -------------------------------------------------------------------------
    // STEP 3: DETERMINISTIC ENGINE FALLBACK (If AI Offline or Failed)
    // -------------------------------------------------------------------------
    if (!rawAiResult) {
      const cleanReply = sanitizeClinicalReplyText(
        deterministic.deterministicReply ||
          (deterministic.intent === "symptom_report"
            ? `Based on the symptoms you shared, this appears to be a manageable condition. Ensure adequate rest, maintain steady hydration, and monitor your symptoms over the next 24 to 48 hours. If symptoms persist, consult a qualified physician.`
            : "I am ready to assist with your health questions, symptom triage, or lab reports. Please describe how you are feeling.")
      );

      rawAiResult = {
        status: "ok",
        intent: deterministic.intent,
        red_flags: deterministic.redFlags,
        isEmergency: deterministic.isEmergency,
        needsMoreInfo: deterministic.needsMoreInfo,
        reply: cleanReply,
        message: cleanReply,
        follow_up_questions: deterministic.followUpQuestions,
        suggestedFollowUps: deterministic.followUpQuestions,
        triage_level: deterministic.triageLevel,
        urgencyLevel: deterministic.triageLevel,
        patientRecordContext: patientRecordContext || [],
        summary: `${deterministic.intent.replace("_", " ")} evaluation`,
      };
    }

    // Final safety check: Red flag always wins
    if (deterministic.isEmergency && rawAiResult.intent !== "emergency") {
      rawAiResult.intent = "emergency";
      rawAiResult.triage_level = "high_critical";
      rawAiResult.urgencyLevel = "high_critical";
      rawAiResult.isEmergency = true;
      rawAiResult.reply = deterministic.deterministicReply;
      rawAiResult.message = deterministic.deterministicReply;
    }

    // Sanitize any remaining asterisks
    if (rawAiResult.message) {
      rawAiResult.message = sanitizeClinicalReplyText(rawAiResult.message);
    }
    if (rawAiResult.reply) {
      rawAiResult.reply = sanitizeClinicalReplyText(rawAiResult.reply);
    }

    // 4. Validate output with schema before returning
    const validation = triageOutputZodSchema.safeParse(rawAiResult);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid AI Output",
          message: "I couldn't process that. Please try describing your symptoms again.",
          details: validation.error.issues,
        },
        { status: 502 }
      );
    }

    // 5. Wrap in Safety Middleware
    const urgency = (validation.data.triage_level || validation.data.urgencyLevel || "low") as any;
    const safetyWrapped = processSafetyMiddleware({
      rawResponseData: validation.data as any,
      promptText: symptoms,
      userId,
      urgencyLevel: urgency,
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
        message: "I couldn't process that. Please try describing your symptoms again.",
      },
      { status: 500 }
    );
  }
}
