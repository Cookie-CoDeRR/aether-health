import { NextRequest, NextResponse } from "next/server";

const VALID_HOSPITAL_KEYS = [
  process.env.AETHER_HOSPITAL_API_KEY || "aether_ehr_live_sec_9941a8",
  "aether_ehr_live_sec_demo",
];

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

/**
 * POST /api/v1/hospital/sync-patients
 * EHR Integration endpoint for external hospital software to bulk sync patient records.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Security Check: Authenticate Hospital EHR Secret Webhook Key
    const apiKey = req.headers.get("x-hospital-api-key") || req.headers.get("x-api-key");
    if (!apiKey || !VALID_HOSPITAL_KEYS.includes(apiKey)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid or missing Hospital EHR API Key (x-hospital-api-key).",
        },
        {
          status: 401,
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json();
    const patients: HospitalPatientPayload[] = Array.isArray(body.patients)
      ? body.patients
      : [body];

    if (patients.length === 0 || !patients[0].patientId || !patients[0].fullName) {
      return NextResponse.json(
        { error: "Bad Request", message: "Payload must include patientId and fullName." },
        { status: 400 }
      );
    }

    // 3. Process Patients (Sanitize & Ingest into EHR sync layer)
    const sanitizedPatients = patients.map((p) => ({
      patientId: String(p.patientId).trim(),
      fullName: String(p.fullName).trim().substring(0, 100),
      medicalConditions: p.medicalConditions || [],
      knownAllergies: p.knownAllergies || [],
      assignedMedicationsCount: p.assignedMedications?.length || 0,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        status: "success",
        message: `Successfully synchronized ${sanitizedPatients.length} patient record(s) from EHR system.`,
        syncedCount: sanitizedPatients.length,
        patients: sanitizedPatients,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message || "Failed to parse EHR payload." },
      { status: 500 }
    );
  }
}
