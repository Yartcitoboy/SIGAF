import { z } from "zod";
import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";
import { createAdminClient } from "@/lib/supabase/admin";
const esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z
    .email()
    .max(150)
    .transform((s) => s.toLowerCase()),
  id_perfil: z.number().int().positive(),
  id_sucursal: z.number().int().positive().nullable(),
  activo: z.boolean(),
  password: z.string().min(12).max(128).optional(),
});
async function validarReferencias(
  datos: z.infer<typeof esquema>,
  db: ReturnType<typeof createAdminClient>,
) {
  const { data: perfil } = await db
    .from("perfil")
    .select("nombre")
    .eq("id_perfil", datos.id_perfil)
    .single();
  if (!perfil || !["ADMIN", "BODEGUERO", "AUXILIAR"].includes(perfil.nombre))
    throw new ErrorHttp("Rol inválido.", 400);
  if (perfil.nombre !== "ADMIN" && !datos.id_sucursal)
    throw new ErrorHttp("El personal operativo necesita una sucursal.", 400);
  if (datos.id_sucursal) {
    const { data: s } = await db
      .from("sucursal")
      .select("id_sucursal")
      .eq("id_sucursal", datos.id_sucursal)
      .single();
    if (!s) throw new ErrorHttp("Sucursal inválida.", 400);
  }
}
export async function POST(request: Request) {
  try {
    await autorizar(["ADMIN"]);
    const entrada = esquema.safeParse(await request.json());
    if (!entrada.success || !entrada.data.password)
      throw new ErrorHttp(
        "Revisa nombre, correo, rol y contraseña (mínimo 12 caracteres).",
        400,
      );
    const db = createAdminClient();
    const { password, ...datos } = entrada.data;
    await validarReferencias(entrada.data, db);
    const { data: auth, error } = await db.auth.admin.createUser({
      email: datos.email,
      password,
      email_confirm: true,
    });
    if (error || !auth.user)
      throw new ErrorHttp(error?.message || "No se pudo crear la cuenta.", 400);
    const { data: usuario, error: errorPerfil } = await db
      .from("usuario")
      .insert({ ...datos, id_usuario: auth.user.id })
      .select("id_usuario,nombre,email,id_perfil,id_sucursal,activo")
      .single();
    if (errorPerfil) {
      const { error: limpieza } = await db.auth.admin.deleteUser(auth.user.id);
      if (limpieza)
        throw new Error(
          "Falló el registro del perfil y la reversión de la cuenta. Revisa Supabase Auth antes de reintentar.",
        );
      throw new Error(errorPerfil.message);
    }
    return Response.json(usuario, { status: 201 });
  } catch (error) {
    return respuestaError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    const { usuario: actor } = await autorizar(["ADMIN"]);
    const cuerpo = await request.json();
    const id = z.uuid().safeParse(cuerpo.id_usuario);
    if (!id.success) throw new ErrorHttp("Usuario inválido.", 400);
    const db = createAdminClient();
    const { data: previo, error: lectura } = await db
      .from("usuario")
      .select("id_usuario,nombre,email,id_perfil,id_sucursal,activo")
      .eq("id_usuario", id.data)
      .single();
    if (lectura || !previo)
      throw new ErrorHttp("No se encontró el usuario.", 404);
    if (cuerpo.accion === "password") {
      const clave = z.string().min(12).max(128).safeParse(cuerpo.password);
      if (!clave.success)
        throw new ErrorHttp("Usa una contraseña de 12 a 128 caracteres.", 400);
      const { error } = await db.auth.admin.updateUserById(id.data, {
        password: clave.data,
      });
      if (error) throw new Error(error.message);
      return Response.json({ ok: true });
    }
    const entrada = esquema.omit({ password: true }).safeParse(cuerpo);
    if (!entrada.success)
      throw new ErrorHttp("Revisa los datos del usuario.", 400);
    const datos = entrada.data;
    await validarReferencias(datos, db);
    if (
      actor.id_usuario === id.data &&
      (!datos.activo || datos.id_perfil !== previo.id_perfil)
    )
      throw new ErrorHttp(
        "Otra cuenta administradora debe cambiar tu rol o desactivarte.",
        400,
      );
    if (datos.email !== previo.email) {
      const { error } = await db.auth.admin.updateUserById(id.data, {
        email: datos.email,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
    }
    const { data, error } = await db
      .from("usuario")
      .update(datos)
      .eq("id_usuario", id.data)
      .select("id_usuario,nombre,email,id_perfil,id_sucursal,activo")
      .single();
    if (error) {
      if (datos.email !== previo.email) {
        const { error: reversion } = await db.auth.admin.updateUserById(
          id.data,
          { email: previo.email, email_confirm: true },
        );
        if (reversion)
          throw new Error(
            "Revisa la sincronización del correo en Supabase Auth antes de reintentar.",
          );
      }
      throw new Error(error.message);
    }
    return Response.json(data);
  } catch (error) {
    return respuestaError(error);
  }
}
