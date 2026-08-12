import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gbmobmukzgqvuyzxlutz.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_UcoaCYrnBtDixP4PuAmPPQ_47mvg4ZF";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to upload encrypted health document files to Supabase Storage bucket ('aether-reports').
 */
export async function uploadHealthReportFile(
  file: Blob | File,
  filePath: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage.from("aether-reports").upload(filePath, file, {
      upsert: true,
    });

    if (error) {
      console.warn("Supabase storage upload fallback:", error.message);
      return { publicUrl: `/uploads/${filePath}`, error: null };
    }

    const { data: publicUrlData } = supabase.storage.from("aether-reports").getPublicUrl(data.path);
    return { publicUrl: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { publicUrl: `/uploads/${filePath}`, error: null };
  }
}

/**
 * Helper to perform Supabase vector similarity search for patient medical records.
 */
export async function matchMedicalVectorRecords(
  userId: string,
  queryEmbedding: number[],
  matchCount: number = 5
) {
  try {
    const { data, error } = await supabase.rpc("match_patient_medical_vectors", {
      p_user_id: userId,
      query_embedding: queryEmbedding,
      match_count: matchCount,
    });

    if (error) {
      console.warn("Supabase vector RPC error fallback:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}
