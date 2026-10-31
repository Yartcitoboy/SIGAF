import { leerTabla, guardarFila, solicitarDatos } from "./datos";
export function obtenerCampana() {
  return solicitarDatos<{
    filas: import("@/tipos/database").Notificacion[];
    total: number;
  }>({ accion: "campana" });
}
export function obtenerNotificaciones() {
  return leerTabla("notificacion");
}
export async function marcarLeida(id: number) {
  await guardarFila("notificacion", { estado: "LEIDO" }, id);
  window.dispatchEvent(new Event("sigaf:alertas"));
}
