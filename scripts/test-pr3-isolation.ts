import {
  getPatientVectorRecords,
  storeVectorMedicalRecord,
} from "../services/domain/vectorHistoryService";
import { getTodayAssignedMedications } from "../services/domain/medicationScheduleService";
import {
  getHealthTimeline,
  createClinicianClearance,
} from "../services/domain/timelineService";
import {
  prescribeMultipleMedications,
  hasClinicianAccess,
  grantClinicianPatientAccess,
  revokeClinicianPatientAccess,
  getPatientRecordForDoctor,
  getDoctorPatientQueue,
  upsertPatientQueueRecord,
} from "../services/clinicalHandoverService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runPR3IsolationTests() {
  console.log("\n=======================================================");
  console.log("🧪 RUNNING PR 3 ACCEPTANCE TESTS: PATIENT ISOLATION");
  console.log("=======================================================\n");

  const patientAlice = "patient_alice_101";
  const patientBob = "patient_bob_202";
  const demoPatient = "aether_usr_8f92a170b4c2";

  // -----------------------------------------------------------------
  // 1. Vector Record Isolation
  // -----------------------------------------------------------------
  console.log("--- 1. Testing Vector History Record Isolation ---");
  
  // Clean state: Outside demo mode
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  // Mock supabase vector insert for isolated offline unit testing
  const { supabase } = await import("../lib/supabase");
  const origFrom = supabase.from.bind(supabase);
  supabase.from = ((table: string) => {
    if (table === "medical_vector_embeddings") {
      return {
        insert: async () => ({ data: null, error: null }),
      } as any;
    }
    return origFrom(table);
  }) as any;

  // Alice adds a clinical vector summary
  await storeVectorMedicalRecord(
    patientAlice,
    "Patient Alice reports stress-induced tension headache",
    "symptom_triage"
  );

  // Bob adds a clinical vector summary
  await storeVectorMedicalRecord(
    patientBob,
    "Patient Bob twisted right ankle playing basketball with swelling",
    "symptom_triage"
  );

  const aliceVectors = getPatientVectorRecords(patientAlice);
  const bobVectors = getPatientVectorRecords(patientBob);

  assert(
    aliceVectors.length > 0 && aliceVectors.every((r) => r.userId === patientAlice),
    "Alice vector query returns ONLY Alice's records"
  );
  assert(
    !aliceVectors.some((r) => r.content.includes("Bob")),
    "Alice CANNOT see Bob's vector records"
  );
  assert(
    bobVectors.length > 0 && bobVectors.every((r) => r.userId === patientBob),
    "Bob vector query returns ONLY Bob's records"
  );
  assert(
    !bobVectors.some((r) => r.content.includes("Alice")),
    "Bob CANNOT see Alice's vector records"
  );

  // Ensure seeded records are excluded when DEMO_MODE is off
  const demoVectorsWithoutDemoMode = getPatientVectorRecords(demoPatient);
  assert(
    demoVectorsWithoutDemoMode.length === 0,
    "Seeded vector records are NOT returned outside DEMO_MODE"
  );

  // Turn on DEMO_MODE: demo patient sees seeded records, but Alice/Bob still do not
  process.env.DEMO_MODE = "true";
  const demoVectorsWithDemoMode = getPatientVectorRecords(demoPatient);
  assert(
    demoVectorsWithDemoMode.length > 0,
    "Seeded vector records ARE returned in DEMO_MODE for demo patient"
  );
  const aliceVectorsInDemo = getPatientVectorRecords(patientAlice);
  assert(
    !aliceVectorsInDemo.some((r) => r.id.startsWith("vec_mem_")),
    "Alice STILL does not see seeded demo records even when DEMO_MODE is on"
  );

  // -----------------------------------------------------------------
  // 2. Medication Schedule & Prescription Isolation
  // -----------------------------------------------------------------
  console.log("\n--- 2. Testing Medication Schedule & Prescription Isolation ---");

  // In Node environment, mock localStorage to test partitioning
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
  (global as any).window = { localStorage: (global as any).localStorage };

  // Prescribe for Alice
  prescribeMultipleMedications(patientAlice, [
    {
      brandName: "Sumatriptan",
      genericName: "Sumatriptan Succinate",
      dosage: "50mg",
      frequency: "As needed for migraine",
      timesOfDay: ["Morning"],
      mealTiming: "After Food",
      startDate: "2026-10-09",
      endDate: "2026-10-16",
      totalDays: 7,
      instructions: "Take with full glass of water",
      doctorName: "Dr. Anya Sharma",
      hospitalName: "Apollo Hospital",
    },
  ]);

  // Prescribe for Bob
  prescribeMultipleMedications(patientBob, [
    {
      brandName: "Ibuprofen",
      genericName: "Ibuprofen",
      dosage: "400mg",
      frequency: "Twice daily with meals",
      timesOfDay: ["Morning", "Night"],
      mealTiming: "After Food",
      startDate: "2026-10-09",
      endDate: "2026-10-14",
      totalDays: 5,
      instructions: "Take with food for joint inflammation",
      doctorName: "Dr. Anya Sharma",
      hospitalName: "Apollo Hospital",
    },
  ]);

  // Verify partitioned keys exist in localStorage
  assert(
    storageStore[`aether_medications:${patientAlice}`] !== undefined,
    "Prescription wrote to partitioned key aether_medications:patient_alice_101"
  );
  assert(
    storageStore[`aether_medications:${patientBob}`] !== undefined,
    "Prescription wrote to partitioned key aether_medications:patient_bob_202"
  );
  assert(
    storageStore["aether_medications"] === undefined,
    "Shared global unpartitioned aether_medications key was NOT used"
  );

  const aliceMeds = getTodayAssignedMedications(patientAlice);
  const bobMeds = getTodayAssignedMedications(patientBob);

  assert(
    aliceMeds.some((m) => m.brandName === "Sumatriptan"),
    "Alice receives her prescribed medication (Sumatriptan)"
  );
  assert(
    !aliceMeds.some((m) => m.brandName === "Ibuprofen"),
    "Alice CANNOT see Bob's medication (Ibuprofen)"
  );
  assert(
    bobMeds.some((m) => m.brandName === "Ibuprofen"),
    "Bob receives his prescribed medication (Ibuprofen)"
  );
  assert(
    !bobMeds.some((m) => m.brandName === "Sumatriptan"),
    "Bob CANNOT see Alice's medication (Sumatriptan)"
  );

  // -----------------------------------------------------------------
  // 3. Health Timeline Isolation
  // -----------------------------------------------------------------
  console.log("\n--- 3. Testing Health Timeline Isolation ---");

  await createClinicianClearance({
    clinicianId: "doc_anya_sharma",
    patientId: patientAlice,
    title: "Migraine Follow-up Cleared",
    notes: "Patient Alice is symptom-free after rest",
  });

  await createClinicianClearance({
    clinicianId: "doc_anya_sharma",
    patientId: patientBob,
    title: "Ankle Mobility Cleared",
    notes: "Patient Bob ankle swelling resolved",
  });

  const aliceTimeline = await getHealthTimeline(patientAlice);
  const bobTimeline = await getHealthTimeline(patientBob);

  assert(
    aliceTimeline.some((t) => t.title.includes("Migraine Follow-up Cleared")),
    "Alice timeline contains Alice's clearance"
  );
  assert(
    !aliceTimeline.some((t) => t.title.includes("Ankle Mobility Cleared")),
    "Alice timeline DOES NOT contain Bob's clearance"
  );
  assert(
    bobTimeline.some((t) => t.title.includes("Ankle Mobility Cleared")),
    "Bob timeline contains Bob's clearance"
  );
  assert(
    !bobTimeline.some((t) => t.title.includes("Migraine Follow-up Cleared")),
    "Bob timeline DOES NOT contain Alice's clearance"
  );

  // -----------------------------------------------------------------
  // 4. Clinician Access Grants & Allow-list
  // -----------------------------------------------------------------
  console.log("\n--- 4. Testing Clinician Access Grants & Allow-list ---");

  // Ensure Alice exists in patient queue
  upsertPatientQueueRecord({
    patientId: patientAlice,
    name: "Alice Wonderland",
    chiefComplaint: "Alice acute tension headache",
    urgencyLevel: "routine",
  });

  const doctorAuthorized = "doc_anya_sharma";
  const doctorUnauthorized = "doc_unauthorized_999";

  // Initially, doctorUnauthorized has no grant for Alice
  assert(
    !hasClinicianAccess(doctorUnauthorized, patientAlice),
    "Unauthorized clinician has NO access to Alice without grant"
  );

  const unauthorizedAliceRecord = getPatientRecordForDoctor(doctorUnauthorized, patientAlice);
  assert(
    unauthorizedAliceRecord === null,
    "Unauthorized clinician receives NULL when attempting to query Alice's record"
  );

  const unauthorizedQueue = getDoctorPatientQueue(doctorUnauthorized);
  assert(
    unauthorizedQueue.length === 0,
    "Unauthorized clinician queue is empty"
  );

  // Explicitly grant access to doctorAuthorized for Alice
  grantClinicianPatientAccess(doctorAuthorized, patientAlice);

  assert(
    hasClinicianAccess(doctorAuthorized, patientAlice),
    "Authorized clinician now HAS access to Alice after explicit consent grant"
  );

  const authorizedAliceRecord = getPatientRecordForDoctor(doctorAuthorized, patientAlice);
  assert(
    authorizedAliceRecord !== null && authorizedAliceRecord.patientId === patientAlice,
    "Authorized clinician successfully retrieves Alice's clinical handover record"
  );

  // Revoke access
  revokeClinicianPatientAccess(doctorAuthorized, patientAlice);
  assert(
    !hasClinicianAccess(doctorAuthorized, patientAlice),
    "Clinician access is successfully DENIED after revoking consent grant"
  );
  assert(
    getPatientRecordForDoctor(doctorAuthorized, patientAlice) === null,
    "Clinician receives NULL after access revocation"
  );

  console.log("\n🎉 ALL PR 3 PATIENT ISOLATION ACCEPTANCE TESTS PASSED SUCCESSFULLY!\n");
}

runPR3IsolationTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
