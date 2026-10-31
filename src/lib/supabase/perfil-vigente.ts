import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Usuario } from "@/tipos/database";
import { esRol } from "../permisos";
export async function verificarAccesoVigente(db: SupabaseClient<Database>) {
  // getSession solo permite anticipar una lectura. No autoriza el acceso.
  const {
    data: { session },
  } = await db.auth.getSession();
  let idPrevisto: string | undefined;
  try {
    // Solo una pista para anticipar la consulta: NO se valida ni autoriza con ella.
    const cuerpo = session?.access_token.split(".")[1];
    const sub = cuerpo
      ? JSON.parse(atob(cuerpo.replace(/-/g, "+").replace(/_/g, "/"))).sub
      : undefined;
    if (typeof sub === "string") idPrevisto = sub;
  } catch {
    /* Si no hay pista válida, se consulta el perfil tras verificar Auth. */
  }
  const [identidad, perfil] = await Promise.all([
    db.auth.getUser(),
    idPrevisto ? obtenerPerfilVigente(db, idPrevisto) : Promise.resolve(null),
  ]);
  const user = identidad.data.user;
  if (identidad.error || !user || (idPrevisto && user.id !== idPrevisto))
    return { autenticado: false as const, perfil: null };
  return {
    autenticado: true as const,
    perfil: idPrevisto ? perfil : await obtenerPerfilVigente(db, user.id),
  };
}
// Se consulta de nuevo en cada petición; nunca se cachean permisos entre usuarios.
export async function obtenerPerfilVigente(
  db: SupabaseClient<Database>,
  id: string,
) {
  const { data, error } = await db
    .from("usuario")
    .select(
      "id_usuario,nombre,email,id_perfil,id_sucursal,activo,perfil(nombre)",
    )
    .eq("id_usuario", id)
    .single();
  if (error || !data) return null;
  // La relación FK existe en Postgres; el tipo heredado no incluye relaciones.
  const fila = data as unknown as Omit<Usuario, "perfil"> & {
    perfil: { nombre: unknown } | null;
  };
  if (!fila.activo || !esRol(fila.perfil?.nombre)) return null;
  const { perfil, ...usuario } = fila;
  return {
    usuario,
    rol: perfil!.nombre as import("@/tipos/database").RolPerfil,
  };
}
