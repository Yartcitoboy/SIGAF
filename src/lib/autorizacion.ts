import "server-only";
import { createClient } from "@/lib/supabase/server";
import { esRol } from "@/lib/permisos";
import type { RolPerfil } from "@/tipos/database";

export class ErrorHttp extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function autorizar(roles?: RolPerfil[]) {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new ErrorHttp("Inicia sesión para continuar.", 401);
  const { data: usuario, error: errorUsuario } = await db
    .from("usuario")
    .select("id_usuario,nombre,email,id_perfil,id_sucursal,activo")
    .eq("id_usuario", user.id)
    .single();
  if (errorUsuario || !usuario?.activo)
    throw new ErrorHttp(
      "Tu cuenta está inactiva o no tiene un perfil asignado.",
      403,
    );
  const { data: perfil } = await db
    .from("perfil")
    .select("nombre")
    .eq("id_perfil", usuario.id_perfil)
    .single();
  if (!esRol(perfil?.nombre) || (roles && !roles.includes(perfil.nombre)))
    throw new ErrorHttp("No tienes permiso para esta operación.", 403);
  return { db, usuario, rol: perfil.nombre };
}
export function respuestaError(error: unknown) {
  if (error instanceof ErrorHttp)
    return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación.",
    },
    { status: 500 },
  );
}
