import crypto from "crypto";
import { UrgencyLevel } from "@/types/symptomLog";
import {
  STANDARD_DISCLAIMER,
  EMERGENCY_GUIDANCE,
  ProcessSafetyInput,
  SafetyWrappedResponse,
  SafetyLogPayload,
} from "@/types/disclaimers";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory rate limiting store: userId -> TokenBucket
const rateLimitStore = new Map<string, TokenBucket>();

const DEFAULT_CAPACITY = 20; // 20 requests
const REFILL_INTERVAL_MS = 60 * 1000; // 1 minute window

/**
 * Resets rate limit store (useful for testing or cache clearing)
 */
export function resetRateLimiter(): void {
  rateLimitStore.clear();
}

/**
 * Token bucket rate limiter check for a given userId
 */
function checkRateLimit(userId: string, capacity = DEFAULT_CAPACITY): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let bucket = rateLimitStore.get(userId);

  if (!bucket) {
    bucket = { tokens: capacity, lastRefill: now };
    rateLimitStore.set(userId, bucket);
  }

  // Refill tokens based on elapsed time
  const timePassed = now - bucket.lastRefill;
  if (timePassed >= REFILL_INTERVAL_MS) {
    bucket.tokens = capacity;
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const timeUntilRefill = REFILL_INTERVAL_MS - (now - bucket.lastRefill);
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil(timeUntilRefill / 1000),
  };
}

/**
 * Creates SHA-256 hash of prompt input to avoid logging raw PHI
 */
function hashPrompt(promptText: string): string {
  return crypto.createHash("sha256").update(promptText || "").digest("hex");
}

/**
 * Safety Middleware: Wraps AI responses with guardrails, disclaimers, rate limiting, and structured logging.
 */
export function processSafetyMiddleware<T>(
  input: ProcessSafetyInput<T>
): SafetyWrappedResponse<T> {
  const { userId, promptText, urgencyLevel, rawResponseData } = input;

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      status: 429,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "AI request rate limit exceeded (20 requests per minute). Please try again shortly.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
    };
  }

  // 2. Structured Logging (No raw PHI/prompt text)
  const logPayload: SafetyLogPayload = {
    timestamp: new Date().toISOString(),
    userId,
    promptHash: hashPrompt(promptText),
    urgencyLevel,
  };
  console.log(`[AETHER Safety Log] ${JSON.stringify(logPayload)}`);

  // 3. Attach Disclaimer & Emergency Guidance
  const emergencyGuidance = urgencyLevel === "high_critical" ? EMERGENCY_GUIDANCE : null;

  return {
    status: 200,
    data: rawResponseData,
    disclaimer: STANDARD_DISCLAIMER,
    emergencyGuidance,
  };
}
