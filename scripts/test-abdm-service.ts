import { verifyHprId, getAbdmDoctors } from "../services/abdmService";

async function runAbdmServiceTests() {
  console.log("=== Running ABDM HPR Registry Service Acceptance Tests ===\n");

  // Test 1: verifyHprId with known seeded doctor
  console.log("[Test 1] verifyHprId ('dr_ananya@hpr')");
  const result1 = await verifyHprId("dr_ananya@hpr");
  if (result1.isVerified && result1.doctor?.fullName === "Dr. Ananya Sharma") {
    console.log("✅ Test 1 Passed: Known HPR handle correctly verified with doctor profile.");
    console.log(`   Registration: ${result1.doctor.registrationNumber} (${result1.doctor.councilName})\n`);
  } else {
    console.error("❌ Test 1 Failed:", result1);
    process.exit(1);
  }

  // Test 2: verifyHprId with generic valid HPR format
  console.log("[Test 2] verifyHprId ('dr_test_user@hpr')");
  const result2 = await verifyHprId("dr_test_user@hpr");
  if (result2.isVerified) {
    console.log("✅ Test 2 Passed: Valid HPR ID format correctly verified against NHA gateway.\n");
  } else {
    console.error("❌ Test 2 Failed:", result2);
    process.exit(1);
  }

  // Test 3: verifyHprId with invalid string
  console.log("[Test 3] verifyHprId ('invalid_handle_without_domain')");
  const result3 = await verifyHprId("invalid_handle_without_domain");
  if (!result3.isVerified) {
    console.log("✅ Test 3 Passed: Invalid handle correctly rejected.\n");
  } else {
    console.error("❌ Test 3 Failed:", result3);
    process.exit(1);
  }

  // Test 4: getAbdmDoctors with specialty filter
  console.log("[Test 4] getAbdmDoctors (specialty: 'Cardiology')");
  const docs = await getAbdmDoctors(undefined, "Cardiology", true);
  if (docs.length > 0 && docs[0].speciality === "Cardiology") {
    console.log(`✅ Test 4 Passed: Fetched ${docs.length} ABDM verified Cardiology specialists.\n`);
  } else {
    console.error("❌ Test 4 Failed:", docs);
    process.exit(1);
  }

  console.log("🎉 ALL ABDM SERVICE ACCEPTANCE TESTS PASSED SUCCESSFULLY!");
}

runAbdmServiceTests().catch((err) => {
  console.error("FATAL ABDM TEST ERROR:", err);
  process.exit(1);
});
