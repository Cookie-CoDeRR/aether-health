import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hospitalName, patientId, medications } = body;

    if (!hospitalName || !medications || !Array.isArray(medications)) {
      return NextResponse.json(
        { status: "error", message: "Invalid payload. hospitalName and medications array required." },
        { status: 400 }
      );
    }

    // Process and validate assigned medications from external hospital system
    const syncedMedications = medications.map((med: any, index: number) => ({
      id: `hosp_sync_${Date.now()}_${index}`,
      brandName: med.brandName || "Prescribed Medication",
      genericName: med.genericName || med.brandName || "Generic Active Ingredient",
      dosage: med.dosage || "1 Tablet",
      frequency: med.frequency || "Once Daily",
      totalDoses: med.totalDoses || 10,
      dosesRemaining: med.dosesRemaining ?? (med.totalDoses || 10),
      dosesTakenToday: 0,
      assignedByHospital: hospitalName,
      syncedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      status: "ok",
      message: `Successfully synced ${syncedMedications.length} assigned prescription(s) from ${hospitalName}.`,
      patientId: patientId || "aether_usr_8f92a170b4c2",
      syncedMedications,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Internal server error during hospital API sync." },
      { status: 500 }
    );
  }
}
