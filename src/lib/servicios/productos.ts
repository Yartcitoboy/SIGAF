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
