import {
  signInAsDoctor,
  signInWithGoogle,
  getActiveDoctorProfile,
  getVerifiedDoctors,
  isDemoMode,
  VERIFIED_DOCTORS_REGISTRY,
} from "../services/authService";
import {
  verifyHprId,
  getAbdmDoctors,
  checkAbdmRegistryStatus,
  ABDMRegistryClient,
  ABDMDoctor,
} from "../services/abdmService";

async function runPR2AcceptanceSuite() {
  console.log("================================================================================");
  console.log("  AETHER PR 2 OF 6: REAL IDENTITY & AUTHENTICATION INTEGRITY SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Typed doctor details NEVER yield isVerified: true (even in DEMO_MODE)
  // --------------------------------------------------------------------------
  console.log("🧪 Group 1: Typed Doctor Details Never Yield isVerified=true");
  process.env.DEMO_MODE = "true";
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";

  const typedProfile = await signInAsDoctor({
    name: "Dr. Gregory House",
    email: "gregory.house@princetonplainsboro.org",
    registrationNumber: "NJ-MED-998821",
    hospitalAffiliation: "Princeton-Plainsboro Teaching Hospital",
    specialization: "Diagnostic Medicine & Nephrology",
    qualifications: "MD, Board Certified",
  });

  assert(
    typedProfile.doctorProfile?.isVerified === false,
    "Typed doctor profile has isVerified: false"
  );
  assert(
    typedProfile.doctorProfile?.certificates[0].verified === false,
    "Typed doctor certificates are marked verified: false"
  );
  assert(
    typedProfile.doctorProfile?.name === "Dr. Gregory House",
    "Typed doctor name preserved accurately"
  );

  // --------------------------------------------------------------------------
  // TEST 2: Outside DEMO_MODE, Doctor Sign-In MUST FAIL without Server Identity
  // --------------------------------------------------------------------------
  console.log("\n🧪 Group 2: Outside DEMO_MODE Doctor Sign-in Enforcement");
  process.env.DEMO_MODE = "false";
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";

  let threwExpected = false;
  try {
    await signInAsDoctor({
      name: "Dr. Robert Chase",
      email: "chase@hospital.org",
      registrationNumber: "REG-88219",
      hospitalAffiliation: "St. Jude Hospital",
      specialization: "Cardiology",
    });
  } catch (err: any) {
    threwExpected = true;
    assert(
      err.message.includes("Server-verified identity") || err.message.includes("verifyIdToken"),
      `Error correctly cites server-verified identity requirement: "${err.message}"`
    );
  }
  assert(
    threwExpected,
    "Outside DEMO_MODE, doctor sign-in without idToken was strictly rejected"
  );

  // --------------------------------------------------------------------------
  // TEST 3: Doctor Fixtures Stay Only Behind Explicit DEMO_MODE
  // --------------------------------------------------------------------------
  console.log("\n🧪 Group 3: Doctor Fixtures DEMO_MODE Gating");
  process.env.DEMO_MODE = "false";
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  const nonDemoDoctors = getVerifiedDoctors();
  assert(
    nonDemoDoctors.length === 0,
    "getVerifiedDoctors() returns empty array outside DEMO_MODE"
  );

  process.env.DEMO_MODE = "true";
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  const demoDoctors = getVerifiedDoctors();
  assert(
    demoDoctors.length > 0 && demoDoctors[0].name.includes("Anya Sharma"),
    `getVerifiedDoctors() returns verified presets in DEMO_MODE (${demoDoctors.length} available)`
  );

  // --------------------------------------------------------------------------
  // TEST 4: HPR Format Check Alone Returns "unverified (format valid)"
  // --------------------------------------------------------------------------
  console.log("\n🧪 Group 4: ABDM verifyHprId Format Check Integrity");
  process.env.DEMO_MODE = "false";
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";

  const formatOnlyCheck = await verifyHprId("dr.johndoe@hpr");
  assert(
    formatOnlyCheck.isVerified === false,
    "Format-valid HPR ID is NOT marked isVerified: true"
  );
  assert(
    formatOnlyCheck.status === "unverified",
    "Format-valid HPR ID returns status: 'unverified'"
  );
  assert(
    formatOnlyCheck.message === "unverified (format valid)",
    "Format-valid HPR ID returns exact message 'unverified (format valid)'"
  );

  const formatDotAbdmCheck = await verifyHprId("dr.johndoe@hpr.abdm");
  assert(
    formatDotAbdmCheck.isVerified === false && formatDotAbdmCheck.status === "unverified",
    "dr.johndoe@hpr.abdm returns status: 'unverified'"
  );

  // Invalid format test
  const invalidFormatCheck = await verifyHprId("not_a_valid_hpr_handle");
  assert(
    invalidFormatCheck.isVerified === false && invalidFormatCheck.status === "invalid_format",
    "Invalid handle syntax returns status: 'invalid_format'"
  );

  // --------------------------------------------------------------------------
  // TEST 5: Real Registry Response vs Unavailable Registry
  // --------------------------------------------------------------------------
  console.log("\n🧪 Group 5: ABDM Registry Interface Verification");

  const unconfiguredRegistryStatus = await checkAbdmRegistryStatus();
  assert(
    unconfiguredRegistryStatus.status === "unavailable",
    "Unconfigured ABDM Registry integration returns status: 'unavailable'"
  );

  const realRegistryClient: ABDMRegistryClient = {
    async isAvailable() {
      return true;
    },
    async queryRegistry(hprId: string): Promise<ABDMDoctor | null> {
      if (hprId === "dr.sovereign@hpr") {
        return {
          hprId: "dr.sovereign@hpr",
          registrationNumber: "NMC-2026-LIVE-7711",
          fullName: "Dr. Sovereign Practitioner",
          speciality: "Interventional Cardiology",
          qualifications: "MBBS, MD, DM",
          councilName: "National Medical Commission",
          facilityName: "Apex Heart & Telemetry Institute",
          facilityAddress: "MG Road, Bengaluru",
          lat: 12.9716,
          lng: 77.5946,
          isAbdmVerified: true,
          rating: 4.95,
          consultationFee: 1200,
          availableSlots: ["09:00 AM", "02:00 PM"],
        };
      }
      return null;
    },
  };

  const realRegistryResult = await verifyHprId("dr.sovereign@hpr", {
    registryClient: realRegistryClient,
  });
  assert(
    realRegistryResult.isVerified === true && realRegistryResult.status === "verified",
    "Real registry response marks doctor as isVerified: true with status: 'verified'"
  );
  assert(
    realRegistryResult.doctor?.fullName === "Dr. Sovereign Practitioner",
    "Real doctor identity matched and returned from live registry"
  );

  console.log("\n================================================================================");
  console.log(`  🎉 ALL ${passed}/${total} PR 2 ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
  console.log("================================================================================\n");
}

runPR2AcceptanceSuite().catch((err) => {
  console.error("❌ PR 2 Acceptance Suite Failed:", err);
  process.exit(1);
});
