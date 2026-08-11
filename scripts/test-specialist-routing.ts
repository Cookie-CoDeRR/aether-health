import { suggestSpecialties } from "../services/domain/triageService";

function runSpecialistRoutingAcceptanceTests() {
  console.log("=== Running Specialist Routing Acceptance Tests ===");

  // Test 1: Low-confidence input (<80%) -> must return >= 2 specialties
  console.log("\n[Test 1] Low-confidence symptoms (fever and cough)");
  const lowConfSuggestions = suggestSpecialties("Fever and persistent dry cough");

  const topScoreLow = Math.max(...lowConfSuggestions.map((s) => s.confidenceScore));
  console.log(`Top confidence score: ${Math.round(topScoreLow * 100)}%`);
  console.log(`Suggestions returned: ${lowConfSuggestions.length}`);

  if (topScoreLow < 0.80 && lowConfSuggestions.length >= 2) {
    console.log("✅ Test 1 Passed: Low-confidence symptoms returned >= 2 specialty suggestions.");
  } else {
    console.error("❌ Test 1 Failed: Low confidence must return at least 2 suggestions.", lowConfSuggestions);
    process.exit(1);
  }

  // Test 2: High-confidence input (>=80%) -> cardiology / chest pain
  console.log("\n[Test 2] High-confidence symptoms (chest pain)");
  const highConfSuggestions = suggestSpecialties("Severe chest pain and heart palpitations");

  const topScoreHigh = Math.max(...highConfSuggestions.map((s) => s.confidenceScore));
  console.log(`Top confidence score: ${Math.round(topScoreHigh * 100)}%`);
  console.log(`Suggestions returned: ${highConfSuggestions.length}`);

  if (topScoreHigh >= 0.80 && highConfSuggestions.length >= 1) {
    console.log("✅ Test 2 Passed: High-confidence symptoms returned primary specialty suggestion.");
  } else {
    console.error("❌ Test 2 Failed", highConfSuggestions);
    process.exit(1);
  }

  console.log("\n🎉 ALL SPECIALIST ROUTING ACCEPTANCE TESTS PASSED!");
}

runSpecialistRoutingAcceptanceTests();
