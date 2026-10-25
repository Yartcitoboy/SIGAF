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

/** Actualiza un producto existente en la base de datos. */
export async function actualizarProducto(
  idProducto: number,
  cambios: Partial<Producto>
): Promise<Producto> {
  const { data, error } = await supabase
    .from('producto')
    .update(cambios)
    .eq('id_producto', idProducto)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Producto;
}

/** Crea un nuevo producto en la base de datos. */
export async function crearProducto(nuevo: Partial<Producto>): Promise<Producto> {
  const { data, error } = await supabase
    .from('producto')
    .insert(nuevo)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Producto;
}

/** Elimina un producto de la base de datos. */
export async function eliminarProducto(idProducto: number): Promise<void> {
  const { error } = await supabase
    .from('producto')
    .delete()
    .eq('id_producto', idProducto);

  if (error) throw new Error(error.message);
}
