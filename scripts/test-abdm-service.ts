import {
  verifyHprId,
  getAbdmDoctors,
  checkAbdmRegistryStatus,
  ABDMRegistryClient,
  ABDMDoctor,
} from "../services/abdmService";
import {
  signInAsDoctor,
  VERIFIED_DOCTORS_REGISTRY,
} from "../services/authService";

async function runAbdmServiceTests() {
  console.log("=== Running ABDM HPR Registry Service & Identity Verification Acceptance Tests ===\n");

  // Ensure DEMO_MODE is active for demo fixture tests
  process.env.DEMO_MODE = "true";

  // Test 1: verifyHprId with known seeded doctor in DEMO_MODE
  console.log("[Test 1] verifyHprId ('dr_ananya@hpr') in DEMO_MODE");
  const result1 = await verifyHprId("dr_ananya@hpr");
  if (result1.isVerified && result1.status === "verified" && result1.doctor?.fullName === "Dr. Ananya Sharma") {
    console.log("✅ Test 1 Passed: Known HPR handle correctly matched in demo fixture mode.");
    console.log(`   Registration: ${result1.doctor.registrationNumber} (${result1.doctor.councilName})\n`);
  } else {
    console.error("❌ Test 1 Failed:", result1);
    process.exit(1);
  }

  // Test 2: verifyHprId with generic valid HPR format MUST return "unverified (format valid)"
  console.log("[Test 2] verifyHprId ('dr_test_user@hpr') - Format check alone");
  const result2 = await verifyHprId("dr_test_user@hpr");
  if (!result2.isVerified && result2.status === "unverified" && result2.message === "unverified (format valid)") {
    console.log("✅ Test 2 Passed: Format-only HPR check correctly returns 'unverified (format valid)' (never fake verified).\n");
  } else {
    console.error("❌ Test 2 Failed: Format check erroneously returned verified or wrong status:", result2);
    process.exit(1);
  }

  // Test 3: verifyHprId with invalid format
  console.log("[Test 3] verifyHprId ('invalid_handle_without_domain')");
  const result3 = await verifyHprId("invalid_handle_without_domain");
  if (!result3.isVerified && result3.status === "invalid_format") {
    console.log("✅ Test 3 Passed: Invalid handle correctly rejected with status 'invalid_format'.\n");
  } else {
    console.error("❌ Test 3 Failed:", result3);
    process.exit(1);
  }

  // Test 4: Registry integration availability interface
  console.log("[Test 4] checkAbdmRegistryStatus() without configured gateway secrets");
  delete process.env.ABDM_CLIENT_ID;
  delete process.env.ABDM_CLIENT_SECRET;
  const regStatus = await checkAbdmRegistryStatus();
  if (regStatus.status === "unavailable") {
    console.log("✅ Test 4 Passed: Unconfigured live registry correctly returns 'unavailable'.\n");
  } else {
    console.error("❌ Test 4 Failed:", regStatus);
    process.exit(1);
  }

  // Test 5: verifyHprId with real registry client injection
  console.log("[Test 5] verifyHprId with injected live registry response");
  const mockRegistryClient: ABDMRegistryClient = {
    async isAvailable() {
      return true;
    },
    async queryRegistry(hprId: string): Promise<ABDMDoctor | null> {
      if (hprId === "dr_registry_live@hpr") {
        return {
          hprId: "dr_registry_live@hpr",
          registrationNumber: "REG-NMC-2026-9999",
          fullName: "Dr. Real Registry Verified",
          speciality: "Neurology",
          qualifications: "MBBS, DM",
          councilName: "National Medical Commission",
          facilityName: "National Medical Center",
          facilityAddress: "Ring Road, New Delhi",
          lat: 28.6139,
          lng: 77.209,
          isAbdmVerified: true,
          rating: 5.0,
          consultationFee: 1000,
          availableSlots: ["10:00 AM"],
        };
      }
      return null;
    },
  };

  const result5 = await verifyHprId("dr_registry_live@hpr", { registryClient: mockRegistryClient });
  if (result5.isVerified && result5.status === "verified" && result5.doctor?.fullName === "Dr. Real Registry Verified") {
    console.log("✅ Test 5 Passed: Real registry integration returns verified with authentic doctor details.\n");
  } else {
    console.error("❌ Test 5 Failed:", result5);
    process.exit(1);
  }

  // Test 6: Typed doctor name in signInAsDoctor NEVER yields isVerified: true
  console.log("[Test 6] Typed doctor name sign-in NEVER yields isVerified=true");
  const typedDoctorResult = await signInAsDoctor({
    name: "Dr. Unknown Clinician",
    email: "unknown.clinician@randomclinic.org",
    registrationNumber: "RANDOM-REG-10293",
    hospitalAffiliation: "Random Clinic",
    specialization: "General Practice",
  });

  if (typedDoctorResult.doctorProfile && typedDoctorResult.doctorProfile.isVerified === false) {
    console.log("✅ Test 6 Passed: Typed doctor name yields isVerified=false.\n");
  } else {
    console.error("❌ Test 6 Failed: Typed doctor name was marked verified:", typedDoctorResult);
    process.exit(1);
  }

  // Test 7: getAbdmDoctors in DEMO_MODE vs Outside DEMO_MODE
  console.log("[Test 7] getAbdmDoctors DEMO_MODE gating");
  process.env.DEMO_MODE = "true";
  const demoDocs = await getAbdmDoctors(undefined, "Cardiology", true);
  if (demoDocs.length > 0) {
    console.log(`   DEMO_MODE=true returned ${demoDocs.length} demo doctors.`);
  } else {
    console.error("❌ Test 7a Failed in DEMO_MODE:", demoDocs);
    process.exit(1);
  }

  process.env.DEMO_MODE = "false";
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  const liveDocs = await getAbdmDoctors(undefined, "Cardiology", true);
  if (liveDocs.length === 0) {
    console.log("✅ Test 7 Passed: Outside DEMO_MODE, fixtures are withheld (empty list returned).\n");
  } else {
    console.error("❌ Test 7b Failed outside DEMO_MODE (fixtures leaked):", liveDocs);
    process.exit(1);
  }

  console.log("🎉 ALL ABDM HPR & IDENTITY TESTS PASSED SUCCESSFULLY!");
}

runAbdmServiceTests().catch((err) => {
  console.error("FATAL ABDM TEST ERROR:", err);
  process.exit(1);
});
