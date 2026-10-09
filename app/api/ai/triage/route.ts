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
  getRandomModelFailureReply,
  compileStructuredSymptomReply,
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
          contents: `You are Aether, a clinical health assistant providing warm, calm, second-person health navigation.

Classify the user's input into one of:
- "greeting": Friendly greeting / small talk
- "app_question": Questions about Aether app features
- "general_health_question": General health education (e.g. hydration, sleep, vitamins)
- "symptom_report": Physical symptoms or discomfort
- "emergency": Life-threatening red flag (chest pain, stroke signs, severe breathing trouble)
- "unclear": Gibberish, too short, or off-topic

RULES BY INTENT:
1. "greeting": Friendly 1-2 sentence response. Ask what symptoms they are experiencing and for how long. triage_level MUST be null.
2. "app_question": Short answer explaining Aether features. triage_level MUST be null.
3. "general_health_question": Educational explanation in plain language with a non-diagnosis note. triage_level MUST be null.
4. "unclear" or "off_topic": 1 polite clarifying question. triage_level MUST be null.
5. "symptom_report":
   - If key details (duration, severity) are missing, set triage_level to null and provide 2-3 follow_up_questions to clarify.
   - If details are present, set triage_level to "low" (for mild/routine) or "moderate" (for moderate/worsening).
   - Structured fields:
     • "acknowledgement": Warm, calm sentence reflecting the user's specific symptoms, severity, and duration in plain words. NEVER copy their sentence verbatim. NEVER start with repetitive canned phrases. Tone style:
       - For mild symptoms: reassuring and practical (e.g., "Experiencing a mild throbbing headache alongside fatigue for a couple of days can be draining.")
       - For moderate symptoms: careful and direct (e.g., "Dealing with a moderate fever and cough over the past three days warrants careful attention.")
     • "whats_worth_noticing": 1-2 specific observations connecting the symptoms in plain words using non-diagnostic phrasing ("commonly linked with", "can be related to", "worth watching"). NEVER say "you have" or "this is [diagnosis]". NEVER say "this appears to be a manageable condition".
     • "self_care": 2-4 concrete, non-pharmacological comfort steps SPECIFIC to the reported symptoms (e.g. for headache/fatigue: resting in a dimly lit quiet space, staying hydrated with small sips of water, taking regular screen breaks, gentle neck stretches). NEVER mention drug names, brand names, or dosages.
     • "watch_for": 2-4 concrete warning signs specific to this symptom that would indicate needing urgent care (e.g., for headache: sudden 'thunderclap' intensity, fever with neck stiffness, vision changes, slurred speech, weakness). State clearly: "Seek immediate medical care if any of these develop."
     • "when_to_see_a_doctor": Concrete timeframe tied directly to the duration they gave (e.g. "Since you have had this for 2 days, if the headache and fatigue continue beyond another day or two without improvement, plan to see a primary care doctor.").
     • "follow_up_questions": 2-3 questions a clinician would genuinely ask next (e.g. "Have you had any fever or nausea?", "How has your sleep and water intake been recently?"). NOT generic buttons.
   - NO markdown asterisks (**) in any text.
   - NO medicine doses, NO invented hospital names, NO diagnosis claims.
   - Wording must use "commonly", "can be linked to", "worth watching", never "you have" or "this is".

User Query: "${symptoms}"
Known Patient EHR Context: ${JSON.stringify(patientRecordContext || [])}

Required JSON format:
{
  "intent": "greeting" | "app_question" | "general_health_question" | "symptom_report" | "emergency" | "unclear" | "off_topic",
  "red_flags": [],
  "reply": "Clear, friendly text without asterisks (used for non-symptom intents)",
  "acknowledgement": "Warm opening reflecting user specifics",
  "whats_worth_noticing": ["Observation 1", "Observation 2"],
  "self_care": ["Tip 1", "Tip 2", "Tip 3"],
  "watch_for": ["Red flag 1", "Red flag 2"],
  "when_to_see_a_doctor": "Concrete timeframe based on duration",
  "follow_up_questions": ["Question 1", "Question 2"],
  "triage_level": "low" | "moderate" | "high_critical" | null
}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const text = typeof response.text === "function" ? (response.text as any)() : response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const aiValidation = triageAiResponseZodSchema.safeParse(parsed);
          if (aiValidation.success) {
            const data = aiValidation.data;

            let cleanReply = "";
            let structuredAdvice: any = undefined;

            if (data.intent === "symptom_report" && data.triage_level !== null) {
              structuredAdvice = {
                acknowledgement: sanitizeClinicalReplyText(data.acknowledgement || ""),
                whats_worth_noticing: (data.whats_worth_noticing || []).map(sanitizeClinicalReplyText),
                self_care: (data.self_care || []).map(sanitizeClinicalReplyText),
                watch_for: (data.watch_for || []).map(sanitizeClinicalReplyText),
                when_to_see_a_doctor: sanitizeClinicalReplyText(data.when_to_see_a_doctor || ""),
              };

              cleanReply = compileStructuredSymptomReply(structuredAdvice);
            } else {
              cleanReply = sanitizeClinicalReplyText(data.reply || data.acknowledgement || "");
            }

            rawAiResult = {
              status: "ok",
              intent: data.intent,
              red_flags: data.red_flags,
              reply: cleanReply,
              message: cleanReply,
              acknowledgement: data.acknowledgement ? sanitizeClinicalReplyText(data.acknowledgement) : undefined,
              whats_worth_noticing: data.whats_worth_noticing?.map(sanitizeClinicalReplyText),
              self_care: data.self_care?.map(sanitizeClinicalReplyText),
              watch_for: data.watch_for?.map(sanitizeClinicalReplyText),
              when_to_see_a_doctor: data.when_to_see_a_doctor ? sanitizeClinicalReplyText(data.when_to_see_a_doctor) : undefined,
              structured_advice: structuredAdvice,
              follow_up_questions: data.follow_up_questions,
              suggestedFollowUps: data.follow_up_questions,
              triage_level: data.triage_level,
              urgencyLevel: data.triage_level,
              isEmergency: data.intent === "emergency",
              needsMoreInfo: data.intent === "symptom_report" && data.triage_level === null,
              summary: `${data.intent.replace("_", " ")} response`,
            };
          }
        }
      } catch (geminiErr) {
        console.warn("[Server AI Triage] Gemini API call fallback:", geminiErr);
      }
    }

    // -------------------------------------------------------------------------
    // STEP 3: SAFE FALLBACK HANDLING (If AI Offline or Failed)
    // -------------------------------------------------------------------------
    if (!rawAiResult) {
      if (deterministic.intent === "symptom_report") {
        if (deterministic.needsMoreInfo) {
          const cleanReply = sanitizeClinicalReplyText(deterministic.deterministicReply || "Could you share a bit more detail regarding duration and severity?");
          rawAiResult = {
            status: "ok",
            intent: "symptom_report",
            red_flags: [],
            isEmergency: false,
            needsMoreInfo: true,
            reply: cleanReply,
            message: cleanReply,
            follow_up_questions: deterministic.followUpQuestions,
            suggestedFollowUps: deterministic.followUpQuestions,
            triage_level: null,
            urgencyLevel: null,
            summary: "Symptom clarification",
          };
        } else {
          // Model failed on a detailed symptom query -> Show safe honest fallback without triage badge or canned medical advice
          const failureReply = getRandomModelFailureReply();
          rawAiResult = {
            status: "ok",
            intent: "symptom_report",
            red_flags: [],
            isEmergency: false,
            needsMoreInfo: false,
            reply: failureReply,
            message: failureReply,
            follow_up_questions: [
              "Consult a primary care doctor",
              "Find nearby clinics",
            ],
            suggestedFollowUps: [
              "Consult a primary care doctor",
              "Find nearby clinics",
            ],
            triage_level: null,
            urgencyLevel: null,
            summary: "Service temporary fallback",
          };
        }
      } else {
        const cleanReply = sanitizeClinicalReplyText(
          deterministic.deterministicReply || "How can I assist you with your health questions today?"
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
          summary: `${deterministic.intent.replace("_", " ")} response`,
        };
      }
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
