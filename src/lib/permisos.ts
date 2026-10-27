import type { RolPerfil } from "@/tipos/database";

export const PERMISOS_MODULOS: Record<RolPerfil, string[]> = {
  ADMIN: [
    "/dashboard",
    "/inventario",
    "/productos",
    "/lotes",
    "/dispensacion",
    "/movimientos",
    "/alertas",
    "/reportes",
    "/usuarios",
    "/configuracion",
    "/mensajes",
  ],
  BODEGUERO: [
    "/mensajes",
    "/dashboard",
    "/inventario",
    "/productos",
    "/lotes",
    "/dispensacion",
    "/movimientos",
    "/alertas",
  ],
  AUXILIAR: [
    "/dashboard",
    "/inventario",
    "/dispensacion",
    "/alertas",
    "/mensajes",
  ],
};
export function esRol(valor: unknown): valor is RolPerfil {
  return typeof valor === "string" && Object.hasOwn(PERMISOS_MODULOS, valor);
}
export function tieneAcceso(rol: RolPerfil, ruta: string) {
  return PERMISOS_MODULOS[rol].some(
    (p) => ruta === p || ruta.startsWith(`${p}/`),
  );
}
