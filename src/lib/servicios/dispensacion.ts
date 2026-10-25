// ============================================================
//  Servicio de Dispensación (Motor FEFO) - SIGAF
//  Usa la función RPC fn_fefo_siguiente_lote de PostgreSQL para
//  determinar qué lote despachar primero (First Expired, First Out)
//  y bloquea la dispensación de productos vencidos.
// ============================================================
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface ProductoDisponible {
  id_producto: number;
  nombre: string;
  codigo_barras: string | null;
}

export interface Bodega {
  id_bodega: number;
  nombre: string;
}

export interface LoteFEFO {
  id_inventario: number;
  id_lote: number;
  numero_lote: string;
  fecha_vencimiento: string;
  stock_actual: number;
}

/** Productos que tienen stock disponible para dispensar. */
export async function obtenerProductosDispensables(): Promise<ProductoDisponible[]> {
  const { data, error } = await supabase
    .from('producto')
    .select('id_producto, nombre, codigo_barras')
    .order('nombre', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductoDisponible[];
}

/** Bodegas disponibles. */
export async function obtenerBodegas(): Promise<Bodega[]> {
  const { data, error } = await supabase
    .from('bodega')
    .select('id_bodega, nombre')
    .order('id_bodega', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Bodega[];
}

/**
 * Consulta el lote a despachar según FEFO para un producto y bodega.
 * Llama a la función RPC de PostgreSQL. Devuelve null si no hay lote
 * válido (sin stock o todos vencidos = bloqueo sanitario).
 */
export async function consultarLoteFEFO(
  idProducto: number,
  idBodega: number
): Promise<LoteFEFO | null> {
  const { data, error } = await supabase.rpc('fn_fefo_siguiente_lote', {
    p_id_producto: idProducto,
    p_id_bodega: idBodega,
  });
  if (error) throw new Error(error.message);
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return (Array.isArray(data) ? data[0] : data) as LoteFEFO;
}

/**
 * Dispensa (vende) una cantidad de un producto aplicando FEFO:
 * 1. Obtiene el lote a despachar (el que vence primero, no vencido)
 * 2. Valida stock suficiente
 * 3. Descuenta el stock
 * 4. Registra el movimiento de SALIDA
 */
export async function dispensar(
  idProducto: number,
  idBodega: number,
  cantidad: number,
  idUsuario: string
): Promise<{ numero_lote: string; despachado: number; stock_restante: number }> {
  const lote = await consultarLoteFEFO(idProducto, idBodega);

  if (!lote) {
    throw new Error(
      'No hay stock disponible o el producto está vencido. Dispensación bloqueada por seguridad sanitaria.'
    );
  }
  if (lote.stock_actual < cantidad) {
    throw new Error(
      `Stock insuficiente en el lote ${lote.numero_lote}. Disponible: ${lote.stock_actual} unidades.`
    );
  }

  // Descontar stock
  const { error: errStock } = await supabase
    .from('inventario')
    .update({ stock_actual: lote.stock_actual - cantidad })
    .eq('id_inventario', lote.id_inventario);
  if (errStock) throw new Error(errStock.message);

  // Registrar el movimiento de salida
  const { error: errMov } = await supabase.from('movimiento_inventario').insert({
    id_inventario: lote.id_inventario,
    id_usuario: idUsuario,
    tipo_movimiento: 'SALIDA',
    cantidad,
  });
  if (errMov) throw new Error(errMov.message);

  return {
    numero_lote: lote.numero_lote,
    despachado: cantidad,
    stock_restante: lote.stock_actual - cantidad,
  };
}
