import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/tipos/database";

// Las tarjetas de desarrollo solo pueden consultar lo que Supabase ya permite
// a su clave pública. No se utiliza service_role ni se suplanta un usuario real.
export function crearClienteLectura() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Falta configurar la conexión a Supabase.");
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
