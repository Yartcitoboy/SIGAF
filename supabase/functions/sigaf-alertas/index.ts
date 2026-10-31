import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { z } from "npm:zod@4.6.5";
import { errorCorreoReal } from "../_shared/correo.ts";
import { mensajeResumen, type LineaCaducidad } from "./dominio.ts";
import { enviarGmail, renovarAcceso, ErrorEntrega } from "./gmail.ts";
class ErrorHttp extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
function entorno(diccionario: string, legado: string) {
  const v = Deno.env.get(diccionario);
  return (v ? JSON.parse(v).default : undefined) || Deno.env.get(legado);
}
const url = Deno.env.get("SUPABASE_URL")!;
const callback = url + "/functions/v1/sigaf-alertas?oauth=callback";
function servidor() {
  const secreta = entorno("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secreta)
    throw new ErrorHttp("Falta la configuración segura de Supabase.", 503);
  return createClient(url, secreta, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (
          secreta.startsWith("sb_secret_") &&
          headers.get("Authorization") === "Bearer " + secreta
        )
          headers.delete("Authorization");
        return fetch(input, { ...init, headers });
      },
    },
  });
}
type DB = ReturnType<typeof servidor>;
async function rpc(db: DB, nombre: string, args: Record<string, unknown> = {}) {
  const { data, error } = await db.rpc(nombre, args);
  if (error) throw new ErrorHttp(error.message, 400);
  return data;
}
async function hash(s: string) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
async function credenciales(db: DB) {
  return (await rpc(db, "configuracion_envio_alertas")) as {
    activo: boolean;
    remitente: string | null;
    cliente: string | null;
    secreto: string | null;
    refresh: string | null;
  };
}
async function sesion(request: Request) {
  const autorizacion = request.headers.get("authorization");
  if (!autorizacion?.startsWith("Bearer "))
    throw new ErrorHttp("Inicia sesión para continuar.", 401);
  const publica = entorno("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
  const cliente = createClient(url, publica, {
    global: { headers: { Authorization: autorizacion } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await cliente.auth.getUser(autorizacion.slice(7));
  if (error || !user) throw new ErrorHttp("Sesión inválida.", 401);
  const { data: actor } = await cliente
    .from("usuario")
    .select("id_usuario,id_perfil,activo")
    .eq("id_usuario", user.id)
    .single();
  if (!actor?.activo)
    throw new ErrorHttp("Cuenta inactiva o sin acceso SIGAF.", 403);
  const { data: rol } = await cliente
    .from("perfil")
    .select("nombre")
    .eq("id_perfil", actor.id_perfil)
    .single();
  if (!["ADMIN", "BODEGUERO", "AUXILIAR"].includes(rol?.nombre))
    throw new ErrorHttp("Rol no autorizado.", 403);
  return { id: user.id, admin: rol!.nombre === "ADMIN" };
}
async function vincular(req: Request) {
  const parametros = new URL(req.url).searchParams;
  const state = parametros.get("state"),
    code = parametros.get("code");
  if (!state || !code || state.length > 200 || code.length > 3000)
    throw new ErrorHttp(
      "No se autorizó la conexión de Gmail. Vuelve a Alertas para intentarlo de nuevo.",
      400,
    );
  const db = servidor(),
    actor = await rpc(db, "consumir_vinculo_gmail", {
      p_hash: await hash(state),
    });
  if (!actor)
    throw new ErrorHttp(
      "La conexión caducó o ya fue utilizada. Vuelve a iniciarla desde SIGAF.",
      400,
    );
  const config = await credenciales(db);
  if (!config.cliente || !config.secreto)
    throw new ErrorHttp("Configura primero el cliente de Google.", 503);
  const respuesta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.cliente,
      client_secret: config.secreto,
      code,
      redirect_uri: callback,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await respuesta.json();
  if (
    !respuesta.ok ||
    typeof tokens.access_token !== "string" ||
    typeof tokens.refresh_token !== "string" ||
    !String(tokens.scope)
      .split(" ")
      .includes("https://www.googleapis.com/auth/gmail.send")
  )
    throw new ErrorHttp(
      "Google no concedió el envío automático. Repite la conexión autorizando el envío de correos.",
      400,
    );
  const respuestaCuenta = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: "Bearer " + tokens.access_token },
      signal: AbortSignal.timeout(15000),
    },
  );
  const cuenta = await respuestaCuenta.json();
  if (
    !respuestaCuenta.ok ||
    cuenta.email_verified !== true ||
    typeof cuenta.email !== "string" ||
    errorCorreoReal(cuenta.email)
  )
    throw new ErrorHttp("Google no confirmó el buzón remitente.", 400);
  await rpc(db, "guardar_vinculo_gmail", {
    p_actor: actor,
    p_cliente: config.cliente,
    p_refresh: tokens.refresh_token,
    p_email: cuenta.email.toLowerCase(),
  });
  return new Response(
    "Gmail conectado a SIGAF. Puedes cerrar esta pestaña y volver a Alertas. Los resúmenes se enviarán a los destinatarios confirmados a partir del próximo corte diario.",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
async function ejecutar(db: DB) {
  const config = await credenciales(db);
  if (
    !config.activo ||
    !config.cliente ||
    !config.secreto ||
    !config.refresh ||
    !config.remitente
  )
    throw new ErrorHttp(
      "Conecta y activa Gmail antes de enviar resúmenes.",
      503,
    );
  let token: string;
  try {
    token = await renovarAcceso(config.cliente, config.secreto, config.refresh);
  } catch {
    await rpc(db, "error_integracion_gmail", {
      p_error: "Google no autorizó el envío. Vuelve a conectar Gmail.",
    });
    throw new ErrorHttp("Vuelve a conectar Gmail en Alertas.", 503);
  }
  const envios = (await rpc(db, "reclamar_correos")) as {
    id_envio: string;
    reserva: string;
    destinatario: string;
    fecha_resumen: string;
    mensajes: LineaCaducidad[];
  }[];
  let aceptados = 0,
    fallidos = 0;
  for (const e of envios) {
    let id: string | undefined,
      error: string | undefined,
      reintentar = false;
    try {
      if (
        !(await rpc(db, "autorizar_resumen_diario", {
          p_envio: e.id_envio,
          p_reserva: e.reserva,
        }))
      )
        throw new ErrorEntrega(
          "Cambió el destinatario o su alcance; no se envió el resumen.",
          false,
        );
      id = await enviarGmail(
        token,
        config.remitente,
        e.destinatario,
        mensajeResumen(e.fecha_resumen, e.mensajes),
        e.id_envio,
      );
      aceptados++;
    } catch (fallo) {
      fallidos++;
      error = fallo instanceof Error ? fallo.message : "Error de entrega";
      reintentar = fallo instanceof ErrorEntrega && fallo.reintentar;
    }
    const registrado = await rpc(db, "finalizar_resumen_diario", {
      p_envio: e.id_envio,
      p_reserva: e.reserva,
      p_correo_id: id ?? null,
      p_error: error ?? null,
      p_reintentar: reintentar,
    });
    if (!registrado)
      throw new ErrorHttp(
        "La entrega requiere revisión. No se repetirá automáticamente.",
        500,
      );
  }
  await rpc(db, "error_integracion_gmail", {
    p_error: fallidos ? "Hay envíos pendientes de revisión o reintento." : null,
  });
  return { aceptados_por_gmail: aceptados, pendientes: fallidos };
}
export async function atender(request: Request) {
  try {
    if (
      request.method === "GET" &&
      new URL(request.url).searchParams.get("oauth") === "callback"
    )
      return await vincular(request);
    if (request.method !== "POST")
      throw new ErrorHttp("Método no permitido.", 405);
    const cron = request.headers.get("x-sigaf-cron");
    if (cron) {
      const db = servidor();
      if (!(await rpc(db, "validar_cron_alertas", { p_token: cron })))
        throw new ErrorHttp("No autorizado.", 401);
      return Response.json(await ejecutar(db), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    const actor = await sesion(request),
      db = servidor();
    const entrada = z
      .discriminatedUnion("accion", [
        z.object({ accion: z.literal("estado") }).strict(),
        z
          .object({
            accion: z.literal("configurar"),
            cliente: z
              .string()
              .regex(/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/),
            secreto: z.string().max(500),
            activo: z.boolean(),
          })
          .strict(),
        z.object({ accion: z.literal("conectar") }).strict(),
        z
          .object({
            accion: z.literal("solicitar_codigo"),
            id_usuario: z.uuid().optional(),
          })
          .strict(),
        z
          .object({
            accion: z.literal("confirmar_codigo"),
            codigo: z.string().regex(/^\d{6}$/),
          })
          .strict(),
      ])
      .safeParse(await request.json());
    if (!entrada.success)
      throw new ErrorHttp("Revisa los campos de la solicitud.", 400);
    const e = entrada.data;
    if (e.accion === "estado")
      return Response.json(
        await rpc(db, "estado_entrega_alertas", { p_actor: actor.id }),
        { headers: { "Cache-Control": "no-store" } },
      );
    if (e.accion === "configurar") {
      if (!actor.admin) throw new ErrorHttp("Solo Admin configura Gmail.", 403);
      await rpc(db, "configurar_correo_alertas", {
        p_actor: actor.id,
        p_cliente: e.cliente,
        p_secreto: e.secreto,
        p_url: url,
        p_activo: e.activo,
      });
    } else if (e.accion === "conectar") {
      if (!actor.admin) throw new ErrorHttp("Solo Admin conecta Gmail.", 403);
      const c = await credenciales(db);
      if (!c.cliente || !c.secreto)
        throw new ErrorHttp("Guarda primero el cliente de Google.", 503);
      const state = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await rpc(db, "iniciar_vinculo_gmail", {
        p_actor: actor.id,
        p_hash: await hash(state),
      });
      const parametros = new URLSearchParams({
        client_id: c.cliente,
        redirect_uri: callback,
        response_type: "code",
        scope: "openid email https://www.googleapis.com/auth/gmail.send",
        access_type: "offline",
        prompt: "consent",
        state,
      });
      return Response.json(
        { url: "https://accounts.google.com/o/oauth2/v2/auth?" + parametros },
        { headers: { "Cache-Control": "no-store" } },
      );
    } else if (e.accion === "solicitar_codigo") {
      const destino = e.id_usuario ?? actor.id;
      if (destino !== actor.id && !actor.admin)
        throw new ErrorHttp(
          "No puedes verificar el correo de otra cuenta.",
          403,
        );
      const c = await credenciales(db);
      if (!c.activo || !c.remitente || !c.cliente || !c.secreto || !c.refresh)
        throw new ErrorHttp(
          "Admin debe conectar Gmail antes de enviar códigos.",
          503,
        );
      const token = await renovarAcceso(c.cliente, c.secreto, c.refresh);
      const azar = new Uint32Array(1);
      do {
        crypto.getRandomValues(azar);
      } while (azar[0] >= 4294000000);
      const codigo = String(azar[0] % 1000000).padStart(6, "0"),
        nonce = crypto.randomUUID();
      const email = await rpc(db, "solicitar_codigo_correo", {
        p_usuario: destino,
        p_nonce: nonce,
        p_hash: await hash(nonce + ":" + codigo),
      });
      await enviarGmail(
        token,
        c.remitente,
        email,
        {
          subject: "SIGAF · Confirma tu correo de alertas",
          text: `Tu código de SIGAF es ${codigo}. Vence en 15 minutos. Ingresa en SIGAF, abre Alertas y confirma tu correo. Si no lo solicitaste, ignora este mensaje.`,
          html: `<h1>SIGAF</h1><p>Confirma tu correo de alertas:</p><p style="font-size:32px;letter-spacing:8px">${codigo}</p><p>Vence en 15 minutos. Escríbelo en SIGAF → Alertas. Si no lo solicitaste, ignora este mensaje.</p>`,
        },
        nonce,
      );
    } else {
      const nonce = await rpc(db, "nonce_codigo_correo", {
        p_usuario: actor.id,
      });
      if (
        !nonce ||
        !(await rpc(db, "confirmar_codigo_correo", {
          p_usuario: actor.id,
          p_nonce: nonce,
          p_hash: await hash(nonce + ":" + e.codigo),
        }))
      )
        throw new ErrorHttp(
          "Código incorrecto, vencido o con demasiados intentos. Solicita uno nuevo.",
          400,
        );
    }
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo completar la operación.",
      },
      {
        status: error instanceof ErrorHttp ? error.status : 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
Deno.serve(atender);
