import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarResumen } from "@/lib/servicios/correos";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || secreto.length < 24)
    return Response.json(
      { error: "Configura un CRON_SECRET de al menos 24 caracteres." },
      { status: 503 },
    );
  const esperado = Buffer.from("Bearer " + secreto);
  const recibido = Buffer.from(request.headers.get("authorization") || "");
  if (
    esperado.length !== recibido.length ||
    !timingSafeEqual(esperado, recibido)
  )
    return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    return Response.json(
      { error: "Configura el proveedor y remitente de correo." },
      { status: 503 },
    );
  try {
    const db = createAdminClient();
    const { data: creadas, error } = await db.rpc("generar_alertas", {});
    if (error) throw error;
    const { data: envios, error: cola } = await db.rpc("reclamar_correos", {});
    if (cola) throw cola;
    let enviados = 0;
    let fallidos = 0;
    // Concurrencia acotada para respetar el tiempo de ejecución del cron.
    for (let desde = 0; desde < (envios?.length || 0); desde += 2) {
      await Promise.all(
        envios!.slice(desde, desde + 2).map(async (envio) => {
          let id: string | undefined;
          let fallo: string | undefined;
          try {
            id = await enviarResumen(envio);
            enviados++;
          } catch (e) {
            fallidos++;
            fallo = e instanceof Error ? e.message : "Error de entrega";
          }
          const { error: registro } = await db.rpc("finalizar_correo", {
            p_envio: envio.id_envio,
            p_correo_id: id,
            p_error: fallo,
          });
          if (registro) throw registro;
        }),
      );
    }
    return Response.json(
      {
        alertas_creadas: creadas,
        correos_enviados: enviados,
        correos_pendientes_reintento: fallidos,
      },
      {
        status: fallidos ? 207 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return Response.json(
      {
        error:
          "No se pudo completar la verificación. Revisa las migraciones y la configuración del servidor.",
      },
      { status: 500 },
    );
  }
}
