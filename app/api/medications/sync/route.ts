import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateApiAuth,
  getIdempotencyRecord,
  saveIdempotencyRecord,
} from "@/lib/serverApiAuth";
import { prisma } from "@/lib/db";
import { addAssignedMedication } from "@/services/domain/medicationScheduleService";

const medicationItemSchema = z.object({
  brandName: z.string().min(1, "brandName is required and cannot be empty"),
  genericName: z.string().optional(),
  dosage: z.string().min(1, "dosage is required and cannot be empty"),
  frequency: z.string().min(1, "frequency is required and cannot be empty"),
  totalDoses: z.number().int().positive("totalDoses must be positive").optional(),
  dosesRemaining: z.number().int().nonnegative().optional(),
  instructions: z.string().optional(),
});

const medicationSyncPayloadSchema = z.object({
  hospitalName: z.string().min(1, "hospitalName is required and cannot be empty"),
  patientId: z.string().min(1, "patientId is required and cannot be empty"),
  idempotencyKey: z.string().optional(),
  medications: z
    .array(medicationItemSchema)
    .min(1, "medications array must contain at least 1 valid medication item"),
});

/**
 * POST /api/medications/sync
 * Endpoint for hospital EHR systems to sync assigned patient medications.
 */
export async function POST(req: NextRequest | Request) {
  try {
    // 1. Scoped Authentication Check
    const authResult = validateApiAuth(req, "medications");
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error || "Unauthorized",
          message: authResult.message || "Invalid or missing Medication API Key.",
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

    const validationResult = medicationSyncPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues || (validationResult.error as any).errors || [];
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Validation failed for medication sync payload.",
          details: issues.map((err: any) => ({
            path: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { hospitalName, patientId, medications, idempotencyKey: bodyIdempotencyKey } =
      validationResult.data;

    // 3. Idempotency Handling
    const idempotencyKey =
      ("headers" in req && typeof req.headers.get === "function"
        ? req.headers.get("x-idempotency-key")
        : null) || bodyIdempotencyKey;

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

    // 4. Persistence to Database / Domain Layer
    let isPersisted = false;
    const syncedMedications = medications.map((med, index) => ({
      id: `hosp_sync_${Date.now()}_${index}`,
      userId: patientId,
      brandName: med.brandName,
      genericName: med.genericName || med.brandName,
      dosage: med.dosage,
      frequency: med.frequency,
      totalDoses: med.totalDoses || 10,
      dosesRemaining: med.dosesRemaining ?? (med.totalDoses || 10),
      dosesTakenToday: 0,
      assignedByHospital: hospitalName,
      instructions: med.instructions || med.frequency,
      syncedAt: new Date().toISOString(),
    }));

    // Ingest into domain medication schedule
    try {
      for (const med of syncedMedications) {
        addAssignedMedication({
          userId: patientId,
          brandName: med.brandName,
          genericName: med.genericName,
          dosage: med.dosage,
          scheduleTime: "09:00 AM",
          instruction: med.instructions,
        });
      }
      isPersisted = true;
    } catch (domainErr) {
      console.warn("[Medication Sync] Domain schedule ingestion issue:", domainErr);
    }

    // Also persist to Prisma if database persistence is explicitly configured
    if (process.env.PERSIST_TO_DATABASE === "true" && process.env.DATABASE_URL) {
      try {
        for (const med of syncedMedications) {
          await prisma.patientPrescription.create({
            data: {
              userId: patientId,
              brandName: med.brandName,
              genericName: med.genericName,
              dosage: med.dosage,
              frequency: med.frequency,
              totalDoses: med.totalDoses,
              dosesRemaining: med.dosesRemaining,
              hospitalName: med.assignedByHospital,
            },
          });
        }
      } catch (dbErr) {
        console.warn("[Medication Sync] Prisma persistence fallback:", dbErr);
      }
    }

    const responsePayload = {
      status: isPersisted ? "synchronized" : "not_persisted",
      persisted: isPersisted,
      message: isPersisted
        ? `Successfully synchronized ${syncedMedications.length} assigned prescription(s) from ${hospitalName}.`
        : `Validated ${syncedMedications.length} prescription(s), but persistence was not completed.`,
      syncedCount: syncedMedications.length,
      patientId,
      syncedMedications,
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
        message: error.message || "Failed to process medication sync.",
      },
      { status: 500 }
    );
  }
}
