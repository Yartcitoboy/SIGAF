import type { DatosOperacion } from "@/lib/servicios/operacion";
import type {
  FiltroReporte,
  TablaReporte,
  TipoInforme,
} from "@/lib/servicios/reportes";
import { diaMovimiento, fechaHoraVisible } from "./presentacion";

// Solo prepara la vista y los archivos descargados en el navegador.
// No cambia servicios, registros ni el alcance de datos autorizado por el servidor.
export function prepararInformeVisible(
  datos: DatosOperacion,
  tipo: TipoInforme,
  filtro: FiltroReporte,
): TablaReporte {
  const sucursales = new Set(
    datos.sucursales
      .filter(
        (s) =>
          s.id_farmacia === filtro.farmacia &&
          (!filtro.sucursal || s.id_sucursal === filtro.sucursal),
      )
      .map((s) => s.id_sucursal),
  );
  const bodegas = new Set(
    datos.bodegas
      .filter(
        (b) =>
          sucursales.has(b.id_sucursal) &&
          (!filtro.bodega || b.id_bodega === filtro.bodega),
      )
      .map((b) => b.id_bodega),
  );
  const dentro = (fecha: string) => {
    const dia = diaMovimiento(fecha);
    return (
      Boolean(dia) &&
      (!filtro.desde || dia >= filtro.desde) &&
      (!filtro.hasta || dia <= filtro.hasta)
    );
  };
  if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta)
    return { titulo: "Revisa el rango de fechas", columnas: [], filas: [] };
  if (tipo === "INVENTARIO")
    return {
      titulo: "Informe de inventario",
      columnas: [
        "Medicamento",
        "Presentación",
        "Lote",
        "Ubicación",
        "Stock físico",
        "Vencimiento",
        "Estado",
        "Costo unit. CLP",
      ],
      filas: datos.inventario
        .filter(
          (i) =>
            bodegas.has(i.id_bodega) &&
            i.lote &&
            dentro(i.lote.fecha_vencimiento),
        )
        .map((i) => [
          i.lote?.producto?.nombre || "Sin producto",
          i.lote?.producto?.unidad_medida || "Sin especificar",
          i.lote?.numero_lote || "",
          i.bodega?.nombre || "",
          i.stock_actual,
          i.lote?.fecha_vencimiento || "",
          i.estado_semaforo || "Sin clasificar",
          i.lote?.costo_unitario ?? "Sin costo registrado",
        ]),
    };
  if (tipo === "MERMAS")
    return {
      titulo: "Registro de mermas y acta de baja",
      columnas: [
        "Fecha de baja",
        "Medicamento",
        "Lote",
        "Ubicación",
        "Cantidad",
        "Motivo",
        "Costo unit. CLP",
        "Responsable ID",
      ],
      filas: datos.mermas
        .filter(
          (m) =>
            m.inventario &&
            bodegas.has(m.inventario.id_bodega) &&
            dentro(m.fecha_baja),
        )
        .map((m) => [
          m.fecha_baja,
          m.inventario?.lote?.producto?.nombre || "",
          m.inventario?.lote?.numero_lote || "",
          m.inventario?.bodega?.nombre || "",
          m.cantidad,
          m.motivo,
          m.costo_unitario ?? "Sin costo registrado",
          m.id_usuario,
        ]),
    };
  return {
    titulo: "Libro de movimientos",
    columnas: [
      "Fecha",
      "Operación",
      "Medicamento",
      "Lote",
      "Origen",
      "Destino",
      "Cantidad",
      "FEFO",
      "Responsable ID",
    ],
    filas: datos.movimientos
      .filter(
        (m) =>
          dentro(m.fecha) &&
          ((m.inventario && bodegas.has(m.inventario.id_bodega)) ||
            (m.id_bodega_destino != null && bodegas.has(m.id_bodega_destino))),
      )
      .sort(
        (a, b) =>
          b.fecha.localeCompare(a.fecha) || b.id_movimiento - a.id_movimiento,
      )
      .map((m) => [
        fechaHoraVisible(m.fecha),
        m.tipo_movimiento,
        m.inventario?.lote?.producto?.nombre || "",
        m.inventario?.lote?.numero_lote || "",
        m.inventario?.bodega?.nombre || "Sin origen disponible",
        m.tipo_movimiento === "TRASLADO"
          ? datos.bodegas.find((b) => b.id_bodega === m.id_bodega_destino)
              ?.nombre || "Sin destino consignado"
          : "No aplica",
        m.cantidad,
        m.cumple_fefo == null ? "No evaluado" : m.cumple_fefo ? "Sí" : "No",
        m.id_usuario,
      ]),
  };
}
