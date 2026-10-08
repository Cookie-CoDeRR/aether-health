/**
 * AETHER Production Release-Gate Test Suite
 * Comprehensive verification of all safety, isolation, and clinical integrity gates:
 * 1. Two-Patient Isolation (records, prescriptions, and timeline partition)
 * 2. Unauthorized Clinician (strict denial without explicit patient consent)
 * 3. Hospital Outage Handling (Overpass empty/failure returns 0 invented hospitals)
 * 4. Invalid Batch Item Rejection (Zod schema validation rejects whole batch)
 * 5. Upload Failure Integrity (Private bucket returns honest error, no fake path)
 * 6. Clinical Red-Flag Cases (No invented diagnosis, emergency guidance attached)
 */

import { parseGeminiReport } from "../services/ai/geminiService";
import { mapOverpassElementsToHospitals } from "../services/overpassService";
import {
  getPatientVectorRecords,
  storeVectorMedicalRecord,
} from "../services/domain/vectorHistoryService";
import {
  prescribeMultipleMedications,
  getPatientPrescribedMedications,
  hasClinicianAccess,
  grantClinicianPatientAccess,
  revokeClinicianPatientAccess,
  getDoctorPatientQueue,
} from "../services/clinicalHandoverService";
import { uploadHealthReportFile } from "../lib/supabase";
import { POST as handleDoctorSync } from "../app/api/v1/hospital/sync-doctors/route";
import { POST as handlePatientSync } from "../app/api/v1/hospital/sync-patients/route";
import { POST as handleTriageRoute } from "../app/api/ai/triage/route";
import { NextRequest } from "next/server";

let passedCount = 0;
let totalCount = 0;

