import type { Database } from "@/tipos/database";
import type { ComandoDatos, TablaDatos } from "@/lib/datos/contrato";

type Fila<T extends TablaDatos> = Database["public"]["Tables"][T]["Row"];
export async function solicitarDatos<T>(comando: ComandoDatos): Promise<T> {
  const respuesta = await fetch("/api/datos", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comando),
  });
  const json = await respuesta.json();
  if (!respuesta.ok)
    throw new Error(json.error || "No se pudo cargar la información.");
  return json.data as T;
}
export function leerTabla<T extends TablaDatos>(tabla: T) {
  return solicitarDatos<Fila<T>[]>({ accion: "leer", tabla });
}
export function guardarFila<
  T extends Extract<ComandoDatos, { accion: "guardar" }>["tabla"],
>(tabla: T, campos: Database["public"]["Tables"][T]["Update"], id?: number) {
  return solicitarDatos<Fila<T>[]>({ accion: "guardar", tabla, campos, id });
}
