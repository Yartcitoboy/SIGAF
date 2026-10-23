import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/tipos/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
