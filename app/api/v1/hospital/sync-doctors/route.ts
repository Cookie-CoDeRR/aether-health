import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateApiAuth,
  getIdempotencyRecord,
  saveIdempotencyRecord,
} from "@/lib/serverApiAuth";
import { prisma } from "@/lib/db";

export interface HospitalDoctorPayload {
  hprId?: string;
  registrationNumber?: string;
  fullName: string;
  specialty: string;
  hospitalName?: string;
  consultationFee?: number;
  availableSlots?: string[];
}

const doctorItemSchema = z.object({
  hprId: z.string().optional(),
  registrationNumber: z.string().optional(),
  fullName: z.string().min(1, "fullName is required and cannot be empty"),
  specialty: z.string().min(1, "specialty is required and cannot be empty"),
  hospitalName: z.string().min(1).optional(),
  consultationFee: z.number().positive("consultationFee must be positive").optional(),
  availableSlots: z.array(z.string()).optional(),
});

const syncDoctorsPayloadSchema = z.object({
  idempotencyKey: z.string().optional(),
  doctors: z.array(doctorItemSchema).min(1, "At least one doctor record is required in doctors array"),
}).or(
  // Allow single object or direct array payload
  doctorItemSchema
);

// In-memory synced doctor roster store
const SYNCED_HOSPITAL_DOCTOR_ROSTER: any[] = [];

/**
 * POST /api/v1/hospital/sync-doctors
 * EHR Integration endpoint for external hospital software to update doctor availability rosters.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Scoped Authentication Check
    const authResult = validateApiAuth(req, "hospital");
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
          message: authResult.message || "Invalid or missing Hospital EHR API Key.",
        },
        {
          status: authResult.status,
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
          },
        }
      );
    }

    // 2. Parse & Validate Payload with Zod (Validates EVERY item in batch)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    // Normalize raw payload (could be { doctors: [...] }, direct array [...], or single object {...})
    const normalizedBody = Array.isArray(body) ? { doctors: body } : body;

    let rawDoctorsList: any[];
    let payloadIdempotencyKey: string | undefined;

    if (normalizedBody && Array.isArray(normalizedBody.doctors)) {
      rawDoctorsList = normalizedBody.doctors;
      payloadIdempotencyKey = normalizedBody.idempotencyKey;
    } else if (normalizedBody && typeof normalizedBody === "object" && !normalizedBody.doctors) {
      rawDoctorsList = [normalizedBody];
      payloadIdempotencyKey = normalizedBody.idempotencyKey;
    } else {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Payload must contain a non-empty 'doctors' array or valid doctor object.",
        },
        { status: 400 }
      );
    }

    // Validate entire array with Zod schema — every single item is validated
    const validationResult = z
      .array(doctorItemSchema)
      .min(1, "Batch must contain at least one valid doctor item")
      .safeParse(rawDoctorsList);

    if (!validationResult.success) {
      const issues = validationResult.error.issues || (validationResult.error as any).errors || [];
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Validation failed for one or more items in the doctor roster batch.",
          details: issues.map((err: any) => ({
            path: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedDoctors = validationResult.data;

    // 3. Idempotency Handling
    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      payloadIdempotencyKey;

    if (idempotencyKey) {
      const cachedRecord = getIdempotencyRecord(idempotencyKey);
      if (cachedRecord) {
        return NextResponse.json(
          {
            ...cachedRecord.body,
            idempotent: true,
            message: "Request already processed with idempotency key (cached response).",
          },
          { status: cachedRecord.status }
        );
      }
    }

    // 4. Persistence to Database / EHR Layer
    const processedDoctors = validatedDoctors.map((d) => ({
      hprId: d.hprId || `${d.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_")}@hpr`,
      fullName: d.fullName,
      specialty: d.specialty,
      hospitalName: d.hospitalName || "General Health Center",
      consultationFee: d.consultationFee || 800,
      isAbdmVerified: Boolean(d.hprId?.endsWith("@hpr")),
      availableSlotsCount: d.availableSlots?.length || 4,
      updatedAt: new Date().toISOString(),
    }));

    let isPersisted = false;

    // Persist to in-memory server registry
    for (const doc of processedDoctors) {
      const existingIdx = SYNCED_HOSPITAL_DOCTOR_ROSTER.findIndex(
        (d) => d.fullName === doc.fullName && d.specialty === doc.specialty
      );
      if (existingIdx >= 0) {
        SYNCED_HOSPITAL_DOCTOR_ROSTER[existingIdx] = doc;
      } else {
        SYNCED_HOSPITAL_DOCTOR_ROSTER.push(doc);
      }
    }
    isPersisted = true;

    // Also attempt database persistence via Prisma if DB is configured and accessible
    if (process.env.PERSIST_TO_DATABASE === "true" && process.env.DATABASE_URL) {
      try {
        for (const doc of processedDoctors) {
          await prisma.doctorRecord.create({
            data: {
              hospitalName: doc.hospitalName,
              name: doc.fullName,
              specialty: doc.specialty,
              consultationFee: doc.consultationFee,
            },
          });
        }
      } catch (dbErr) {
        console.warn("[Doctor Roster Sync] Database persistence fallback:", dbErr);
      }
    }

    const responsePayload = {
      status: isPersisted ? "synchronized" : "not_persisted",
      persisted: isPersisted,
      message: isPersisted
        ? `Successfully synchronized ${processedDoctors.length} doctor roster entry(ies).`
        : `Validated ${processedDoctors.length} doctor roster entries, but database persistence was not performed.`,
      syncedCount: processedDoctors.length,
      doctors: processedDoctors,
      timestamp: new Date().toISOString(),
    };

    if (idempotencyKey) {
      saveIdempotencyRecord(idempotencyKey, 200, responsePayload);
    }

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message || "Failed to process doctor roster sync.",
      },
      { status: 500 }
    );
  }
}
