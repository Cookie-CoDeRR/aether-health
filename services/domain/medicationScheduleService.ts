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

export function getTodayAssignedMedications(userId: string): DailyMedicationItem[] {
  return [...TODAY_ASSIGNED_MEDICATIONS];
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
  const newItem: DailyMedicationItem = {
    ...params,
    id: `sched_${Date.now()}`,
    isTaken: false,
    allergySafeWarning: params.brandName.toLowerCase().includes("amox") || params.brandName.toLowerCase().includes("penic")
      ? "⚠️ WARNING: Patient has Penicillin Allergy!"
      : "Non-Penicillin • Safe for patient",
  };
  TODAY_ASSIGNED_MEDICATIONS.push(newItem);
  return newItem;
}
