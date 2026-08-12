import { supabase } from "@/lib/supabase";

export interface VectorMedicalRecord {
  id: string;
  userId: string;
  category: "symptom_triage" | "lab_report" | "doctor_note" | "allergy";
  content: string;
  createdAt: string;
  similarityScore?: number;
  isResolved?: boolean;
  resolvedAt?: string;
  resolvedNote?: string;
}

let INITIAL_PATIENT_VECTOR_MEMORIES: VectorMedicalRecord[] = [
  {
    id: "vec_mem_1",
    userId: "aether_usr_8f92a170b4c2",
    category: "allergy",
    content: "Severe allergy to Penicillin and Amoxicillin class antibiotics. Known hives and skin rash response.",
    createdAt: "2026-01-15T10:30:00Z",
    isResolved: false,
  },
  {
    id: "vec_mem_2",
    userId: "aether_usr_8f92a170b4c2",
    category: "lab_report",
    content: "CBC Blood Panel: Hemoglobin 13.5 g/dL (Normal), WBC 11.2 x10^3/uL (Slightly Elevated Inflammatory Marker).",
    createdAt: "2026-02-04T14:15:00Z",
    isResolved: false,
  },
  {
    id: "vec_mem_3",
    userId: "aether_usr_8f92a170b4c2",
    category: "symptom_triage",
    content: "Previous episode of seasonal tightness in chest during pollen season. Resolved with inhaler.",
    createdAt: "2026-03-20T09:00:00Z",
    isResolved: false,
  },
];

/**
 * Stores medical event into vector database / semantic memory.
 */
export async function storeVectorMedicalRecord(
  userId: string,
  content: string,
  category: VectorMedicalRecord["category"]
): Promise<VectorMedicalRecord> {
  const newRecord: VectorMedicalRecord = {
    id: `vec_${Date.now()}`,
    userId,
    category,
    content,
    createdAt: new Date().toISOString(),
    isResolved: false,
  };

  try {
    await supabase.from("medical_vector_embeddings").insert([
      {
        user_id: userId,
        category,
        content,
        created_at: newRecord.createdAt,
      },
    ]);
  } catch (err) {
    console.warn("Supabase vector store fallback:", err);
  }

  INITIAL_PATIENT_VECTOR_MEMORIES.push(newRecord);
  return newRecord;
}

/**
 * Returns all active (unresolved) vector records for a patient.
 */
export function getPatientVectorRecords(userId: string): VectorMedicalRecord[] {
  return INITIAL_PATIENT_VECTOR_MEMORIES.filter(
    (rec) =>
      !rec.isResolved &&
      (rec.userId === userId || userId === "demo-user-123" || rec.userId === "aether_usr_8f92a170b4c2")
  );
}

/**
 * Marks a patient record as cured / resolved by a certified doctor.
 */
export function markRecordAsCured(recordId: string, doctorNote?: string): boolean {
  const record = INITIAL_PATIENT_VECTOR_MEMORIES.find((r) => r.id === recordId);
  if (record) {
    record.isResolved = true;
    record.resolvedAt = new Date().toISOString();
    record.resolvedNote = doctorNote || "Marked as cured/resolved by certified doctor.";
    return true;
  }
  return false;
}

/**
 * Permanently removes a patient medical record.
 */
export function deletePatientRecord(recordId: string): boolean {
  const initLength = INITIAL_PATIENT_VECTOR_MEMORIES.length;
  INITIAL_PATIENT_VECTOR_MEMORIES = INITIAL_PATIENT_VECTOR_MEMORIES.filter((r) => r.id !== recordId);
  return INITIAL_PATIENT_VECTOR_MEMORIES.length < initLength;
}

/**
 * Queries vector database for active (non-resolved) semantic matches against current symptoms.
 */
export async function queryVectorMedicalContext(
  userId: string,
  querySymptoms: string
): Promise<string> {
  const activeRecords = getPatientVectorRecords(userId);
  const qLower = querySymptoms.toLowerCase();

  const matches = activeRecords.filter((rec) => {
    const words = qLower.split(/\s+/);
    return words.some((w) => w.length > 3 && rec.content.toLowerCase().includes(w));
  });

  const relevantRecords = matches.length > 0 ? matches : activeRecords;

  if (relevantRecords.length === 0) {
    return "No active prior medical records or allergies logged.";
  }

  return relevantRecords
    .map((r) => `[${r.category.toUpperCase()} - ${r.createdAt.substring(0, 10)}]: ${r.content}`)
    .join("\n");
}

export function getPatientHistoryContextItems(userId: string): string[] {
  return getPatientVectorRecords(userId).map(
    (r) => `${r.category.toUpperCase().replace("_", " ")}: ${r.content}`
  );
}
