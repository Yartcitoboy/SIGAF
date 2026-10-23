import { createHmac, timingSafeEqual } from "node:crypto";
import { CUENTAS_LOCALES } from "./cuentas-locales";

export const COOKIE_LOCAL = "sigaf_acceso_local";
export const DURACION_LOCAL = 8 * 60 * 60;
export function accesoLocalHabilitado(
  host: string | null,
  entorno = process.env.NODE_ENV,
  habilitado = process.env.SIGAF_ACCESO_LOCAL,
  secreto = process.env.SIGAF_LOCAL_SESSION_SECRET,
) {
  if (
    entorno !== "development" ||
    habilitado === "false" ||
    !secreto ||
    secreto.length < 32 ||
    !host
  )
    return false;
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL("http://" + host).hostname,
    );
  } catch {
    return false;
  }
}
export function autenticarCuentaLocal(email: string, password: string) {
  const cuenta = CUENTAS_LOCALES.find(
    (c) => c.email === email.trim().toLowerCase(),
  );
  if (!cuenta) return null;
  const esperada = Buffer.from(cuenta.password);
  const recibida = Buffer.from(password);
  return esperada.length === recibida.length &&
    timingSafeEqual(esperada, recibida)
    ? cuenta
    : null;
}
export function firmarSesionLocal(
  rol: string,
  secreto: string,
  ahora = Date.now(),
) {
  if (!CUENTAS_LOCALES.some((c) => c.rol === rol))
    throw new Error("Perfil local inválido.");
  const contenido = Buffer.from(
    JSON.stringify({ rol, exp: ahora + DURACION_LOCAL * 1000 }),
  ).toString("base64url");
  return (
    contenido +
    "." +
    createHmac("sha256", secreto).update(contenido).digest("base64url")
  );
}
export function verificarSesionLocal(
  token: string | undefined,
  secreto: string | undefined,
  ahora = Date.now(),
) {
  if (!token || token.length > 1024 || !secreto || secreto.length < 32)
    return null;
  try {
    const partes = token.split(".");
    if (partes.length !== 2) return null;
    const firma = Buffer.from(partes[1], "base64url");
    const esperada = createHmac("sha256", secreto).update(partes[0]).digest();
    if (firma.length !== esperada.length || !timingSafeEqual(firma, esperada))
      return null;
    const contenido = JSON.parse(
      Buffer.from(partes[0], "base64url").toString(),
    );
    if (
      typeof contenido.exp !== "number" ||
      contenido.exp <= ahora ||
      contenido.exp > ahora + DURACION_LOCAL * 1000
    )
      return null;
    const cuenta = CUENTAS_LOCALES.find((c) => c.rol === contenido.rol);
    if (!cuenta) return null;
    return {
      rol: cuenta.rol,
      usuario: {
        id_usuario: cuenta.id_usuario,
        nombre: cuenta.nombre,
        email: cuenta.email,
        id_perfil: cuenta.id_perfil,
        id_sucursal: cuenta.rol === "ADMIN" ? null : 1,
        activo: true,
      },
    };
  } catch {
    return null;
  }
}
