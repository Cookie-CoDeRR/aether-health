import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gbmobmukzgqvuyzxlutz.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_UcoaCYrnBtDixP4PuAmPPQ_47mvg4ZF";

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);
