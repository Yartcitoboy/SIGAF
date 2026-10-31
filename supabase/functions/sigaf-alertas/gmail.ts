import { errorCorreoReal } from "../_shared/correo.ts";
export interface MensajeCorreo {
  subject: string;
  text: string;
  html: string;
}
export class ErrorEntrega extends Error {
  reintentar: boolean;
  constructor(message: string, reintentar: boolean) {
    super(message);
    this.reintentar = reintentar;
  }
}
function base64(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binario += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binario);
}
export function mensajeMime(
  remitente: string,
  destino: string,
  mensaje: MensajeCorreo,
  id: string,
) {
  if (
    errorCorreoReal(remitente) ||
    errorCorreoReal(destino) ||
    !/^[a-z0-9-]+$/i.test(id)
  )
    throw new Error("Correo o referencia inválidos.");
  const limite = "sigaf_" + id;
  const lineas = (s: string) =>
    base64(s)
      .match(/.{1,76}/g)
      ?.join("\r\n") || "";
  const mime = [
    `From: SIGAF <${remitente}>`,
    `To: ${destino}`,
    `Subject: =?UTF-8?B?${base64(mensaje.subject)}?=`,
    `Message-ID: <sigaf-${id}@${remitente.split("@")[1]}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${limite}"`,
    "",
    `--${limite}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    lineas(mensaje.text),
    `--${limite}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    lineas(mensaje.html),
    `--${limite}--`,
    "",
  ].join("\r\n");
  return base64(mime)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
export async function renovarAcceso(
  cliente: string,
  secreto: string,
  refresh: string,
  transporte: typeof fetch = fetch,
): Promise<string> {
  const r = await transporte("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cliente,
      client_secret: secreto,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const datos = await r.json();
  if (!r.ok || typeof datos.access_token !== "string")
    throw new Error(
      "Google no autorizó el envío. Vuelve a conectar la cuenta Gmail en Alertas.",
    );
  return datos.access_token;
}
export async function enviarGmail(
  token: string,
  remitente: string,
  destino: string,
  mensaje: MensajeCorreo,
  id: string,
  transporte: typeof fetch = fetch,
): Promise<string> {
  const raw = mensajeMime(remitente, destino, mensaje, id);
  let r: Response;
  try {
    r = await transporte(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      },
    );
  } catch {
    throw new ErrorEntrega(
      "Entrega incierta: comprueba Enviados en Gmail antes de repetir.",
      false,
    );
  }
  const datos = await r.json().catch(() => null);
  if (!r.ok || typeof datos?.id !== "string") {
    const cuota =
      r.status === 429 ||
      (r.status === 403 &&
        datos?.error?.errors?.some((e: { reason: string }) =>
          [
            "rateLimitExceeded",
            "userRateLimitExceeded",
            "dailyLimitExceeded",
          ].includes(e.reason),
        ));
    throw new ErrorEntrega(
      r.status >= 500 || (r.ok && !datos?.id)
        ? "Entrega incierta de Gmail; requiere revisión."
        : `Gmail rechazó el envío (${r.status}). Revisa autorización, destinatario o cuota.`,
      Boolean(cuota || r.status === 401),
    );
  }
  return datos.id;
}
