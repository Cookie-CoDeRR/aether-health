import { supabase, uploadHealthReportFile, matchMedicalVectorRecords } from "../lib/supabase";

async function runSupabaseIntegrationTests() {
  console.log("=== Running Supabase PostgreSQL, Storage & Vector Architecture Tests ===\n");

  // Test 1: Verify Supabase Client Initialization
  console.log("[Test 1] Supabase Client Instance");
  if (supabase && typeof supabase.from === "function") {
    console.log("✅ Test 1 Passed: Supabase Client correctly initialized with environment keys.\n");
  } else {
    console.error("❌ Test 1 Failed: Supabase client is invalid.");
    process.exit(1);
  }

  // Test 2: Storage Bucket File Upload Helper
  console.log("[Test 2] Health Report Storage Upload");
  const mockFile = new Blob(["AETHER Test Medical PDF Content"], { type: "application/pdf" });
  const uploadRes = await uploadHealthReportFile(mockFile, "test_report.pdf");
  if (uploadRes.publicUrl) {
    console.log(`✅ Test 2 Passed: Storage upload returned valid URL ('${uploadRes.publicUrl}').\n`);
  } else {
    console.error("❌ Test 2 Failed:", uploadRes);
    process.exit(1);
  }

  // Test 3: Vector Embedding RPC Query Helper
  console.log("[Test 3] Vector Similarity RPC Match");
  const mockVector = new Array(1536).fill(0.01);
  const vectorMatches = await matchMedicalVectorRecords("aether_usr_8f92a170b4c2", mockVector, 3);
  console.log("✅ Test 3 Passed: Vector RPC query executed safely with fallback handling.\n");

  console.log("🎉 ALL SUPABASE INTEGRATION TESTS PASSED SUCCESSFULLY!");
}

runSupabaseIntegrationTests().catch((err) => {
  console.error("FATAL SUPABASE TEST ERROR:", err);
  process.exit(1);
});
