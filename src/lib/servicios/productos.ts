import { leerTabla, guardarFila } from "./datos";
import type { Producto, Categoria } from "@/tipos/database";
export function obtenerProductos(): Promise<Producto[]> {
  return leerTabla("producto");
}
export function obtenerCategorias(): Promise<Categoria[]> {
  return leerTabla("categoria");
}
export interface NuevoProducto {
  nombre: string;
  descripcion?: string | null;
  codigo_barras?: string | null;
  unidad_medida?: string | null;
  id_categoria: number;
  principio_activo?: string | null;
  registro_isp?: string | null;
  vida_util_meses?: number | null;
}
export async function guardarProducto(
  producto: NuevoProducto,
  id?: number,
): Promise<Producto> {
  const datos = {
    ...producto,
    nombre: producto.nombre.trim(),
    codigo_barras: producto.codigo_barras?.trim() || null,
  };
  const [data] = await guardarFila("producto", datos, id);
  return data;
}
export const crearProducto = (producto: NuevoProducto) =>
  guardarProducto(producto);
