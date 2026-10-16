// ============================================================
//  Servicio de Productos - consultas a Supabase
//  Capa de acceso a datos para el catálogo de productos.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Producto, Categoria } from '@/tipos/database';

const supabase = createClient();

/** Obtiene todos los productos desde la base de datos. */
export async function obtenerProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('producto')
    .select('*')
    .order('id_producto', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Producto[];
}

/** Obtiene todas las categorías desde la base de datos. */
export async function obtenerCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categoria')
    .select('*')
    .order('id_categoria', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Categoria[];
}

export interface NuevoProducto {
  nombre: string;
  descripcion?: string | null;
  codigo_barras?: string | null;
  unidad_medida?: string | null;
  id_categoria: number;
}

/** Inserta un nuevo medicamento en el catálogo maestro. */
export async function crearProducto(producto: NuevoProducto): Promise<Producto> {
  const { data, error } = await supabase
    .from('producto')
    .insert([
      {
        nombre: producto.nombre.trim(),
        descripcion: producto.descripcion?.trim() || null,
        codigo_barras: producto.codigo_barras?.trim() || null,
        unidad_medida: producto.unidad_medida?.trim() || null,
        id_categoria: producto.id_categoria,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`El código de barras "${producto.codigo_barras}" ya está registrado en el sistema.`);
    }
    throw new Error(error.message);
  }

  return data as Producto;
}

