import { leerTabla, solicitarDatos } from "./datos";
import type { Lote, Bodega, Producto } from "@/tipos/database";
import { obtenerOperacion } from "./operacion";
export { calcularSemaforoLote } from "./semaforo";
export interface LoteConDetalle extends Lote {
  producto: Producto;
  stock_total: number;
  bodega_nombre: string;
  id_bodega?: number;
  id_inventario?: number;
}
export interface NuevoLotePayload {
  id_producto: number;
  numero_lote: string;
  fecha_vencimiento: string;
  fecha_ingreso: string;
  id_bodega: number;
  stock_inicial: number;
  costo_unitario: number;
  fecha_fabricacion?: string;
  operacion: string;
}
export async function obtenerLotes(): Promise<LoteConDetalle[]> {
  const datos = await obtenerOperacion();
  return datos.lotes
    .map((l) => {
      const stocks = datos.inventario.filter((i) => i.id_lote === l.id_lote);
      return {
        ...l,
        producto: datos.productos.find((p) => p.id_producto === l.id_producto)!,
        stock_total: stocks.reduce((a, i) => a + i.stock_actual, 0),
        bodega_nombre: [...new Set(stocks.map((i) => i.bodega?.nombre))].join(
          ", ",
        ),
        estado_semaforo: stocks[0]?.estado_semaforo as Lote["estado_semaforo"],
        dias_restantes: stocks[0]?.lote?.dias_restantes,
      };
    })
    .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
}
export function obtenerBodegas(): Promise<Bodega[]> {
  return leerTabla("bodega");
}
export async function obtenerUmbrales() {
  const config = (await leerTabla("configuracion")).find((c) => c.id === 1);
  if (!config) throw new Error("Falta la configuración de SIGAF.");
  return config;
}
export async function crearLoteConInventario(payload: NuevoLotePayload) {
  await solicitarDatos({ accion: "recibir", datos: payload });
}
