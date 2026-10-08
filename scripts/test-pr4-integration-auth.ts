import { NextRequest } from "next/server";
import { POST as syncDoctorsHandler } from "../app/api/v1/hospital/sync-doctors/route";
import { POST as syncPatientsHandler } from "../app/api/v1/hospital/sync-patients/route";
import { POST as syncMedicationsHandler } from "../app/api/medications/sync/route";
import { clearIdempotencyStore } from "../lib/serverApiAuth";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

function createMockRequest(
  url: string,
  body: any,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function runPR4IntegrationAuthTests() {
  console.log("\n==================================================================");
  console.log("🧪 RUNNING PR 4 ACCEPTANCE TESTS: CLOSE INTEGRATION AUTH GAPS");
  console.log("==================================================================\n");

  clearIdempotencyStore();

  const validDoctorBatch = [
    {
      fullName: "Dr. Maya Patil",
      specialty: "Neurology",
      hospitalName: "Apollo Hospital",
      consultationFee: 900,
    },
    {
      fullName: "Dr. Rajiv Sen",
      specialty: "Cardiology",
      hospitalName: "Apollo Hospital",
      consultationFee: 1200,
    },
  ];

  const invalidDoctorBatch = [
    {
      fullName: "Dr. Maya Patil",
      specialty: "Neurology",
      hospitalName: "Apollo Hospital",
    },
    {
      fullName: "", // INVALID: Empty name
      specialty: "Cardiology",
    },
  ];

  const validPatientBatch = [
    {
      patientId: "AETH-SYNC-001",
      fullName: "Kavita Rao",
      age: 42,
      medicalConditions: ["Type 2 Diabetes"],
      knownAllergies: ["Penicillin"],
    },
    {
      patientId: "AETH-SYNC-002",
      fullName: "Arjun Verma",
      age: 29,
      medicalConditions: ["Seasonal Asthma"],
    },
  ];

  const invalidPatientBatch = [
    {
      patientId: "AETH-SYNC-001",
      fullName: "Kavita Rao",
      age: 42,
    },
    {
      patientId: "", // INVALID: Empty patientId
      fullName: "Arjun Verma",
    },
  ];

  const validMedicationPayload = {
    hospitalName: "Apollo Hospital",
    patientId: "AETH-PT-9842",
    medications: [
      {
        brandName: "Metformin 500",
        genericName: "Metformin Hydrochloride",
        dosage: "500mg",
        frequency: "Twice daily with meals",
      },
      {
        brandName: "Atorvastatin 10",
        genericName: "Atorvastatin Calcium",
        dosage: "10mg",
        frequency: "Once at bedtime",
      },
    ],
  };

  const invalidMedicationPayload = {
    hospitalName: "Apollo Hospital",
    patientId: "AETH-PT-9842",
    medications: [
      {
        brandName: "Metformin 500",
        dosage: "500mg",
        frequency: "Twice daily",
      },
      {
        brandName: "", // INVALID: Empty brandName
        dosage: "10mg",
        frequency: "Once daily",
      },
    ],
  };

  // -----------------------------------------------------------------
  // 1. Missing Key Tests (Expected 401 on all 3 routes)
  // -----------------------------------------------------------------
  console.log("--- Group 1: Missing API Key Tests (All 3 routes) ---");
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  const docNoKeyReq = createMockRequest("/api/v1/hospital/sync-doctors", { doctors: validDoctorBatch });
  const docNoKeyRes = await syncDoctorsHandler(docNoKeyReq);
  assert(docNoKeyRes.status === 401, "sync-doctors without API key returns 401 Unauthorized");

  const patNoKeyReq = createMockRequest("/api/v1/hospital/sync-patients", { patients: validPatientBatch });
  const patNoKeyRes = await syncPatientsHandler(patNoKeyReq);
  assert(patNoKeyRes.status === 401, "sync-patients without API key returns 401 Unauthorized");

  const medNoKeyReq = createMockRequest("/api/medications/sync", validMedicationPayload);
  const medNoKeyRes = await syncMedicationsHandler(medNoKeyReq);
  assert(medNoKeyRes.status === 401, "medications/sync without API key returns 401 Unauthorized");

  // -----------------------------------------------------------------
  // 2. Wrong Key Tests (Expected 403 or 401 on all 3 routes)
  // -----------------------------------------------------------------
  console.log("\n--- Group 2: Wrong / Invalid API Key Tests ---");

  const docWrongKeyReq = createMockRequest(
    "/api/v1/hospital/sync-doctors",
    { doctors: validDoctorBatch },
    { "x-hospital-api-key": "invalid_wrong_secret_123" }
  );
  const docWrongKeyRes = await syncDoctorsHandler(docWrongKeyReq);
  assert(
    docWrongKeyRes.status === 403 || docWrongKeyRes.status === 401,
    "sync-doctors with wrong API key returns 403/401 and never 200"
  );

  const patWrongKeyReq = createMockRequest(
    "/api/v1/hospital/sync-patients",
    { patients: validPatientBatch },
    { "x-hospital-api-key": "invalid_wrong_secret_123" }
  );
  const patWrongKeyRes = await syncPatientsHandler(patWrongKeyReq);
  assert(
    patWrongKeyRes.status === 403 || patWrongKeyRes.status === 401,
    "sync-patients with wrong API key returns 403/401 and never 200"
  );

  const medWrongKeyReq = createMockRequest(
    "/api/medications/sync",
    validMedicationPayload,
    { "x-medication-api-key": "invalid_wrong_secret_123" }
  );
  const medWrongKeyRes = await syncMedicationsHandler(medWrongKeyReq);
  assert(
    medWrongKeyRes.status === 403 || medWrongKeyRes.status === 401,
    "medications/sync with wrong API key returns 403/401 and never 200"
  );

  // -----------------------------------------------------------------
  // 3. Demo Key in Production Mode (DEMO_MODE OFF)
  // -----------------------------------------------------------------
  console.log("\n--- Group 3: Demo Key in Production Mode (DEMO_MODE OFF) ---");
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  const docDemoInProdReq = createMockRequest(
    "/api/v1/hospital/sync-doctors",
    { doctors: validDoctorBatch },
    { "x-hospital-api-key": "aether_ehr_live_sec_demo" }
  );
  const docDemoInProdRes = await syncDoctorsHandler(docDemoInProdReq);
  assert(
    docDemoInProdRes.status === 403 || docDemoInProdRes.status === 401,
    "Demo key is strictly REJECTED outside DEMO_MODE on sync-doctors"
  );

  const patDemoInProdReq = createMockRequest(
    "/api/v1/hospital/sync-patients",
    { patients: validPatientBatch },
    { "x-hospital-api-key": "aether_ehr_live_sec_demo" }
  );
  const patDemoInProdRes = await syncPatientsHandler(patDemoInProdReq);
  assert(
    patDemoInProdRes.status === 403 || patDemoInProdRes.status === 401,
    "Demo key is strictly REJECTED outside DEMO_MODE on sync-patients"
  );

  const medDemoInProdReq = createMockRequest(
    "/api/medications/sync",
    validMedicationPayload,
    { "x-medication-api-key": "aether_med_sec_demo" }
  );
  const medDemoInProdRes = await syncMedicationsHandler(medDemoInProdReq);
  assert(
    medDemoInProdRes.status === 403 || medDemoInProdRes.status === 401,
    "Demo key is strictly REJECTED outside DEMO_MODE on medications/sync"
  );

  // -----------------------------------------------------------------
  // 4. Batch Schema Validation (Invalid Second Item Rejection)
  // -----------------------------------------------------------------
  console.log("\n--- Group 4: Batch Schema Validation (Invalid Second Item) ---");
  process.env.DEMO_MODE = "true"; // Enable demo mode for schema testing

  const docInvalidItemReq = createMockRequest(
    "/api/v1/hospital/sync-doctors",
    { doctors: invalidDoctorBatch },
    { "x-hospital-api-key": "aether_ehr_live_sec_demo" }
  );
  const docInvalidItemRes = await syncDoctorsHandler(docInvalidItemReq);
  const docInvalidJson = await docInvalidItemRes.json();
  assert(docInvalidItemRes.status === 400, "Doctor batch with invalid second item returns 400 Bad Request");
  assert(
    docInvalidJson.details && docInvalidJson.details.length > 0,
    "Doctor validation error provides clear Zod details"
  );

  const patInvalidItemReq = createMockRequest(
    "/api/v1/hospital/sync-patients",
    { patients: invalidPatientBatch },
    { "x-hospital-api-key": "aether_ehr_live_sec_demo" }
  );
  const patInvalidItemRes = await syncPatientsHandler(patInvalidItemReq);
  const patInvalidJson = await patInvalidItemRes.json();
  assert(patInvalidItemRes.status === 400, "Patient batch with invalid second item returns 400 Bad Request");
  assert(
    patInvalidJson.details && patInvalidJson.details.length > 0,
    "Patient validation error provides clear Zod details"
  );

  const medInvalidItemReq = createMockRequest(
    "/api/medications/sync",
    invalidMedicationPayload,
    { "x-medication-api-key": "aether_med_sec_demo" }
  );
  const medInvalidItemRes = await syncMedicationsHandler(medInvalidItemReq);
  const medInvalidJson = await medInvalidItemRes.json();
  assert(medInvalidItemRes.status === 400, "Medication batch with invalid second item returns 400 Bad Request");
  assert(
    medInvalidJson.details && medInvalidJson.details.length > 0,
    "Medication validation error provides clear Zod details"
  );

  // -----------------------------------------------------------------
  // 5. Duplicate Idempotency Key Handling
  // -----------------------------------------------------------------
  console.log("\n--- Group 5: Idempotency Key Tests ---");
  const testIdempotencyKey = `idem_test_${Date.now()}`;

  // First valid request
  const medIdemReq1 = createMockRequest(
    "/api/medications/sync",
    validMedicationPayload,
    {
      "x-medication-api-key": "aether_med_sec_demo",
      "x-idempotency-key": testIdempotencyKey,
    }
  );
  const medIdemRes1 = await syncMedicationsHandler(medIdemReq1);
  const medIdemJson1 = await medIdemRes1.json();
  assert(medIdemRes1.status === 200, "First request with idempotency key succeeded with 200");
  assert(medIdemJson1.syncedCount === 2, "First request processed 2 medications");

  // Duplicate request with identical idempotency key
  const medIdemReq2 = createMockRequest(
    "/api/medications/sync",
    validMedicationPayload,
    {
      "x-medication-api-key": "aether_med_sec_demo",
      "x-idempotency-key": testIdempotencyKey,
    }
  );
  const medIdemRes2 = await syncMedicationsHandler(medIdemReq2);
  const medIdemJson2 = await medIdemRes2.json();
  assert(medIdemRes2.status === 200, "Duplicate request with idempotency key returned 200");
  assert(medIdemJson2.idempotent === true, "Duplicate request was flagged as idempotent / cached");

  // -----------------------------------------------------------------
  // 6. Valid Batch & Honest Persistence Status
  // -----------------------------------------------------------------
  console.log("\n--- Group 6: Valid Batch & Honest Persistence Status ---");

  const patValidReq = createMockRequest(
    "/api/v1/hospital/sync-patients",
    { patients: validPatientBatch },
    { "x-hospital-api-key": "aether_ehr_live_sec_demo" }
  );
  const patValidRes = await syncPatientsHandler(patValidReq);
  const patValidJson = await patValidRes.json();
  assert(patValidRes.status === 200, "Valid patient batch returns 200 OK");
  assert(
    patValidJson.status === "synchronized" && patValidJson.persisted === true,
    "Patient sync reports honest 'synchronized' and persisted: true when written to queue"
  );
  assert(patValidJson.syncedCount === 2, "Patient sync syncedCount is exactly 2");

  console.log("\n🎉 ALL 16/16 PR 4 INTEGRATION AUTH & BATCH VALIDATION ACCEPTANCE TESTS PASSED!\n");
}

runPR4IntegrationAuthTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
