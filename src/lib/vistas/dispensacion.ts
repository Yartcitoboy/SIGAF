import type { DatosOperacion } from "@/lib/servicios/operacion";
import { diasHasta, fechaValida } from "../servicios/fechas";

// Recomendación visual sobre filas ya autorizadas. La operación SQL sigue
// comprobando permisos, stock y FEFO al confirmar una salida real.
export function planificarDispensacion(
  datos: DatosOperacion,
  idProducto: number | null,
  idBodega?: number,
  hoy = datos.hoy,
) {
  const bodega = datos.bodegas.find((b) => b.id_bodega === idBodega);
  const origenInvalido = idBodega !== undefined && !bodega;
  const ids = new Set(
    datos.bodegas
      .filter((b) => !bodega || b.id_sucursal === bodega.id_sucursal)
      .map((b) => b.id_bodega),
  );
  const ordenados = datos.inventario
    .filter(
      (i) =>
        !origenInvalido &&
        ids.has(i.id_bodega) &&
        i.lote?.id_producto === idProducto &&
        i.stock_actual > 0,
    )
    .sort(
      (a, b) =>
        String(a.lote!.fecha_vencimiento ?? "").localeCompare(
          String(b.lote!.fecha_vencimiento ?? ""),
        ) ||
        String(a.lote!.fecha_ingreso ?? "").localeCompare(
          String(b.lote!.fecha_ingreso ?? ""),
        ) ||
        a.id_inventario - b.id_inventario,
    );
  const lotes = ordenados.filter(
    (i) => idBodega === undefined || i.id_bodega === idBodega,
  );
  const fechasIncompletas = ordenados.some(
    (i) => !fechaValida(i.lote!.fecha_vencimiento),
  );
  const aptos = ordenados.filter(
    (i) =>
      fechaValida(i.lote!.fecha_vencimiento) &&
      diasHasta(i.lote!.fecha_vencimiento, hoy) >
        datos.configuracion.holgura_dias,
  );
  const sugerido = fechasIncompletas
    ? undefined
    : aptos.find((i) => i.bodega?.es_sala_ventas === true);
  const otraUbicacion = Boolean(
    sugerido && bodega && sugerido.id_bodega !== bodega.id_bodega,
  );
  const sinClasificacion = ordenados.some(
    (i) => typeof i.bodega?.es_sala_ventas !== "boolean",
  );
  const estado = origenInvalido
    ? "ORIGEN_NO_AUTORIZADO"
    : fechasIncompletas
      ? "FECHA_NO_DISPONIBLE"
      : !ordenados.length
        ? "SIN_STOCK"
        : !aptos.length
          ? "BLOQUEADO_FECHA"
          : !sugerido
            ? sinClasificacion
              ? "CLASIFICACION_PENDIENTE"
              : "REPOSICION"
            : otraUbicacion
              ? "OTRA_UBICACION_FEFO"
              : "LISTO";
  return { lotes, sugerido, otraUbicacion, bodega, estado } as const;
}
