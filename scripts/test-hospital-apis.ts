import { POST as syncPatients } from "../app/api/v1/hospital/sync-patients/route";
import { POST as syncDoctors } from "../app/api/v1/hospital/sync-doctors/route";
import { NextRequest } from "next/server";

async function runHospitalApiTests() {
  console.log("=== Running External Hospital Software API Integration Tests ===\n");

  // Test 1: Reject Unauthorized EHR Webhook Call
  console.log("[Test 1] Reject Unauthorized EHR Webhook Request (Missing API Key)");
  const unauthReq = new NextRequest("http://localhost:3000/api/v1/hospital/sync-patients", {
    method: "POST",
    body: JSON.stringify({ patientId: "P_101", fullName: "Test Patient" }),
  });
  const unauthRes = await syncPatients(unauthReq);
  if (unauthRes.status === 401) {
    console.log("✅ Test 1 Passed: Unauthorized request correctly rejected with 401 status.\n");
  } else {
    console.error("❌ Test 1 Failed:", unauthRes.status);
    process.exit(1);
  }

  // Test 2: Synchronize Patient Roster from Hospital EHR
  console.log("[Test 2] POST /api/v1/hospital/sync-patients (Authorized)");
  const syncPatientReq = new NextRequest("http://localhost:3000/api/v1/hospital/sync-patients", {
    method: "POST",
    headers: {
      "x-hospital-api-key": "aether_ehr_live_sec_9941a8",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      patients: [
        {
          patientId: "EHR_88291",
          fullName: "Emily Davis",
          knownAllergies: ["Penicillin"],
          assignedMedications: [{ name: "Inhaler", dosage: "100mcg", frequency: "Daily" }],
        },
      ],
    }),
  });
  const patientRes = await syncPatients(syncPatientReq);
  const patientJson = await patientRes.json();
  if (patientRes.status === 200 && patientJson.syncedCount === 1) {
    console.log("✅ Test 2 Passed: Patient record successfully synced from hospital software.\n");
  } else {
    console.error("❌ Test 2 Failed:", patientJson);
    process.exit(1);
  }

  // Test 3: Synchronize Doctor Roster from Hospital EHR
  console.log("[Test 3] POST /api/v1/hospital/sync-doctors (Authorized)");
  const syncDocReq = new NextRequest("http://localhost:3000/api/v1/hospital/sync-doctors", {
    method: "POST",
    headers: {
      "x-hospital-api-key": "aether_ehr_live_sec_9941a8",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      doctors: [
        {
          hprId: "dr_priya_sharma@hpr",
          fullName: "Dr. Priya Sharma",
          specialty: "Cardiology",
          hospitalName: "Apollo Emergency Care",
          consultationFee: 1000,
        },
      ],
    }),
  });
  const docRes = await syncDoctors(syncDocReq);
  const docJson = await docRes.json();
  if (docRes.status === 200 && docJson.syncedCount === 1) {
    console.log("✅ Test 3 Passed: Doctor roster entry successfully synced from hospital software.\n");
  } else {
    console.error("❌ Test 3 Failed:", docJson);
    process.exit(1);
  }

  console.log("🎉 ALL HOSPITAL EHR API INTEGRATION TESTS PASSED!");
}

runHospitalApiTests().catch((err) => {
  console.error("FATAL HOSPITAL API TEST ERROR:", err);
  process.exit(1);
});
