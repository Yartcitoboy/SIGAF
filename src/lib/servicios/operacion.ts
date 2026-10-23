import type { Inventario } from "@/tipos/database";
import { leerTabla, solicitarDatos } from "./datos";
import { calcularSemaforoLote } from "./semaforo";

export async function obtenerOperacion() {
  const [
    inventarios,
    lotes,
    productos,
    bodegas,
    movimientos,
    mermas,
    sucursales,
    farmacias,
    config,
  ] = await Promise.all([
    leerTabla("inventario"),
    leerTabla("lote"),
    leerTabla("producto"),
    leerTabla("bodega"),
    leerTabla("movimiento_inventario"),
    leerTabla("merma"),
    leerTabla("sucursal"),
    leerTabla("farmacia"),
    leerTabla("configuracion"),
  ]);
  const configuracion = config.find((c) => c.id === 1);
  if (!configuracion)
    throw new Error(
      "Falta la configuración de SIGAF en la base de datos activa.",
    );
  const productosMap = new Map(productos.map((p) => [p.id_producto, p]));
  const lotesMap = new Map(
    lotes.map((l) => [
      l.id_lote,
      { ...l, producto: productosMap.get(l.id_producto) },
    ]),
  );
  const bodegasMap = new Map(bodegas.map((b) => [b.id_bodega, b]));
  const inventario: Inventario[] = inventarios.map((i) => {
    const lote = lotesMap.get(i.id_lote);
    return {
      ...i,
      lote: lote
        ? {
            ...lote,
            dias_restantes: calcularSemaforoLote(
              lote.fecha_vencimiento,
              configuracion,
            ).diasRestantes,
          }
        : undefined,
      bodega: bodegasMap.get(i.id_bodega),
      estado_semaforo: lote
        ? calcularSemaforoLote(lote.fecha_vencimiento, configuracion).estado
        : null,
    };
  });
  const mapa = new Map(inventario.map((i) => [i.id_inventario, i]));
  return {
    inventario,
    productos,
    bodegas,
    lotes,
    configuracion,
    sucursales,
    farmacias,
    movimientos: movimientos.map((m) => ({
      ...m,
      inventario: mapa.get(m.id_inventario),
    })),
    mermas: mermas.map((m) => ({
      ...m,
      inventario: mapa.get(m.id_inventario),
    })),
  };
}
export type DatosOperacion = Awaited<ReturnType<typeof obtenerOperacion>>;
export async function operarStock(datos: {
  inventario: number;
  cantidad: number;
  tipo: "SALIDA" | "MERMA" | "TRASLADO";
  motivo?: string;
  destino?: number;
  operacion: string;
}) {
  await solicitarDatos({ accion: "operar", datos });
}
