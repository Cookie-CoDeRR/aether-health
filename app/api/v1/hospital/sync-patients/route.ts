import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateApiAuth,
  getIdempotencyRecord,
  saveIdempotencyRecord,
} from "@/lib/serverApiAuth";
import { upsertPatientQueueRecord } from "@/services/clinicalHandoverService";

export interface HospitalPatientPayload {
  patientId: string;
  fullName: string;
  age?: number;
  gender?: string;
  medicalConditions?: string[];
  knownAllergies?: string[];
  assignedMedications?: {
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
  }[];
}

const assignedMedicationItemSchema = z.object({
  name: z.string().min(1, "Medication name is required and cannot be empty"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  instructions: z.string().optional(),
});

const patientItemSchema = z.object({
  patientId: z.string().min(1, "patientId is required and cannot be empty"),
  fullName: z.string().min(1, "fullName is required and cannot be empty"),
  age: z.number().int().positive("age must be a positive integer").optional(),
  gender: z.string().optional(),
  medicalConditions: z.array(z.string()).optional(),
  knownAllergies: z.array(z.string()).optional(),
  assignedMedications: z.array(assignedMedicationItemSchema).optional(),
});

/**
 * POST /api/v1/hospital/sync-patients
 * EHR Integration endpoint for external hospital software to bulk sync patient records.
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

    const normalizedBody = Array.isArray(body) ? { patients: body } : body;

    let rawPatientsList: any[];
    let payloadIdempotencyKey: string | undefined;

    if (normalizedBody && Array.isArray(normalizedBody.patients)) {
      rawPatientsList = normalizedBody.patients;
      payloadIdempotencyKey = normalizedBody.idempotencyKey;
    } else if (normalizedBody && typeof normalizedBody === "object" && !normalizedBody.patients) {
      rawPatientsList = [normalizedBody];
      payloadIdempotencyKey = normalizedBody.idempotencyKey;
    } else {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Payload must contain a non-empty 'patients' array or valid patient object.",
        },
        { status: 400 }
      );
    }

    // Validate entire array with Zod schema — every single item is validated
    const validationResult = z
      .array(patientItemSchema)
      .min(1, "Batch must contain at least one valid patient item")
      .safeParse(rawPatientsList);

    if (!validationResult.success) {
      const issues = validationResult.error.issues || (validationResult.error as any).errors || [];
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Validation failed for one or more items in the patient batch.",
          details: issues.map((err: any) => ({
            path: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedPatients = validationResult.data;

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

    // 4. Persistence to Clinical Handover Queue / EHR Layer
    let persistedCount = 0;
    const sanitizedPatients = validatedPatients.map((p) => {
      const saved = upsertPatientQueueRecord({
        patientId: p.patientId.trim(),
        name: p.fullName.trim(),
        age: p.age,
        gender: p.gender,
        allergies: p.knownAllergies || [],
        chronicConditions: p.medicalConditions || [],
        chiefComplaint: p.medicalConditions?.[0] || "Hospital EHR synced record",
      });
      persistedCount++;
      return {
        patientId: saved.patientId,
        fullName: saved.name,
        medicalConditions: saved.chronicConditions,
        knownAllergies: saved.allergies,
        assignedMedicationsCount: p.assignedMedications?.length || 0,
        updatedAt: new Date().toISOString(),
      };
    });

    const isPersisted = persistedCount > 0;

    const responsePayload = {
      status: isPersisted ? "synchronized" : "not_persisted",
      persisted: isPersisted,
      message: isPersisted
        ? `Successfully synchronized ${sanitizedPatients.length} patient record(s) into clinical layer.`
        : `Validated ${sanitizedPatients.length} patient records, but persistence was not completed.`,
      syncedCount: sanitizedPatients.length,
      patients: sanitizedPatients,
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
        message: error.message || "Failed to parse EHR patient payload.",
      },
      { status: 500 }
    );
  }
}