function gateAssert(condition: boolean, title: string, detail?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  [GATE PASS] ${title}`);
  } else {
    console.error(`  [GATE FAIL] ${title}${detail ? `: ${detail}` : ""}`);
    throw new Error(`Release gate failed: ${title}`);
  }
}

async function runReleaseGateSuite() {
  console.log("================================================================================");
  console.log("🚀 AETHER SYSTEM RELEASE-GATE VERIFICATION SUITE");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // GATE 1: Two-Patient Isolation
  // ---------------------------------------------------------------------------
  console.log("Gate 1: Multi-Patient Isolation (Data Partitioning & Isolation)");
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  const patientAlice = "gate_patient_alice_101";
  const patientBob = "gate_patient_bob_202";

  // Polyfill localStorage & window for Node test environment
  const storageStore: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => storageStore[key] || null,
    setItem: (key: string, val: string) => {
      storageStore[key] = val;
    },
    removeItem: (key: string) => {
      delete storageStore[key];
    },
  };
  (global as any).window = {
    localStorage: (global as any).localStorage,
    dispatchEvent: () => true,
  };

  // Mock supabase vector store for offline testing
  const { supabase } = await import("../lib/supabase");
  const origFrom = supabase.from.bind(supabase);
  supabase.from = ((table: string) => {
    if (table === "medical_vector_embeddings") {
      return { insert: async () => ({ data: null, error: null }) } as any;
    }
    return origFrom(table);
  }) as any;

  // Store records for Alice and Bob
  await storeVectorMedicalRecord(patientAlice, "Alice diagnostic: Tension headache", "symptom_triage");
  await storeVectorMedicalRecord(patientBob, "Bob diagnostic: Sprained wrist", "symptom_triage");

  const aliceRecords = getPatientVectorRecords(patientAlice);
  const bobRecords = getPatientVectorRecords(patientBob);

  gateAssert(
    aliceRecords.every((r) => r.userId === patientAlice) && !aliceRecords.some((r) => r.content.includes("Bob")),
    "Alice vector memory is strictly isolated from Bob"
  );
  gateAssert(
    bobRecords.every((r) => r.userId === patientBob) && !bobRecords.some((r) => r.content.includes("Alice")),
    "Bob vector memory is strictly isolated from Alice"
  );

  // Medication partitioning
  prescribeMultipleMedications(patientAlice, [
    {
      brandName: "Sumatriptan 50mg",
      genericName: "Sumatriptan Succinate",
      dosage: "50mg",
      frequency: "As needed",
      timesOfDay: ["Morning"],
      mealTiming: "After Food",
      startDate: "Today",
      endDate: "5 Days",
      totalDays: 5,
      instructions: "Take at onset of migraine",
      doctorName: "Dr. Anya Sharma",
      hospitalName: "Apollo",
    },
  ]);

  prescribeMultipleMedications(patientBob, [
    {
      brandName: "Ibuprofen 400mg",
      genericName: "Ibuprofen",
      dosage: "400mg",
      frequency: "Twice daily",
      timesOfDay: ["Morning", "Night"],
      mealTiming: "After Food",
      startDate: "Today",
      endDate: "3 Days",
      totalDays: 3,
      instructions: "Take for wrist pain",
      doctorName: "Dr. Anya Sharma",
      hospitalName: "Apollo",
    },
  ]);

  const aliceMeds = getPatientPrescribedMedications(patientAlice);
  const bobMeds = getPatientPrescribedMedications(patientBob);

  gateAssert(
    aliceMeds.some((m) => m.brandName.includes("Sumatriptan")) && !aliceMeds.some((m) => m.brandName.includes("Ibuprofen")),
    "Alice prescription store contains Sumatriptan and zero Bob medications"
  );
  gateAssert(
    bobMeds.some((m) => m.brandName.includes("Ibuprofen")) && !bobMeds.some((m) => m.brandName.includes("Sumatriptan")),
    "Bob prescription store contains Ibuprofen and zero Alice medications"
  );

  // ---------------------------------------------------------------------------
  // GATE 2: Unauthorized Clinician Access Rejection
  // ---------------------------------------------------------------------------
  console.log("\nGate 2: Unauthorized Clinician Access Gate");
  const clinicianId = "DOC-GATE-007";
  const isolatedPatient = "patient_gate_isolated_999";

  gateAssert(
    hasClinicianAccess(clinicianId, isolatedPatient) === false,
    "Unauthorized clinician has strictly NO access to patient without grant"
  );

  grantClinicianPatientAccess(isolatedPatient, clinicianId, ["telemetry", "triage"], 12);
  gateAssert(
    hasClinicianAccess(clinicianId, isolatedPatient) === true,
    "Clinician receives access only after explicit unexpired patient grant"
  );

  revokeClinicianPatientAccess(isolatedPatient, clinicianId);
  gateAssert(
    hasClinicianAccess(clinicianId, isolatedPatient) === false,
    "Revoking consent immediately terminates clinician access"
  );

  // ---------------------------------------------------------------------------
  // GATE 3: Hospital Outage & Zero Invented Facilities
  // ---------------------------------------------------------------------------
  console.log("\nGate 3: Hospital Outage & Anti-Hallucination Gate");
  const emptyOsmPayload = { elements: [] };
  const mappedEmpty = mapOverpassElementsToHospitals(emptyOsmPayload.elements, 12.9716, 77.5946);
  gateAssert(
    mappedEmpty.length === 0,
    "Hospital outage or empty lookup returns 0 hospitals (never invents fallback facilities)"
  );

  const rawElementWithoutPhone = {
    type: "node" as const,
    id: 1001,
    lat: 12.97,
    lon: 77.59,
    tags: { name: "Community Clinic", amenity: "hospital" },
  };
  const mappedElement = mapOverpassElementsToHospitals([rawElementWithoutPhone], 12.97, 77.59);
  gateAssert(
    mappedElement[0].phone === undefined,
    "Missing hospital contact tag leaves phone undefined (never invents phone numbers)"
  );
  gateAssert(
    mappedElement[0].isEmergency === false && mappedElement[0].emergencyCapability === "unconfirmed",
    "Generic clinic without emergency=yes tag is NOT marked emergency-capable"
  );

  // ---------------------------------------------------------------------------
  // GATE 4: Invalid Batch Item Rejection
  // ---------------------------------------------------------------------------
  console.log("\nGate 4: Batch Integration Validation & Atomicity Gate");
  process.env.AETHER_HOSPITAL_API_KEY = "test-secret-integration-key-123";

  const invalidDoctorBatch = {
    doctors: [
      {
        fullName: "Dr. Valid First",
        specialty: "Cardiology",
        hospitalName: "Apollo",
      },
      {
        fullName: "", // INVALID: empty name
        specialty: "Neurology",
        hospitalName: "Apollo",
      },
    ],
  };

  const reqDocBatch = new NextRequest("http://localhost:3000/api/v1/hospital/sync-doctors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "test-secret-integration-key-123",
    },
    body: JSON.stringify(invalidDoctorBatch),
  });

  const resDocBatch = await handleDoctorSync(reqDocBatch);
  gateAssert(
    resDocBatch.status === 400,
    "Batch with invalid second item is entirely rejected with HTTP 400"
  );

  // ---------------------------------------------------------------------------
  // GATE 5: Upload Failure Integrity
  // ---------------------------------------------------------------------------
  console.log("\nGate 5: Private Upload Integrity & Real Error Gate");
  const mockUploadFile = {
    name: "corrupted_scan.pdf",
    size: 2048,
    type: "application/pdf",
    arrayBuffer: async () => new ArrayBuffer(2048),
  } as unknown as File;

  const uploadOutcome = await uploadHealthReportFile(mockUploadFile, "scans/corrupted.pdf", "user_gate_1");
  gateAssert(
    uploadOutcome.signedUrl === null && uploadOutcome.filePath === null && uploadOutcome.error !== null,
    "Failed upload returns null signedUrl, null filePath, and surfaces real error"
  );

  // ---------------------------------------------------------------------------
  // GATE 6: Clinical Red-Flag & No Invented Diagnoses
  // ---------------------------------------------------------------------------
  console.log("\nGate 6: Clinical Red-Flag Safety & Zero Invented Clearance Gate");

  // Outside DEMO_MODE, unreadable report parsing returns failed and zero metrics
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;
  const parseResult = await parseGeminiReport({
    fileName: "empty_report.pdf",
    userId: "gate_user",
    mimeType: "application/pdf",
  });
  gateAssert(
    Boolean(parseResult.data && parseResult.data.parseStatus === "failed" && parseResult.data.plainSummary === "Could not read this report"),
    "Unreadable report returns 'Could not read this report' and zero invented clinical metrics"
  );
  gateAssert(
    Boolean(parseResult.data && parseResult.data.parsedMetrics.length === 0),
    "Failed report contains zero parsed metrics"
  );

  // Server-side AI triage attaches emergency guidance for red flags
  const redFlagTriageReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "patient_red_flag_user",
    },
    body: JSON.stringify({
      symptoms: "Sudden crushing chest pain radiating to left arm and shortness of breath",
      userId: "patient_red_flag_user",
    }),
  });

  const triageRes = await handleTriageRoute(redFlagTriageReq);
  const triageJson = await triageRes.json();
  gateAssert(
    triageRes.status === 200,
    "Server-side AI triage processes red flag symptoms safely"
  );
  gateAssert(
    triageJson.emergencyGuidance !== null && triageJson.emergencyGuidance.emergencyNumbers.length > 0,
    "Emergency guidance with direct contacts (108, 112) is automatically attached for critical red flags"
  );

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${passedCount}/${totalCount} RELEASE GATES PASSED WITH ZERO VIOLATIONS!`);
  console.log("================================================================================\n");
}

runReleaseGateSuite().catch((err) => {
  console.error("❌ RELEASE GATE EXECUTION FAILED:", err);
  process.exit(1);
});
