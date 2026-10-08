import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gbmobmukzgqvuyzxlutz.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_UcoaCYrnBtDixP4PuAmPPQ_47mvg4ZF";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PRIVATE_REPORTS_BUCKET = "aether-reports-private";

/**
 * Uploads a health document to the PRIVATE Supabase Storage bucket.
 * Never fabricates a fake path on error; surfaces failures honestly.
 */
export async function uploadHealthReportFile(
  file: Blob | File,
  filePath: string,
  userId?: string
): Promise<{ signedUrl: string | null; filePath: string | null; error: string | null }> {
  try {
    if (!file || !filePath) {
      return { signedUrl: null, filePath: null, error: "File and destination path are required." };
    }

    // Sanitize and prefix with userId if provided to enforce ownership isolation
    const securePath = userId
      ? `${userId.replace(/[^a-zA-Z0-9_-]/g, "_")}/${filePath.replace(/^\/+/, "")}`
      : filePath.replace(/^\/+/, "");

    const { data, error } = await supabase.storage
      .from(PRIVATE_REPORTS_BUCKET)
      .upload(securePath, file, {
        upsert: true,
      });

    if (error) {
      console.error("[Supabase Storage] Upload failed:", error.message);
      return { signedUrl: null, filePath: null, error: error.message };
    }

    if (!data || !data.path) {
      return { signedUrl: null, filePath: null, error: "Upload did not return a valid file path." };
    }

    // Generate short-lived signed URL for download (expires in 5 minutes / 300 seconds)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(PRIVATE_REPORTS_BUCKET)
      .createSignedUrl(data.path, 300);

    if (signedError || !signedData?.signedUrl) {
      console.warn("[Supabase Storage] Signed URL creation warning:", signedError?.message);
      return { signedUrl: null, filePath: data.path, error: null };
    }

    return { signedUrl: signedData.signedUrl, filePath: data.path, error: null };
  } catch (err: any) {
    console.error("[Supabase Storage] Unexpected upload exception:", err);
    return { signedUrl: null, filePath: null, error: err.message || "Failed to upload file to storage." };
  }
}

/**
 * Generates a short-lived signed URL to access a private document after verifying ownership.
 */
export async function getSecureReportDownloadUrl(
  filePath: string,
  requestingUserId: string,
  expiresInSeconds: number = 300
): Promise<{ signedUrl: string | null; error: string | null }> {
  try {
    if (!filePath || !requestingUserId) {
      return { signedUrl: null, error: "File path and requesting user ID are required." };
    }

    // Ownership check: Verify file path belongs to the requesting user
    const sanitizedUserId = requestingUserId.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!filePath.startsWith(sanitizedUserId) && !filePath.includes(requestingUserId)) {
      return {
        signedUrl: null,
        error: "Access Denied: You do not have permission to access this private report.",
      };
    }

    const { data, error } = await supabase.storage
      .from(PRIVATE_REPORTS_BUCKET)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { signedUrl: null, error: error?.message || "Failed to generate signed download URL." };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (err: any) {
    return { signedUrl: null, error: err.message || "Unexpected error generating download URL." };
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
