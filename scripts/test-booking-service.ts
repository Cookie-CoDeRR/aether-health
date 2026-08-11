import { getDoctorsList, createBooking } from "../services/domain/bookingService";

async function runBookingServiceAcceptanceTests() {
  console.log("=== Running Doctor Discovery & Booking Acceptance Tests ===");

  // Test 1: getDoctorsList
  console.log("\n[Test 1] getDoctorsList");
  const doctors = await getDoctorsList();
  console.log(`Fetched ${doctors.length} doctors`);

  const cardiologyDocs = doctors.filter((d) => d.specialty === "Cardiology");
  if (doctors.length > 0 && cardiologyDocs.length >= 1) {
    console.log("✅ Test 1 Passed: Doctor list loaded and filterable by specialty.");
  } else {
    console.error("❌ Test 1 Failed", doctors);
    process.exit(1);
  }

  // Test 2: createBooking -> returns Appointment object with status 'requested' and mocked: true
  console.log("\n[Test 2] createBooking");
  const booking = await createBooking({
    userId: "user_test_booking",
    doctorId: "doc_1",
    slotTime: new Date(),
    notes: "Follow-up consultation",
  });

  if (
    booking.id &&
    booking.status === "requested" &&
    booking.mocked === true &&
    booking.doctorId === "doc_1"
  ) {
    console.log("✅ Test 2 Passed: Booking returned Appointment record with status='requested' and mocked=true.");
  } else {
    console.error("❌ Test 2 Failed", booking);
    process.exit(1);
  }

  console.log("\n🎉 ALL BOOKING ACCEPTANCE TESTS PASSED!");
}

runBookingServiceAcceptanceTests();
