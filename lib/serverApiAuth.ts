import { NextRequest, NextResponse } from "next/server";

export function isDemoModeActive(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  );
}

export type ApiAuthScope = "hospital" | "medications";

interface AuthResult {
  authorized: boolean;
  status: number;
  error?: string;
  message?: string;
}

/**
 * Scoped API authentication validator for server routes.
 * Keys are loaded strictly from server environment variables.
 * Demo keys are accepted ONLY when DEMO_MODE is active.
 */
export function validateApiAuth(
  req: NextRequest | Request,
  scope: ApiAuthScope
): AuthResult {
  let headerKey: string | null = null;

  if ("headers" in req && typeof req.headers.get === "function") {
    headerKey =
      req.headers.get("x-hospital-api-key") ||
      req.headers.get("x-medication-api-key") ||
      req.headers.get("x-api-key");

    if (!headerKey) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        headerKey = authHeader.substring(7).trim();
      }
    }
  }

  if (!headerKey || headerKey.trim().length === 0) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized",
      message: `Missing required API key header (e.g. x-${scope}-api-key or Authorization Bearer).`,
    };
  }

  const cleanKey = headerKey.trim();
  const isDemo = isDemoModeActive();

  // Get scoped environment key
  const configuredEnvKey =
    scope === "hospital"
      ? process.env.AETHER_HOSPITAL_API_KEY
      : process.env.AETHER_MEDICATION_API_KEY || process.env.AETHER_HOSPITAL_API_KEY;

  // Check against server environment key
  if (configuredEnvKey && cleanKey === configuredEnvKey.trim()) {
    return { authorized: true, status: 200 };
  }

  // Check demo keys ONLY when DEMO_MODE is true
  if (isDemo) {
    const validDemoKeys =
      scope === "hospital"
        ? ["aether_ehr_live_sec_demo", "aether_demo_hospital_key"]
        : ["aether_med_sec_demo", "aether_ehr_live_sec_demo", "aether_demo_medication_key"];

    if (validDemoKeys.includes(cleanKey)) {
      return { authorized: true, status: 200 };
    }
  }

  return {
    authorized: false,
    status: 403,
    error: "Forbidden",
    message: isDemo
      ? "Invalid API key."
      : "Invalid API key or unauthorized scope. (Demo keys are not accepted outside DEMO_MODE).",
  };
}

// In-memory idempotency cache for duplicate request prevention
const IDEMPOTENCY_STORE = new Map<
  string,
  { status: number; body: any; createdAt: number }
>();

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getIdempotencyRecord(key: string) {
  if (!key) return null;
  const record = IDEMPOTENCY_STORE.get(key);
  if (!record) return null;
  if (Date.now() - record.createdAt > IDEMPOTENCY_TTL_MS) {
    IDEMPOTENCY_STORE.delete(key);
    return null;
  }
  return record;
}

export function saveIdempotencyRecord(key: string, status: number, body: any) {
  if (!key) return;
  IDEMPOTENCY_STORE.set(key, {
    status,
    body,
    createdAt: Date.now(),
  });
}

export function clearIdempotencyStore() {
  IDEMPOTENCY_STORE.clear();
}
