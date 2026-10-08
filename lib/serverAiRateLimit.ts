import { NextRequest } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_STORE = new Map<string, RateLimitBucket>();

// Default rate limit: 30 AI requests per 60 seconds per user/IP
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

export function checkAiRateLimit(identifier: string): { allowed: boolean; remaining: number; resetInMs: number } {
  if (!identifier) {
    identifier = "anonymous";
  }

  const now = Date.now();
  const bucket = RATE_LIMIT_STORE.get(identifier);

  if (!bucket || now > bucket.resetAt) {
    RATE_LIMIT_STORE.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInMs: WINDOW_MS };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - bucket.count,
    resetInMs: Math.max(0, bucket.resetAt - now),
  };
}

export function clearRateLimitStore() {
  RATE_LIMIT_STORE.clear();
}

export const resetAiRateLimitForTesting = clearRateLimitStore;

/**
 * Validates authenticated session from request headers.
 */
export function validateAiSession(req: NextRequest | Request): { authenticated: boolean; userId: string | null } {
  let userId: string | null = null;

  if ("headers" in req && typeof req.headers.get === "function") {
    userId =
      req.headers.get("x-user-id") ||
      req.headers.get("x-patient-id") ||
      req.headers.get("x-session-user-id");

    if (!userId) {
      const auth = req.headers.get("authorization");
      if (auth && auth.startsWith("Bearer ") && auth.length > 7) {
        userId = auth.substring(7).trim();
      }
    }
  }

  if (!userId || userId.trim().length === 0) {
    return { authenticated: false, userId: null };
  }

  return { authenticated: true, userId: userId.trim() };
}
