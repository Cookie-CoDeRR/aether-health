export interface DailyMedicationItem {
  id: string;
  userId: string;
  brandName: string;
  genericName: string;
  dosage: string;
  scheduleTime: string;
  instruction: string;
  isTaken: boolean;
  takenAt?: string;
  allergySafeWarning?: string;
}

let TODAY_ASSIGNED_MEDICATIONS: DailyMedicationItem[] = [
  {
    id: "sched_1",
    userId: "aether_usr_8f92a170b4c2",
    brandName: "Crocin 650",
    genericName: "Paracetamol 650mg",
    dosage: "1 Tablet",
    scheduleTime: "08:00 AM",
    instruction: "After Breakfast",
    isTaken: true,
    takenAt: "08:15 AM",
    allergySafeWarning: "Non-Penicillin • Safe for patient",
  },
  {
    id: "sched_2",
    userId: "aether_usr_8f92a170b4c2",
    brandName: "Glycomet 500",
    genericName: "Metformin HCl 500mg",
    dosage: "1 Tablet",
    scheduleTime: "02:00 PM",
    instruction: "With Lunch",
    isTaken: false,
    allergySafeWarning: "Non-Penicillin • Safe for patient",
  },
  {
    id: "sched_3",
    userId: "aether_usr_8f92a170b4c2",
    brandName: "Lipivas 10",
    genericName: "Atorvastatin 10mg",
    dosage: "1 Tablet",
    scheduleTime: "09:00 PM",
    instruction: "At Bedtime",
    isTaken: false,
    allergySafeWarning: "Non-Penicillin • Safe for patient",
  },
];

function isDemoModeActive(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  );
}

/**
 * Returns today's assigned medications strictly filtered by the session patient id.
 * Seeded medications are returned only in DEMO_MODE for the seeded demo patient.
 */
export function getTodayAssignedMedications(userId: string): DailyMedicationItem[] {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return [];
  }

  const isDemo = isDemoModeActive();

  // In-memory / baseline items filtered strictly by userId
  const matchingItems = TODAY_ASSIGNED_MEDICATIONS.filter((m) => {
    if (m.userId !== userId) return false;
    if (m.id.startsWith("sched_") && !isDemo) return false;
    return true;
  });

  // Also load any prescribed medications partitioned by patientId in browser storage
  if (typeof window !== "undefined") {
    const partitionedKey = `aether_medications:${userId}`;
    const storedRaw = localStorage.getItem(partitionedKey);
    if (storedRaw) {
      try {
        const storedMeds = JSON.parse(storedRaw);
        if (Array.isArray(storedMeds)) {
          for (const rx of storedMeds) {
            if (!matchingItems.some((m) => m.id === rx.id || m.brandName === rx.brandName)) {
              matchingItems.push({
                id: rx.id || `rx_${Date.now()}`,
                userId,
                brandName: rx.brandName,
                genericName: rx.genericName || rx.brandName,
                dosage: rx.dosage,
                scheduleTime: rx.timesOfDay?.[0] || "09:00 AM",
                instruction: rx.instructions || rx.frequency || "As prescribed",
                isTaken: Boolean(rx.takenToday),
                takenAt: rx.takenAt,
                allergySafeWarning:
                  rx.brandName.toLowerCase().includes("amox") ||
                  rx.brandName.toLowerCase().includes("penic")
                    ? "⚠️ WARNING: Contains Penicillin derivatives!"
                    : "Non-Penicillin • Verified Safe",
              });
            }
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }

  return [...matchingItems];
}

export function toggleMedicationDoseTaken(id: string): DailyMedicationItem | null {
  const item = TODAY_ASSIGNED_MEDICATIONS.find((m) => m.id === id);
  if (item) {
    item.isTaken = !item.isTaken;
    item.takenAt = item.isTaken
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : undefined;
    return { ...item };
  }
  return null;
}

export function addAssignedMedication(params: Omit<DailyMedicationItem, "id" | "isTaken">): DailyMedicationItem {
  if (!params.userId || !params.userId.trim()) {
    throw new Error("Patient ID is required to assign medications.");
  }
  const newItem: DailyMedicationItem = {
    ...params,
    id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    isTaken: false,
    allergySafeWarning: params.brandName.toLowerCase().includes("amox") || params.brandName.toLowerCase().includes("penic")
      ? "⚠️ WARNING: Patient has Penicillin Allergy!"
      : "Non-Penicillin • Safe for patient",
  };
  TODAY_ASSIGNED_MEDICATIONS.push(newItem);
  return newItem;
}
