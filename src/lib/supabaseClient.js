// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
    throw new Error("Missing Supabase env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}
/**
 * Public bucket name for model uploads.
 * You created: VITE_SUPABASE_BUCKET=print-store
 * Make sure the bucket exists in Supabase → Storage.
 */
export const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "print-store";
export const supabase = createClient(url, anon);
