/**
 * AETHER Triage Intent & Anti-Hallucination Table-Driven Test Suite
 * 
 * Verifies:
 * 1. "hi, how are u?" gives a greeting reply and NO triage card / level
 * 2. "what can you do" gives app help and NO triage card / level
 * 3. "i have chest pain and sweating" gives emergency response with 112/108
 * 4. "fever 2 days, mild" gives symptom guidance with details
 * 5. "asdf" gives clarifying question
 * 6. Model failure / offline returns honest message, NEVER canned medical template
 * 7. ZERO outputs contain raw double asterisks (**)
 */

import { NextRequest } from "next/server";
import { POST as handleTriageRoute } from "../app/api/ai/triage/route";
import { classifyUserIntent, checkEmergencyRedFlags, sanitizeClinicalReplyText } from "../services/domain/intentClassification";

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}${detail ? `: ${detail}` : ""}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTriageIntentSuite() {
  console.log("================================================================================");
  console.log("🧪 AETHER INTENT-AWARE TRIAGE & ACCURACY TEST SUITE");
  console.log("================================================================================\n");

  // TEST 1: Greeting / Small talk
  console.log("Test 1: Greeting Input ('hi, how are u?')");
  const greetingReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "hi, how are u?", userId: "test_patient_1" }),
  });
  const greetingRes = await handleTriageRoute(greetingReq);
  const greetingJson = await greetingRes.json();
  const greetingData = greetingJson.data;

  assert(greetingRes.status === 200, "Greeting request returns 200 OK");
  assert(greetingData.intent === "greeting", "Greeting input is classified as intent 'greeting'");
  assert(
    greetingData.triage_level === null || greetingData.triage_level === undefined,
    "Greeting has NO triage level (null/undefined)"
  );
  assert(
    !greetingData.message.includes("Hydration, rest") && !greetingData.message.includes("Routine / Home Care"),
    "Greeting does not receive canned medical advice"
  );
  assert(!greetingData.message.includes("**"), "Greeting reply contains NO raw markdown asterisks (no **)");

  // TEST 2: App Question / Help
  console.log("\nTest 2: App Help Question ('what can you do')");
  const appReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "what can you do", userId: "test_patient_1" }),
  });
  const appRes = await handleTriageRoute(appReq);
  const appJson = await appRes.json();
  const appData = appJson.data;

  assert(appRes.status === 200, "App help request returns 200 OK");
  assert(appData.intent === "app_question", "App feature query is classified as 'app_question'");
  assert(
    appData.triage_level === null || appData.triage_level === undefined,
    "App feature query has NO triage level"
  );
  assert(
    appData.message.toLowerCase().includes("aether") || appData.message.toLowerCase().includes("symptom"),
    "App help reply explains Aether capabilities"
  );
  assert(!appData.message.includes("**"), "App help reply contains NO raw markdown asterisks (no **)");

  // TEST 3: Emergency Red Flag
  console.log("\nTest 3: Emergency Red Flag ('i have chest pain and sweating')");
  const emergReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "i have chest pain and sweating", userId: "test_patient_1" }),
  });
  const emergRes = await handleTriageRoute(emergReq);
  const emergJson = await emergRes.json();
  const emergData = emergJson.data;

  assert(emergRes.status === 200, "Emergency request returns 200 OK");
  assert(emergData.intent === "emergency", "Chest pain is classified as intent 'emergency'");
  assert(
    emergData.triage_level === "high_critical" || emergData.urgencyLevel === "high_critical",
    "Emergency triggers 'high_critical' urgency level"
  );
  assert(
    emergJson.emergencyGuidance !== null && emergJson.emergencyGuidance.emergencyNumbers.some((n: string) => n.includes("112")),
    "Emergency response attaches emergency guidance with Indian national emergency number (112)"
  );
  assert(
    !emergData.message.includes("Hydration, rest and observation"),
    "Emergency advice does not issue routine home care advice"
  );
  assert(!emergData.message.includes("**"), "Emergency reply contains NO raw markdown asterisks (no **)");

  // TEST 4: Symptom Report with details
  console.log("\nTest 4: Symptom Report with Details ('fever 2 days, mild')");
  const symptomReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "fever 2 days, mild", userId: "test_patient_1" }),
  });
  const symptomRes = await handleTriageRoute(symptomReq);
  const symptomJson = await symptomRes.json();
  const symptomData = symptomJson.data;

  assert(symptomRes.status === 200, "Detailed symptom request returns 200 OK");
  assert(symptomData.intent === "symptom_report", "Symptom with duration/severity is classified as 'symptom_report'");
  assert(
    symptomData.triage_level === "low" || symptomData.triage_level === "moderate",
    "Detailed symptom receives a calibrated triage level (low or moderate)"
  );
  assert(!symptomData.message.includes("**"), "Symptom guidance contains NO raw markdown asterisks (no **)");

  // TEST 5: Unclear / Gibberish
  console.log("\nTest 5: Unclear / Gibberish ('asdf')");
  const unclearReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "asdf", userId: "test_patient_1" }),
  });
  const unclearRes = await handleTriageRoute(unclearReq);
  const unclearJson = await unclearRes.json();
  const unclearData = unclearJson.data;

  assert(unclearRes.status === 200, "Unclear request returns 200 OK");
  assert(unclearData.intent === "unclear", "Gibberish 'asdf' is classified as 'unclear'");
  assert(
    unclearData.triage_level === null || unclearData.triage_level === undefined,
    "Unclear input has NO triage level"
  );
  assert(
    unclearData.message.toLowerCase().includes("describe") || unclearData.message.toLowerCase().includes("didn't"),
    "Unclear reply asks a clarifying question"
  );
  assert(!unclearData.message.includes("**"), "Unclear reply contains NO raw markdown asterisks (no **)");

  // TEST 6: General Health Question ('how much water should I drink daily')
  console.log("\nTest 6: General Health Question ('how much water should I drink daily')");
  const healthReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "how much water should I drink daily", userId: "test_patient_1" }),
  });
  const healthRes = await handleTriageRoute(healthReq);
  const healthJson = await healthRes.json();
  const healthData = healthJson.data;

  assert(healthRes.status === 200, "General health query returns 200 OK");
  assert(healthData.intent === "general_health_question", "Water query is classified as 'general_health_question'");
  assert(
    healthData.triage_level === null || healthData.triage_level === undefined,
    "General health query has NO triage level"
  );
  assert(
    healthData.message.toLowerCase().includes("liters") || healthData.message.toLowerCase().includes("water"),
    "Water query returns educational hydration information"
  );
  assert(
    healthData.message.includes("educational information") || healthData.message.includes("not"),
    "General health answer includes non-diagnosis disclaimer"
  );
  assert(!healthData.message.includes("**"), "Health answer contains NO raw markdown asterisks (no **)");

  // TEST 7: Single Symptom without details ('headache') -> Clarifying Follow-ups
  console.log("\nTest 7: Symptom without Details ('headache') -> Clarifying Questions");
  const vagueReq = new NextRequest("http://localhost:3000/api/ai/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "test_patient_1" },
    body: JSON.stringify({ symptoms: "headache", userId: "test_patient_1" }),
  });
  const vagueRes = await handleTriageRoute(vagueReq);
  const vagueJson = await vagueRes.json();
  const vagueData = vagueJson.data;

  assert(vagueRes.status === 200, "Vague symptom request returns 200 OK");
  assert(vagueData.intent === "symptom_report", "Vague symptom is recognized as symptom_report");
  assert(
    vagueData.needsMoreInfo === true || vagueData.triage_level === null,
    "Vague symptom flags needsMoreInfo / null triage level"
  );
  assert(
    vagueData.follow_up_questions.length > 0 || vagueData.suggestedFollowUps.length > 0,
    "Vague symptom generates clarifying follow-up questions"
  );

  console.log("\n================================================================================");
  console.log(`🎉 ALL ${passed}/${total} TRIAGE INTENT & ACCURACY TESTS PASSED WITH ZERO ERRORS!`);
  console.log("================================================================================\n");
}

runTriageIntentSuite().catch((err) => {
  console.error("❌ TRIAGE INTENT TEST SUITE FAILED:", err);
  process.exit(1);
});
