import "server-only";
import { cookies, headers } from "next/headers";
import {
  accesoLocalHabilitado,
  COOKIE_LOCAL,
  verificarSesionLocal,
} from "./sesion-local";
export async function obtenerSesionLocal() {
  const cabeceras = await headers();
  if (!accesoLocalHabilitado(cabeceras.get("host"))) return null;
  return verificarSesionLocal(
    (await cookies()).get(COOKIE_LOCAL)?.value,
    process.env.SIGAF_LOCAL_SESSION_SECRET,
  );
}
