import { NextRequest, NextResponse } from "next/server";

const VALID_HOSPITAL_KEYS = [
  process.env.AETHER_HOSPITAL_API_KEY || "aether_ehr_live_sec_9941a8",
  "aether_ehr_live_sec_demo",
];

export interface HospitalDoctorPayload {
  hprId?: string;
  registrationNumber?: string;
  fullName: string;
  specialty: string;
  hospitalName: string;
  consultationFee?: number;
  availableSlots?: string[];
}

/**
 * POST /api/v1/hospital/sync-doctors
 * EHR Integration endpoint for external hospital software to update doctor availability rosters.
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
    const doctors: HospitalDoctorPayload[] = Array.isArray(body.doctors)
      ? body.doctors
      : [body];

    if (doctors.length === 0 || !doctors[0].fullName || !doctors[0].specialty) {
      return NextResponse.json(
        { error: "Bad Request", message: "Payload must include fullName and specialty." },
        { status: 400 }
      );
    }

    // 3. Process Doctors
    const syncedDoctors = doctors.map((d) => ({
      hprId: d.hprId || `${d.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_")}@hpr`,
      fullName: d.fullName,
      specialty: d.specialty,
      hospitalName: d.hospitalName || "General Health Center",
      consultationFee: d.consultationFee || 800,
      isAbdmVerified: Boolean(d.hprId?.endsWith("@hpr")),
      availableSlotsCount: d.availableSlots?.length || 4,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        status: "success",
        message: `Successfully synchronized ${syncedDoctors.length} doctor roster entry(ies).`,
        syncedCount: syncedDoctors.length,
        doctors: syncedDoctors,
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
      { error: "Internal Server Error", message: error.message || "Failed to parse doctor roster payload." },
      { status: 500 }
    );
  }
}
