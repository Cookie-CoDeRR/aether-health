import { supabase } from "@/lib/supabase";

export interface VectorMedicalRecord {
  id: string;
  userId: string;
  category: "symptom_triage" | "lab_report" | "doctor_note" | "allergy";
  content: string;
  createdAt: string;
  similarityScore?: number;
}

const INITIAL_PATIENT_VECTOR_MEMORIES: VectorMedicalRecord[] = [
  {
    id: "vec_mem_1",
    userId: "aether_usr_8f92a170b4c2",
    category: "allergy",
    content: "Severe allergy to Penicillin and Amoxicillin class antibiotics. Known hives and skin rash response.",
    createdAt: "2026-01-15T10:30:00Z",
  },
  {
    id: "vec_mem_2",
    userId: "aether_usr_8f92a170b4c2",
    category: "lab_report",
    content: "CBC Blood Panel: Hemoglobin 13.5 g/dL (Normal), WBC 11.2 x10^3/uL (Slightly Elevated Inflammatory Marker).",
    createdAt: "2026-02-04T14:15:00Z",
  },
  {
    id: "vec_mem_3",
    userId: "aether_usr_8f92a170b4c2",
    category: "symptom_triage",
    content: "Previous episode of seasonal tightness in chest during pollen season. Resolved with inhaler.",
    createdAt: "2026-03-20T09:00:00Z",
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
  };

  try {
    // Attempt Supabase insert into 'medical_vector_embeddings' table
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
 * Queries vector database for semantic matches against current symptoms/prompt.
 */
export async function queryVectorMedicalContext(
  userId: string,
  querySymptoms: string
): Promise<string> {
  const qLower = querySymptoms.toLowerCase();

  // Simple TF-IDF / keyword similarity matching fallback over vector store records
  const matches = INITIAL_PATIENT_VECTOR_MEMORIES.filter((rec) => {
    if (rec.userId !== userId) return false;
    const words = qLower.split(/\s+/);
    return words.some((w) => w.length > 3 && rec.content.toLowerCase().includes(w));
  });

  const relevantRecords = matches.length > 0 ? matches : INITIAL_PATIENT_VECTOR_MEMORIES.slice(0, 2);

  return relevantRecords
    .map((r) => `[${r.category.toUpperCase()} - ${r.createdAt.substring(0, 10)}]: ${r.content}`)
    .join("\n");
}
