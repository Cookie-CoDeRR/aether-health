import { runTriageChat, parseReport } from "../services/gcp/vertexAI";
import { STANDARD_DISCLAIMER } from "../types/disclaimers";

async function runVertexAIAcceptanceTests() {
  console.log("=== Running Vertex AI Service Layer Acceptance Tests ===");

  // Test 1: runTriageChat with low urgency symptoms
  console.log("\n[Test 1] runTriageChat (low urgency)");
  const triageLow = await runTriageChat({
    userId: "user_vertex_1",
    symptoms: "Mild fatigue and dry throat",
  });

  if (
    triageLow.status === 200 &&
    triageLow.disclaimer === STANDARD_DISCLAIMER &&
    triageLow.data?.urgencyLevel === "low" &&
    triageLow.data?.status === "ok"
  ) {
    console.log("✅ Test 1 Passed: runTriageChat routed through safetyMiddleware and returned low urgency output.");
  } else {
    console.error("❌ Test 1 Failed", triageLow);
    process.exit(1);
  }

  // Test 2: runTriageChat with high_critical urgency symptoms
  console.log("\n[Test 2] runTriageChat (high_critical urgency)");
  const triageHigh = await runTriageChat({
    userId: "user_vertex_2",
    symptoms: "Severe chest pain radiating to left arm",
  });

  if (
    triageHigh.status === 200 &&
    triageHigh.disclaimer === STANDARD_DISCLAIMER &&
    triageHigh.emergencyGuidance !== null &&
    triageHigh.data?.urgencyLevel === "high_critical"
  ) {
    console.log("✅ Test 2 Passed: High-critical triage response returned emergency guidance block.");
  } else {
    console.error("❌ Test 2 Failed", triageHigh);
    process.exit(1);
  }

  // Test 3: parseReport
  console.log("\n[Test 3] parseReport");
  const reportRes = await parseReport({
    userId: "user_vertex_3",
    fileName: "blood_work_cbc_2026.pdf",
  });

  if (
    reportRes.status === 200 &&
    reportRes.disclaimer === STANDARD_DISCLAIMER &&
    reportRes.data?.parseStatus === "ok" &&
    reportRes.data?.parsedMetrics.length > 0
  ) {
    console.log("✅ Test 3 Passed: parseReport routed through safetyMiddleware and returned structured metrics.");
  } else {
    console.error("❌ Test 3 Failed", reportRes);
    process.exit(1);
  }

  console.log("\n🎉 ALL VERTEX AI ACCEPTANCE TESTS PASSED!");
}

runVertexAIAcceptanceTests();
