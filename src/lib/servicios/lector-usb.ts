import type { Producto } from "@/tipos/database";
export interface LecturaCodigo {
  codigo: string;
  lote?: string;
  vencimiento?: string;
}
export interface ResultadoCodigo {
  producto: Producto;
  lectura: LecturaCodigo;
  advertencia?: string;
}
export async function consultarCodigoMedicamento(
  codigo: string,
  signal?: AbortSignal,
) {
  const respuesta = await fetch(
    "/api/medicamentos/codigo?codigo=" + encodeURIComponent(codigo),
    { cache: "no-store", credentials: "same-origin", signal },
  );
  const datos = (await respuesta.json()) as {
    producto?: Producto;
    lectura?: LecturaCodigo;
    advertencia?: string;
    error?: string;
  };
  return { ok: respuesta.ok, estado: respuesta.status, datos };
}
