import "server-only";
import type { CorreoResumen } from "@/tipos/database";
const escapar = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function enviarResumen(envio: CorreoResumen) {
  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.RESEND_FROM;
  if (!clave || !remitente)
    throw new Error("Falta configurar RESEND_API_KEY y RESEND_FROM.");
  const mensajes = Array.isArray(envio.mensajes)
    ? envio.mensajes.map(String)
    : [];
  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: "Bearer " + clave,
      "Content-Type": "application/json",
      "Idempotency-Key": "sigaf-resumen-" + envio.id_envio,
    },
    body: JSON.stringify({
      from: remitente,
      to: [envio.destinatario],
      subject: "SIGAF · Lotes críticos que requieren atención",
      html:
        '<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0f172a"><div style="padding:28px;background:#0f172a;color:white"><h1 style="margin:0">SIGAF</h1><p>Gestión farmacéutica · Alerta de caducidad</p></div><div style="padding:28px"><h2>Hay lotes que requieren intervención</h2><p>Revisa su ubicación y registra el retiro, traslado o devolución correspondiente.</p><ul>' +
        mensajes
          .map((m) => '<li style="padding:12px 0">' + escapar(m) + "</li>")
          .join("") +
        '</ul><p style="font-size:12px;color:#64748b">Los lotes caducados están bloqueados para dispensación. Consulta el inventario para comprobar las existencias actuales.</p></div></div>',
      text: "SIGAF - Lotes que requieren atención\n\n" + mensajes.join("\n"),
    }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok || typeof datos.id !== "string")
    throw new Error(
      "Resend rechazó el envío (" +
        respuesta.status +
        "). " +
        String(datos.message || "Revisa el proveedor.").slice(0, 200),
    );
  return datos.id as string;
}
