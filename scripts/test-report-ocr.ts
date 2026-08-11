import { analyzeReport } from "../services/domain/ocrService";

async function runReportOCRAcceptanceTests() {
  console.log("=== Running Report OCR Analysis Acceptance Tests ===");

  const fileInput = { userId: "user_ocr_1", fileName: "lab_results_2026.pdf" };

  // Test 1: parseStatus = 'ok'
  console.log("\n[Test 1] parseStatus = 'ok'");
  const resOk = await analyzeReport(fileInput, "ok");
  if (resOk.status === 200 && resOk.data?.parseStatus === "ok" && resOk.data?.parsedMetrics.length > 0) {
    console.log("✅ Test 1 Passed: 'ok' status returns metrics table and plain summary.");
  } else {
    console.error("❌ Test 1 Failed", resOk);
    process.exit(1);
  }

  // Test 2: parseStatus = 'low_confidence'
  console.log("\n[Test 2] parseStatus = 'low_confidence'");
  const resLowConf = await analyzeReport(fileInput, "low_confidence");
  if (resLowConf.status === 200 && resLowConf.data?.parseStatus === "low_confidence") {
    console.log("✅ Test 2 Passed: 'low_confidence' status returned distinct status badge.");
  } else {
    console.error("❌ Test 2 Failed", resLowConf);
    process.exit(1);
  }

  // Test 3: parseStatus = 'failed'
  console.log("\n[Test 3] parseStatus = 'failed'");
  const resFailed = await analyzeReport(fileInput, "failed");
  if (resFailed.data?.parseStatus === "failed" && resFailed.data?.parsedMetrics.length === 0) {
    console.log("✅ Test 3 Passed: 'failed' status returned empty metrics and failed parseStatus.");
  } else {
    console.error("❌ Test 3 Failed", resFailed);
    process.exit(1);
  }

  console.log("\n🎉 ALL REPORT OCR ACCEPTANCE TESTS PASSED!");
}

runReportOCRAcceptanceTests();
