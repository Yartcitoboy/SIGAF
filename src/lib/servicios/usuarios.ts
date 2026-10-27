import { leerTabla } from "./datos";
import type { Usuario, Perfil, Sucursal } from "@/tipos/database";
export interface NuevoUsuarioPayload {
  nombre: string;
  email: string;
  password?: string;
  id_perfil: number;
  id_sucursal: number | null;
  activo: boolean;
}
export function obtenerPerfiles(): Promise<Perfil[]> {
  return leerTabla("perfil");
}
export function obtenerSucursales(): Promise<Sucursal[]> {
  return leerTabla("sucursal");
}
export async function obtenerUsuarios(): Promise<
  (Usuario & { auth_vinculado: boolean })[]
> {
  const [usuarios, perfiles, sucursales] = await Promise.all([
    (async () => {
      const respuesta = await fetch("/api/usuarios", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const datos = await respuesta.json();
      if (!respuesta.ok)
        throw new Error(
          datos.error || "No se pudieron consultar las cuentas reales.",
        );
      return datos as (Usuario & { auth_vinculado: boolean })[];
    })(),
    obtenerPerfiles(),
    obtenerSucursales(),
  ]);
  return usuarios.map((u) => ({
    ...u,
    perfil: perfiles.find((p) => p.id_perfil === u.id_perfil),
    sucursal: sucursales.find((s) => s.id_sucursal === u.id_sucursal),
  }));
}
// Directorio mínimo para atribución de movimientos; conserva los permisos y la
// proyección segura de /api/datos. Si no hay acceso, la vista conserva el UUID.
export async function obtenerResponsables() {
  return (await leerTabla("usuario")).map(({ id_usuario, nombre }) => ({
    id_usuario,
    nombre,
  }));
}
async function solicitar(datos: object, metodo: "POST" | "PATCH") {
  const respuesta = await fetch("/api/usuarios", {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const json = await respuesta.json();
  if (!respuesta.ok)
    throw new Error(json.error || "No se pudo guardar la cuenta.");
  return json as Usuario;
}
export const crearUsuario = (datos: NuevoUsuarioPayload) =>
  solicitar(datos, "POST");
export const editarUsuario = (id_usuario: string, datos: NuevoUsuarioPayload) =>
  solicitar({ ...datos, id_usuario }, "PATCH");
export const restablecerPassword = (id_usuario: string, password: string) =>
  solicitar({ id_usuario, password, accion: "password" }, "PATCH");
