import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { z } from "npm:zod@4.6.5";

const columnas = "id_usuario,nombre,email,id_perfil,id_sucursal,activo";
const ficha = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z
    .email()
    .max(150)
    .transform((s) => s.toLowerCase()),
  id_perfil: z.number().int().positive(),
  id_sucursal: z.number().int().positive().nullable(),
  activo: z.boolean(),
});
class ErrorHttp extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
function claveEntorno(diccionario: string, legado: string) {
  const json = Deno.env.get(diccionario);
  return (json ? JSON.parse(json).default : undefined) || Deno.env.get(legado);
}

// Autorizado expresamente: solo Admin activo puede gestionar cuentas reales.
// El JWT se verifica con Auth; el rol se consulta en DB, nunca en user_metadata.
export async function atender(request: Request) {
  try {
    if (request.method !== "POST")
      throw new ErrorHttp("Método no permitido.", 405);
    const autorizacion = request.headers.get("authorization");
    if (!autorizacion?.startsWith("Bearer "))
      throw new ErrorHttp("Inicia sesión para continuar.", 401);
    const url = Deno.env.get("SUPABASE_URL"),
      publica = claveEntorno("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
    if (!url || !publica)
      throw new ErrorHttp("Falta la configuración de Supabase.", 503);
    const sesion = createClient(url, publica, {
      global: { headers: { Authorization: autorizacion } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: authError,
    } = await sesion.auth.getUser(autorizacion.slice(7));
    if (authError || !user) throw new ErrorHttp("Sesión inválida.", 401);
    const { data: actor, error: perfilError } = await sesion
      .from("usuario")
      .select("id_usuario,id_perfil,activo")
      .eq("id_usuario", user.id)
      .single();
    if (perfilError || !actor?.activo)
      throw new ErrorHttp("Cuenta inactiva o sin perfil.", 403);
    const { data: rol } = await sesion
      .from("perfil")
      .select("nombre")
      .eq("id_perfil", actor.id_perfil)
      .single();
    if (rol?.nombre !== "ADMIN")
      throw new ErrorHttp("Solo administración puede gestionar cuentas.", 403);
    const entrada = z
      .object({
        metodo: z.enum(["GET", "POST", "PATCH"]),
        datos: z.unknown().optional(),
      })
      .strict()
      .safeParse(await request.json());
    if (!entrada.success) throw new ErrorHttp("Solicitud inválida.", 400);
    const secreta = claveEntorno(
      "SUPABASE_SECRET_KEYS",
      "SUPABASE_SERVICE_ROLE_KEY",
    );
    if (!secreta)
      throw new ErrorHttp(
        "Falta la configuración administrativa de Supabase.",
        503,
      );
    const db = createClient(url, secreta, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          // Las claves nuevas se envían en apikey, no como JWT de usuario.
          if (
            headers.get("Authorization") === `Bearer ${secreta}` &&
            secreta.startsWith("sb_secret_")
          )
            headers.delete("Authorization");
          return fetch(input, { ...init, headers });
        },
      },
    });
    if (entrada.data.metodo === "GET") {
      const [usuarios, identidades] = await Promise.all([
        (async () => {
          const filas: {
            id_usuario: string;
            nombre: string;
            email: string;
            id_perfil: number;
            id_sucursal: number | null;
            activo: boolean;
          }[] = [];
          for (let desde = 0; ; desde += 500) {
            const { data, error } = await db
              .from("usuario")
              .select(columnas)
              .order("nombre")
              .order("id_usuario")
              .range(desde, desde + 499);
            if (error) throw error;
            filas.push(...data);
            if (data.length < 500) break;
          }
          return filas;
        })(),
        (async () => {
          const ids = new Set<string>();
          for (let page = 1; ; page++) {
            const { data, error } = await db.auth.admin.listUsers({
              page,
              perPage: 200,
            });
            if (error) throw error;
            for (const cuenta of data.users) ids.add(cuenta.id);
            if (data.users.length < 200) break;
          }
          return ids;
        })(),
      ]);
      return Response.json(
        usuarios.map((u) => ({
          ...u,
          auth_vinculado: identidades.has(u.id_usuario),
        })),
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const esAlta = entrada.data.metodo === "POST";
    const reset = z
      .object({
        id_usuario: z.uuid(),
        accion: z.literal("password"),
        password: z.string().min(12).max(128),
      })
      .strict();
    if (!esAlta && reset.safeParse(entrada.data.datos).success) {
      const dato = reset.parse(entrada.data.datos);
      const { data: destino } = await db
        .from("usuario")
        .select("id_usuario")
        .eq("id_usuario", dato.id_usuario)
        .single();
      if (!destino)
        throw new ErrorHttp("No se encontró el usuario de SIGAF.", 404);
      const { data: cuenta, error } = await db.auth.admin.getUserById(
        dato.id_usuario,
      );
      if (error || !cuenta.user)
        throw new ErrorHttp(
          "El registro histórico no tiene una cuenta de acceso.",
          409,
        );
      const { error: cambio } = await db.auth.admin.updateUserById(
        dato.id_usuario,
        { password: dato.password },
      );
      if (cambio) throw cambio;
      return Response.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const validacion = esAlta
      ? ficha
          .extend({ password: z.string().min(12).max(128) })
          .strict()
          .safeParse(entrada.data.datos)
      : ficha
          .extend({ id_usuario: z.uuid() })
          .strict()
          .safeParse(entrada.data.datos);
    if (!validacion.success)
      throw new ErrorHttp(
        "Revisa nombre, correo, perfil y datos de acceso.",
        400,
      );
    const dato = validacion.data;
    const { data: perfil } = await db
      .from("perfil")
      .select("nombre")
      .eq("id_perfil", dato.id_perfil)
      .single();
    if (!perfil || !["ADMIN", "BODEGUERO", "AUXILIAR"].includes(perfil.nombre))
      throw new ErrorHttp("Rol inválido.", 400);
    if (perfil.nombre !== "ADMIN" && !dato.id_sucursal)
      throw new ErrorHttp("El personal operativo necesita una sucursal.", 400);
    if (dato.id_sucursal) {
      const { data: s } = await db
        .from("sucursal")
        .select("id_sucursal")
        .eq("id_sucursal", dato.id_sucursal)
        .single();
      if (!s) throw new ErrorHttp("Sucursal inválida.", 400);
    }
    const datos = {
      nombre: dato.nombre,
      email: dato.email,
      id_perfil: dato.id_perfil,
      id_sucursal: perfil.nombre === "ADMIN" ? null : dato.id_sucursal,
      activo: dato.activo,
    };
    if (esAlta && "password" in dato) {
      const { data: auth, error } = await db.auth.admin.createUser({
        email: dato.email,
        password: dato.password,
        email_confirm: true,
      });
      if (error || !auth.user)
        throw new ErrorHttp(
          error?.message || "No se pudo crear la cuenta.",
          400,
        );
      const { data: usuario, error: alta } = await db
        .from("usuario")
        .insert({ ...datos, id_usuario: auth.user.id })
        .select(columnas)
        .single();
      if (alta) {
        const { error: reversion } = await db.auth.admin.deleteUser(
          auth.user.id,
        );
        if (reversion)
          throw new ErrorHttp(
            "Revisa la cuenta recién creada antes de reintentar: falló su reversión.",
            500,
          );
        throw alta;
      }
      return Response.json(usuario, {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (!("id_usuario" in dato)) throw new ErrorHttp("Usuario inválido.", 400);
    const { data: previo } = await db
      .from("usuario")
      .select(columnas)
      .eq("id_usuario", dato.id_usuario)
      .single();
    if (!previo) throw new ErrorHttp("No se encontró el usuario.", 404);
    const { data: authCuenta, error: sinCuenta } =
      await db.auth.admin.getUserById(dato.id_usuario);
    if (sinCuenta || !authCuenta.user)
      throw new ErrorHttp(
        "El registro histórico no tiene una cuenta de acceso. Conserva su autoría y crea una cuenta nueva.",
        409,
      );
    if (
      user.id === dato.id_usuario &&
      (!dato.activo || dato.id_perfil !== previo.id_perfil)
    )
      throw new ErrorHttp(
        "Otra cuenta administradora debe cambiar tu rol o desactivarte.",
        400,
      );
    if (dato.email !== previo.email) {
      const { error } = await db.auth.admin.updateUserById(dato.id_usuario, {
        email: dato.email,
        email_confirm: true,
      });
      if (error) throw error;
    }
    const { data: guardado, error: escritura } = await db
      .from("usuario")
      .update(datos)
      .eq("id_usuario", dato.id_usuario)
      .select(columnas)
      .single();
    if (escritura) {
      if (dato.email !== previo.email) {
        const { error } = await db.auth.admin.updateUserById(dato.id_usuario, {
          email: previo.email,
          email_confirm: true,
        });
        if (error)
          throw new ErrorHttp(
            "Revisa la sincronización del correo antes de reintentar.",
            500,
          );
      }
      throw escritura;
    }
    return Response.json(guardado, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo gestionar la cuenta.",
      },
      {
        status: error instanceof ErrorHttp ? error.status : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
Deno.serve(atender);
