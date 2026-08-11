import { processSafetyMiddleware, resetRateLimiter } from "../middleware/safetyMiddleware";
import { STANDARD_DISCLAIMER } from "../types/disclaimers";

function runAcceptanceTests() {
  console.log("=== Running Safety Middleware Acceptance Tests ===");

  resetRateLimiter();

  // Test 1: Low Urgency Response
  console.log("\n[Test 1] Low Urgency Response");
  const lowResult = processSafetyMiddleware({
    userId: "user_test_1",
    promptText: "I have a mild headache",
    urgencyLevel: "low",
    rawResponseData: { response: "Rest and drink plenty of water." },
  });

  if (
    lowResult.status === 200 &&
    lowResult.disclaimer === STANDARD_DISCLAIMER &&
    lowResult.emergencyGuidance === null
  ) {
    console.log("✅ Test 1 Passed: Low urgency response correctly received disclaimer and no emergency block.");
  } else {
    console.error("❌ Test 1 Failed", lowResult);
    process.exit(1);
  }

  // Test 2: High Critical Response
  console.log("\n[Test 2] High Critical Response");
  const highResult = processSafetyMiddleware({
    userId: "user_test_2",
    promptText: "Chest pain and difficulty breathing",
    urgencyLevel: "high_critical",
    rawResponseData: { response: "Seek emergency care immediately." },
  });

  if (
    highResult.status === 200 &&
    highResult.disclaimer === STANDARD_DISCLAIMER &&
    highResult.emergencyGuidance &&
    highResult.emergencyGuidance.title.length > 0
  ) {
    console.log("✅ Test 2 Passed: High critical response received emergency block and disclaimer.");
  } else {
    console.error("❌ Test 2 Failed", highResult);
    process.exit(1);
  }

  // Test 3: Rate Limiter (20 requests pass, 21st fails with 429)
  console.log("\n[Test 3] Rate Limiter 20 req/min limit");
  const userId = "user_test_rate_limit";

  for (let i = 1; i <= 20; i++) {
    const res = processSafetyMiddleware({
      userId,
      promptText: `Query ${i}`,
      urgencyLevel: "low",
      rawResponseData: { count: i },
    });
    if (res.status !== 200) {
      console.error(`❌ Test 3 Failed: Request ${i} was rejected prematurely.`, res);
      process.exit(1);
    }
  }

  // 21st request
  const res21 = processSafetyMiddleware({
    userId,
    promptText: "Query 21",
    urgencyLevel: "low",
    rawResponseData: { count: 21 },
  });

  if (res21.status === 429 && res21.error?.code === "RATE_LIMIT_EXCEEDED") {
    console.log("✅ Test 3 Passed: 21st request from same user returned 429 Rate Limit Exceeded.");
  } else {
    console.error("❌ Test 3 Failed: 21st request did not receive expected 429 status.", res21);
    process.exit(1);
  }

  console.log("\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY!");
}

runAcceptanceTests();
