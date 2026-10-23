import type { Categoria } from "@/tipos/database";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { diasHasta, fechaChile } from "../servicios/fechas";
import { calcularSemaforoLote } from "../servicios/semaforo";

export type ReferenciaDetalle = {
  tipo: "producto" | "lote" | "movimiento";
  id: number;
};
// Solo compone filas ya autorizadas por los servicios existentes. No abre otra conexión.
export function prepararDetalleProducto(
  datos: DatosOperacion,
  categorias: Categoria[],
  referencia: ReferenciaDetalle,
  hoy = fechaChile(),
) {
  const movimiento =
    referencia.tipo === "movimiento"
      ? datos.movimientos.find((m) => m.id_movimiento === referencia.id)
      : undefined;
  const origen = movimiento
    ? datos.inventario.find((i) => i.id_inventario === movimiento.id_inventario)
    : undefined;
  const lote =
    referencia.tipo === "lote"
      ? datos.lotes.find((l) => l.id_lote === referencia.id)
      : origen
        ? datos.lotes.find((l) => l.id_lote === origen.id_lote)
        : undefined;
  if (
    (referencia.tipo === "movimiento" && !movimiento) ||
    (referencia.tipo !== "producto" && !lote)
  )
    return null;
  const producto = datos.productos.find(
    (p) =>
      p.id_producto ===
      (referencia.tipo === "producto" ? referencia.id : lote?.id_producto),
  );
  if (!producto) return null;
  const lotes = datos.lotes
    .filter((l) => l.id_producto === producto.id_producto)
    .sort(
      (a, b) =>
        a.fecha_vencimiento.localeCompare(b.fecha_vencimiento) ||
        a.id_lote - b.id_lote,
    );
  const idsLotes = new Set(lotes.map((l) => l.id_lote));
  const inventario = datos.inventario.filter((i) => idsLotes.has(i.id_lote));
  const mapaLotes = new Map(lotes.map((l) => [l.id_lote, l]));
  const apto = (id: number) =>
    diasHasta(mapaLotes.get(id)!.fecha_vencimiento, hoy) >
    datos.configuracion.holgura_dias;
  const stockActual = inventario.reduce((sum, i) => sum + i.stock_actual, 0);
  const stockApto = inventario
    .filter((i) => apto(i.id_lote))
    .reduce((sum, i) => sum + i.stock_actual, 0);
  const stockSala = inventario
    .filter((i) => i.bodega?.es_sala_ventas && apto(i.id_lote))
    .reduce((sum, i) => sum + i.stock_actual, 0);
  const conAlertas = inventario.some(
    (i) =>
      i.stock_actual > 0 &&
      diasHasta(mapaLotes.get(i.id_lote)!.fecha_vencimiento, hoy) <=
        datos.configuracion.dias_critico,
  );
  const idsInventario = new Set(inventario.map((i) => i.id_inventario));
  const ubicaciones = [...new Set(inventario.map((i) => i.id_bodega))].map(
    (id) => ({
      bodega: datos.bodegas.find((b) => b.id_bodega === id),
      stock: inventario
        .filter((i) => i.id_bodega === id)
        .reduce((sum, i) => sum + i.stock_actual, 0),
    }),
  );
  // Conserva el contexto pulsado; un lote agotado no se sustituye por otro al operar.
  const inventarioOperacion = (
    movimiento
      ? inventario.filter((i) => i.id_inventario === movimiento.id_inventario)
      : lote
        ? inventario.filter((i) => i.id_lote === lote.id_lote)
        : inventario
  )
    .filter((i) => i.stock_actual > 0)
    .sort(
      (a, b) =>
        Number(b.id_inventario === origen?.id_inventario) -
          Number(a.id_inventario === origen?.id_inventario) ||
        mapaLotes
          .get(a.id_lote)!
          .fecha_vencimiento.localeCompare(
            mapaLotes.get(b.id_lote)!.fecha_vencimiento,
          ) ||
        a.id_inventario - b.id_inventario,
    )[0];
  return {
    producto,
    categoria: categorias.find((c) => c.id_categoria === producto.id_categoria),
    stockActual,
    stockApto,
    stockSala,
    salasRegistradas: datos.bodegas.some(
      (b) => typeof b.es_sala_ventas === "boolean",
    ),
    stockBloqueado: stockActual - stockApto,
    estado:
      stockActual === 0
        ? "Sin stock"
        : stockApto === 0
          ? "Bloqueado por vencimiento"
          : conAlertas
            ? "Con lotes en alerta"
            : "Disponible",
    ubicaciones,
    lote,
    movimiento,
    inventarioOperacion,
    destino: movimiento?.id_bodega_destino
      ? datos.bodegas.find((b) => b.id_bodega === movimiento.id_bodega_destino)
      : undefined,
    lotes: lotes.map((l) => ({
      ...l,
      stock: inventario
        .filter((i) => i.id_lote === l.id_lote)
        .reduce((sum, i) => sum + i.stock_actual, 0),
      semaforo: calcularSemaforoLote(
        l.fecha_vencimiento,
        datos.configuracion,
        hoy,
      ),
    })),
    movimientos: datos.movimientos
      .filter((m) => idsInventario.has(m.id_inventario))
      .sort(
        (a, b) =>
          b.fecha.localeCompare(a.fecha) || b.id_movimiento - a.id_movimiento,
      )
      .slice(0, 5),
  };
}
