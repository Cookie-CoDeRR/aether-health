import { parseGeminiReport } from "../services/ai/geminiService";
import {
  fetchNearbyHospitals,
  fetchNearbyHospitalsWithStatus,
  mapOverpassElementsToHospitals,
} from "../services/overpassService";
import { createClinicianClearance } from "../services/domain/timelineService";

async function runPR1IntegrityTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING AETHER PR 1 CLINICAL & OVERPASS TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exit(1);
    }
  }

  // --- TEST GROUP 1: Gemini Report Parsing without DEMO_MODE ---
  console.log("--- Test Group 1: Gemini Report Parsing (DEMO_MODE OFF) ---");
  delete process.env.DEMO_MODE;
  delete process.env.NEXT_PUBLIC_DEMO_MODE;

  const resultDemoOff = await parseGeminiReport({
    userId: "patient_test_1",
    fileName: "unextracted_blood_test.pdf",
  });

  assert(
    resultDemoOff.data?.status === "failed",
    "Demo off: status is 'failed' when no real extraction ran"
  );
  assert(
    resultDemoOff.data?.parseStatus === "failed",
    "Demo off: parseStatus is 'failed' when no real extraction ran"
  );
  assert(
    (resultDemoOff.data?.parsedMetrics?.length ?? -1) === 0,
    "Demo off: parsedMetrics is empty array (no fake clinical values)"
  );
  assert(
    resultDemoOff.data?.plainSummary === "Could not read this report",
    "Demo off: plainSummary is exactly 'Could not read this report'"
  );
  assert(
    resultDemoOff.data?.rawOcrText === "",
    "Demo off: rawOcrText is empty string"
  );

  // --- TEST GROUP 2: Gemini Report Parsing with DEMO_MODE ON ---
  console.log("\n--- Test Group 2: Gemini Report Parsing (DEMO_MODE ON) ---");
  process.env.DEMO_MODE = "true";

  const resultDemoOn = await parseGeminiReport({
    userId: "patient_test_2",
    fileName: "sample_cbc.pdf",
  });

  assert(
    resultDemoOn.data?.status === "ok",
    "Demo on: status is 'ok' for sample demo output"
  );
  assert(
    Boolean(resultDemoOn.data?.plainSummary?.includes("Sample data, not a real result")),
    "Demo on: plainSummary is visibly labelled 'Sample data, not a real result'"
  );
  assert(
    Boolean(resultDemoOn.data?.rawOcrText?.includes("Sample data, not a real result")),
    "Demo on: rawOcrText is visibly labelled 'Sample data, not a real result'"
  );

  // Reset demo mode
  delete process.env.DEMO_MODE;

  // --- TEST GROUP 3: Overpass OSM Mapping & Emergency Tagging ---
  console.log("\n--- Test Group 3: Overpass OSM Mapping & Emergency Capability ---");

  // Element with no phone and emergency=yes
  const mockOsmElements = [
    {
      type: "node" as const,
      id: 101,
      lat: 12.9716,
      lon: 77.5946,
      tags: {
        name: "St. John Trauma Center",
        amenity: "hospital",
        emergency: "yes",
      } as Record<string, string>,
    },
    {
      type: "node" as const,
      id: 102,
      lat: 12.972,
      lon: 77.595,
      tags: {
        name: "Indiranagar Community Clinic",
        amenity: "clinic",
        phone: "+91 80 1234 5678",
      } as Record<string, string>,
    },
    {
      type: "way" as const,
      id: 103,
      lat: 12.973,
      lon: 77.596,
      tags: {
        name: "City Dental Care",
        amenity: "doctors",
        emergency: "no",
      } as Record<string, string>,
    },
  ];

  const mapped = mapOverpassElementsToHospitals(mockOsmElements, 12.9716, 77.5946);

  assert(mapped.length === 3, "Mapped exactly 3 OSM elements");

  // Check Hospital 1: emergency=yes, no phone
  assert(
    mapped[0].isEmergency === true,
    "Hospital 1: isEmergency is true only because source tag emergency=yes"
  );
  assert(
    mapped[0].emergencyCapability === "confirmed",
    "Hospital 1: emergencyCapability is 'confirmed'"
  );
  assert(
    mapped[0].phone === undefined,
    "Hospital 1: phone is undefined when tag is absent (NO placeholder phone '+91 80 2345 6789')"
  );

  // Check Hospital 2: emergency tag absent, valid phone
  assert(
    mapped[1].isEmergency === false,
    "Hospital 2: isEmergency is false when source has no emergency=yes tag"
  );
  assert(
    mapped[1].emergencyCapability === "unconfirmed",
    "Hospital 2: emergencyCapability is 'unconfirmed'"
  );
  assert(
    mapped[1].phone === "+91 80 1234 5678",
    "Hospital 2: phone preserves exact source tag value"
  );

  // Check Hospital 3: emergency=no
  assert(
    mapped[2].isEmergency === false,
    "Hospital 3: isEmergency is false when emergency=no"
  );
  assert(
    mapped[2].emergencyCapability === "unavailable",
    "Hospital 3: emergencyCapability is 'unavailable'"
  );

  // --- TEST GROUP 4: Overpass Lookup Failure / Empty Handling ---
  console.log("\n--- Test Group 4: Overpass Offline / Empty Lookup Handling ---");

  // Empty elements mapping
  const emptyMapped = mapOverpassElementsToHospitals([], 12.9716, 77.5946);
  assert(
    emptyMapped.length === 0,
    "Empty OSM elements produces empty hospital list (NO invented fallback hospitals)"
  );

  // --- TEST GROUP 5: Clinician Clearance Action Stub ---
  console.log("\n--- Test Group 5: Explicit Clinician Clearance Action ---");

  try {
    // Attempting clearance without clinician ID should throw
    await createClinicianClearance({
      clinicianId: "",
      patientId: "patient_1",
      title: "CBC Review",
      notes: "Clear",
    });
    assert(false, "Clearance without clinicianId should have thrown an error");
  } catch (err: any) {
    assert(
      err.message.includes("clinician action recorded with their clinician ID"),
      "Clearance without clinicianId strictly rejected"
    );
  }

  const validClearance = await createClinicianClearance({
    clinicianId: "DOC_NMC_94821",
    patientId: "patient_1",
    title: "CBC Recovery Review",
    notes: "Patient inflammatory markers reviewed and cleared.",
  });
  assert(
    validClearance.curedDoctorName === "DOC_NMC_94821",
    "Valid clearance explicitly records verified clinician ID"
  );

  console.log(`\n=================================================`);
  console.log(`🎉 ALL ${passed}/${total} PR 1 INTEGRITY TESTS PASSED!`);
  console.log(`=================================================\n`);
}

runPR1IntegrityTests();
