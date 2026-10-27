import type { DatosOperacion } from "@/lib/servicios/operacion";
export function prepararEtiquetaLote(datos: DatosOperacion, id: number) {
  const lote = datos.lotes.find((l) => l.id_lote === id);
  const producto =
    lote && datos.productos.find((p) => p.id_producto === lote.id_producto);
  if (!lote || !producto) return null;
  const existencias = datos.inventario.filter((i) => i.id_lote === id);
  return {
    lote,
    producto,
    stock: existencias.reduce((s, i) => s + i.stock_actual, 0),
    ubicaciones: existencias.map((i) => ({
      id: i.id_inventario,
      nombre: i.bodega?.nombre || "Ubicación no disponible",
      cantidad: i.stock_actual,
    })),
  };
}
