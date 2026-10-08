/**
 * PR 5 Security & Server-Side AI Verification Suite
 * Tests:
 * 1. Upload failure returns real error and does not produce fabricated URL / records.
 * 2. Supabase insert error surfaces and does not write local vector memory record.
 * 3. Unauthenticated AI server route calls are rejected (401).
 * 4. AI Rate limiting enforces request limits (429).
 * 5. Invalid AI output schemas are rejected by Zod validation.
 * 6. Consent expiry and revocation strictly deny clinician access.
 * 7. Access audit logs contain zero PII.
 */

import { uploadHealthReportFile, getSecureReportDownloadUrl } from "../lib/supabase";
import { storeVectorMedicalRecord, getPatientVectorRecords } from "../services/domain/vectorHistoryService";
import { checkAiRateLimit, resetAiRateLimitForTesting } from "../lib/serverAiRateLimit";
import { triageOutputZodSchema, reportParseOutputZodSchema, sbarHandoverZodSchema } from "../lib/aiValidationSchemas";
import {
  grantClinicianPatientAccess,
  revokeClinicianPatientAccess,
  hasClinicianAccess,
  logClinicianAccessEvent,
  getAccessAuditLogs,
} from "../services/clinicalHandoverService";
import { POST as handleTriageRoute } from "../app/api/ai/triage/route";
import { POST as handleReportRoute } from "../app/api/ai/analyze-report/route";
import { POST as handleSbarRoute } from "../app/api/ai/sbar-handover/route";
import { NextRequest } from "next/server";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runPr5Tests() {
  console.log("================================================================================");
  console.log("AETHER PR 5: Private Uploads, Server-Side AI & Consent Security Suite");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. Upload failure produces no fabricated path or successful record
  // ---------------------------------------------------------------------------
  console.log("1. Storage Security & Honest Failure Tests:");
  
  // Create a mock file
  const mockFile = {
    name: "test-report.pdf",
    size: 1024,
    type: "application/pdf",
    arrayBuffer: async () => new ArrayBuffer(1024),
  } as unknown as File;

  // Attempt upload without Supabase credentials / offline
  const uploadResult = await uploadHealthReportFile(mockFile, "reports/test-report.pdf", "test-patient-101");
  assert(
    uploadResult.signedUrl === null && uploadResult.filePath === null,
    "Upload failure returns null URLs and does not fabricate a mock /uploads path"
  );
  assert(
    uploadResult.error !== null,
    "Upload failure returns a real error object to the caller"
  );

  // Secure download check: unauthenticated / wrong patient access denied
  const unauthorizedDownload = await getSecureReportDownloadUrl("test-patient-101/report-123.pdf", "wrong-patient-999");
  assert(
    unauthorizedDownload.signedUrl === null && (unauthorizedDownload.error?.includes("Access Denied") || unauthorizedDownload.error !== null),
    "Report download with mismatched patient ownership is rejected"
  );

  // ---------------------------------------------------------------------------
  // 2. Supabase Insert Error Surfacing
  // ---------------------------------------------------------------------------
  console.log("\n2. Vector Memory Error Surfacing Tests:");
  const initialMemories = getPatientVectorRecords("patient-error-test");
  const initialCount = initialMemories.length;

  let insertErrorCaught = false;
  try {
    // When Supabase insert fails or is offline, storeVectorMedicalRecord must throw and NOT write local memory
    await storeVectorMedicalRecord(
      "patient-error-test",
      "Confidential test record content",
      "symptom_triage"
    );
  } catch (err: any) {
    insertErrorCaught = true;
  }

  const postMemories = getPatientVectorRecords("patient-error-test");
  assert(
    insertErrorCaught === true,
    "Database insert failure surfaces as a thrown error instead of silent success"
  );
  assert(
    postMemories.length === initialCount,
    "Database insert error does not write a local success record to memory"
  );

  // ---------------------------------------------------------------------------
  // 3. Server AI Authentication Gate
  // ---------------------------------------------------------------------------
  console.log("\n3. Server-Side AI Route Auth Gate Tests:");

  // Request to /api/ai/triage without x-user-id
  const unauthTriageReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: "Mild persistent headache" }),
  });
  const unauthTriageRes = await handleTriageRoute(unauthTriageReq);
  assert(
    unauthTriageRes.status === 401,
    "Unauthenticated call to /api/ai/triage returns HTTP 401"
  );

  // Request to /api/ai/analyze-report without x-user-id
  const unauthReportReq = new NextRequest("http://localhost:3000/api/ai/analyze-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileData: "base64...", mimeType: "image/png" }),
  });
  const unauthReportRes = await handleReportRoute(unauthReportReq);
  assert(
    unauthReportRes.status === 401,
    "Unauthenticated call to /api/ai/analyze-report returns HTTP 401"
  );

  // Request to /api/ai/sbar-handover without x-user-id
  const unauthSbarReq = new NextRequest("http://localhost:3000/api/ai/sbar-handover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId: "PT-1", patientName: "Test", dialogueSummary: "..." }),
  });
  const unauthSbarRes = await handleSbarRoute(unauthSbarReq);
  assert(
    unauthSbarRes.status === 401,
    "Unauthenticated call to /api/ai/sbar-handover returns HTTP 401"
  );

  // ---------------------------------------------------------------------------
  // 4. Rate Limiting Enforcement
  // ---------------------------------------------------------------------------
  console.log("\n4. Server AI Rate Limiter Tests:");
  const testUserId = "rate-limit-test-user";
  resetAiRateLimitForTesting();

  let rateLimitHit = false;
  // Window limit is 30
  for (let i = 0; i < 35; i++) {
    const res = checkAiRateLimit(testUserId);
    if (!res.allowed && i >= 30) {
      rateLimitHit = true;
      break;
    }
  }
  assert(rateLimitHit === true, "Rate limit strictly throttles requests exceeding max limit in window");

  // ---------------------------------------------------------------------------
  // 5. Schema Validation with Zod
  // ---------------------------------------------------------------------------
  console.log("\n5. Zod AI Schema Output Validation Tests:");

  // Valid Triage Schema
  const validTriage = {
    message: "Based on symptoms, please consult a physician.",
    urgencyLevel: "moderate",
    specialties: [{ name: "General Medicine", reason: "Evaluation of symptoms", urgency: "moderate" }],
    suggestedFollowUps: ["Check temperature twice daily"],
    patientRecordContext: ["Allergy: Penicillin"],
  };
  const parsedTriage = triageOutputZodSchema.safeParse(validTriage);
  assert(parsedTriage.success === true, "Valid triage structure passes Zod schema validation");

  // Invalid Triage Schema (bad urgencyLevel enum)
  const invalidTriage = {
    message: "Test",
    urgencyLevel: "fatal_emergency_invented",
    specialties: [],
  };
  const parsedInvalidTriage = triageOutputZodSchema.safeParse(invalidTriage);
  assert(
    parsedInvalidTriage.success === false,
    "Invalid urgency level or missing required fields in AI output rejected by Zod"
  );

  // Invalid Report Parsing Schema (missing required testName or metrics)
  const invalidReport = {
    testName: 12345, // Invalid type
    findings: "Some findings",
  };
  const parsedInvalidReport = reportParseOutputZodSchema.safeParse(invalidReport);
  assert(
    parsedInvalidReport.success === false,
    "Malformed lab report extraction rejected by Zod schema validator"
  );

  // Valid SBAR Handover Schema
  const validSbar = {
    situation: "Patient reports abdominal pain.",
    background: "Known penicillin allergy.",
    assessment: "Stable vitals, mild reactive leukocytosis.",
    recommendation: "Prescribe PPI and repeat labs in 7 days.",
    confidenceScore: 0.95,
  };
  const parsedSbar = sbarHandoverZodSchema.safeParse(validSbar);
  assert(parsedSbar.success === true, "Valid SBAR handover passes Zod schema validation");

  // ---------------------------------------------------------------------------
  // 6. Consent Record Expiry & Revocation
  // ---------------------------------------------------------------------------
  console.log("\n6. Patient Consent Records & Expiry Tests:");
  const testPatient = "patient-consent-alice";
  const testDoctor = "DOC-AETH-901";

  // Initially no consent
  assert(
    hasClinicianAccess(testDoctor, testPatient) === false,
    "Clinician has no access prior to explicit patient consent grant"
  );

  // Grant 2 hours
  grantClinicianPatientAccess(testPatient, testDoctor, ["telemetry", "triage"], 2);
  assert(
    hasClinicianAccess(testDoctor, testPatient) === true,
    "Clinician has verified access after active patient consent grant"
  );

  // Expired consent grant (simulate expiry by setting negative hours)
  grantClinicianPatientAccess(testPatient, testDoctor, ["telemetry", "triage"], -1);
  assert(
    hasClinicianAccess(testDoctor, testPatient) === false,
    "Expired consent grant strictly denies clinician access"
  );

  // Re-grant and then revoke
  grantClinicianPatientAccess(testPatient, testDoctor, ["telemetry", "triage"], 24);
  assert(
    hasClinicianAccess(testDoctor, testPatient) === true,
    "Clinician access active after re-granting 24h consent"
  );

  revokeClinicianPatientAccess(testPatient, testDoctor);
  assert(
    hasClinicianAccess(testDoctor, testPatient) === false,
    "Revoked consent record immediately denies clinician access"
  );

  // ---------------------------------------------------------------------------
  // 7. Audit Logging & Zero PII
  // ---------------------------------------------------------------------------
  console.log("\n7. Access Audit Logging & Zero PII Tests:");
  logClinicianAccessEvent({
    patientId: "patient-audit-99",
    clinicianIdentifier: "DOC-99",
    accessType: "view_records",
    granted: true,
  });

  const logs = getAccessAuditLogs();
  const latestLog = logs[0];
  assert(latestLog !== undefined, "Access event successfully recorded in audit log");
  assert(
    !("patientName" in (latestLog as any)) &&
    !("symptoms" in (latestLog as any)) &&
    !("chiefComplaint" in (latestLog as any)) &&
    !("medicalData" in (latestLog as any)),
    "Access audit log events strictly contain zero Patient PII"
  );

  console.log("\n================================================================================");
  console.log(`PR 5 TEST SUITE RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("================================================================================\n");
}

runPr5Tests().catch((err) => {
  console.error("PR 5 Test Suite Encountered Error:", err);
  process.exit(1);
});
