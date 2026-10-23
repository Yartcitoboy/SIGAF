import { leerTabla, guardarFila } from "./datos";
export function obtenerNotificaciones() {
  return leerTabla("notificacion");
}
export async function marcarLeida(id: number) {
  await guardarFila("notificacion", { estado: "LEIDO" }, id);
  window.dispatchEvent(new Event("sigaf:alertas"));
}
