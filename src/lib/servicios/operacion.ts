import type { Inventario } from "@/tipos/database";
import { solicitarDatos } from "./datos";
import { calcularSemaforoLote } from "./semaforo";

export async function obtenerOperacion() {
  const base = await solicitarDatos<{
    inventario: import("@/tipos/database").Inventario[];
    lote: import("@/tipos/database").Lote[];
    producto: import("@/tipos/database").Producto[];
    bodega: import("@/tipos/database").Bodega[];
    movimiento_inventario: import("@/tipos/database").MovimientoInventario[];
    merma: import("@/tipos/database").Merma[];
    sucursal: import("@/tipos/database").Sucursal[];
    farmacia: import("@/tipos/database").Farmacia[];
    configuracion: import("@/tipos/database").Configuracion[];
    sistema: import("../datos/contexto").ContextoSistema;
  }>({ accion: "operacion", alcance: "completo" });
  const {
    inventario: inventarios,
    lote: lotes,
    producto: productos,
    bodega: bodegas,
    movimiento_inventario: movimientos,
    merma: mermas,
    sucursal: sucursales,
    farmacia: farmacias,
    configuracion: config,
    sistema,
  } = base;
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
              sistema.hoy,
            ).diasRestantes,
          }
        : undefined,
      bodega: bodegasMap.get(i.id_bodega),
      estado_semaforo: lote
        ? calcularSemaforoLote(
            lote.fecha_vencimiento,
            configuracion,
            sistema.hoy,
          ).estado
        : null,
    };
  });
  const mapa = new Map(inventario.map((i) => [i.id_inventario, i]));
  return {
    hoy: sistema.hoy,
    ahora: sistema.ahora,
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

export async function obtenerConfiguracionOperacion() {
  const base = await solicitarDatos<{
    bodegasConStock: number[];
    bodega: DatosOperacion["bodegas"];
    sucursal: DatosOperacion["sucursales"];
    farmacia: DatosOperacion["farmacias"];
    configuracion: DatosOperacion["configuracion"][];
    sistema: import("../datos/contexto").ContextoSistema;
  }>({ accion: "operacion", alcance: "configuracion" });
  const configuracion = base.configuracion.find((c) => c.id === 1);
  if (!configuracion) throw new Error("Falta la configuración en Supabase.");
  return {
    bodegasConStock:base.bodegasConStock,
    bodegas: base.bodega,
    sucursales: base.sucursal,
    farmacias: base.farmacia,
    configuracion,
    hoy: base.sistema.hoy,
    ahora: base.sistema.ahora,
  };
}
