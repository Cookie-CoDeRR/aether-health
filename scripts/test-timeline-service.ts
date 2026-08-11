import { getHealthTimeline } from "../services/domain/timelineService";

async function runTimelineServiceAcceptanceTests() {
  console.log("=== Running Health Timeline Acceptance Tests ===");

  const timeline = await getHealthTimeline("demo-user-123");

  console.log(`Fetched ${timeline.length} total timeline entries`);

  const symptomEntries = timeline.filter((e) => e.type === "symptom_log");
  const reportEntries = timeline.filter((e) => e.type === "report");
  const appointmentEntries = timeline.filter((e) => e.type === "appointment");

  console.log(`- Symptom Logs: ${symptomEntries.length}`);
  console.log(`- Lab Reports: ${reportEntries.length}`);
  console.log(`- Appointments: ${appointmentEntries.length}`);

  // Test 1: Check presence of all 3 data sources
  if (symptomEntries.length > 0 && reportEntries.length > 0 && appointmentEntries.length > 0) {
    console.log("✅ Test 1 Passed: Timeline merged records from all 3 data sources (SymptomLog, Report, Appointment).");
  } else {
    console.error("❌ Test 1 Failed: Missing records from one or more data sources.", {
      symptomEntries,
      reportEntries,
      appointmentEntries,
    });
    process.exit(1);
  }

  // Test 2: Check strict descending chronological sorting
  let isSorted = true;
  for (let i = 0; i < timeline.length - 1; i++) {
    if (timeline[i].timestamp.getTime() < timeline[i + 1].timestamp.getTime()) {
      isSorted = false;
      break;
    }
  }

  if (isSorted) {
    console.log("✅ Test 2 Passed: Timeline entries are strictly sorted by timestamp descending.");
  } else {
    console.error("❌ Test 2 Failed: Timeline entries are not sorted descending.", timeline);
    process.exit(1);
  }

  console.log("\n🎉 ALL TIMELINE ACCEPTANCE TESTS PASSED!");
}

runTimelineServiceAcceptanceTests();
