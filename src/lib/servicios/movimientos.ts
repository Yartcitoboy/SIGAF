// ============================================================
//  Servicio de Movimientos - consultas a Supabase
//  Trae el historial de movimientos con el usuario responsable
//  y las sucursales para el modal de traslado.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { MovimientoInventario, Sucursal } from '@/tipos/database';

const supabase = createClient();

/** Obtiene el historial de movimientos con su usuario responsable. */
export async function obtenerMovimientos(): Promise<MovimientoInventario[]> {
  const { data, error } = await supabase
    .from('movimiento_inventario')
    .select('*, usuario:usuario(nombre, perfil:perfil(nombre))')
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as MovimientoInventario[];
}

/** Obtiene las sucursales (para el modal de traslado). */
export async function obtenerSucursales(): Promise<Sucursal[]> {
  const { data, error } = await supabase
    .from('sucursal')
    .select('*')
    .order('id_sucursal', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Sucursal[];
}

/** Lista el inventario disponible (para elegir qué lote afectar). */
export async function obtenerInventarioDisponible() {
  const { data, error } = await supabase
    .from('inventario')
    .select('id_inventario, stock_actual, lote:lote(numero_lote, producto:producto(nombre))')
    .gt('stock_actual', 0)
    .order('id_inventario', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Registra un movimiento (MERMA o TRASLADO) y descuenta el stock del inventario.
 */
export async function registrarMovimiento(datos: {
  id_inventario: number;
  tipo: 'MERMA' | 'TRASLADO';
  cantidad: number;
  stockActual: number;
  id_usuario: string;
  motivo?: string;
}): Promise<void> {
  if (datos.cantidad > datos.stockActual) {
    throw new Error(`La cantidad supera el stock disponible (${datos.stockActual}).`);
  }

  // 1. Registrar el movimiento
  const { error: errMov } = await supabase.from('movimiento_inventario').insert({
    id_inventario: datos.id_inventario,
    id_usuario: datos.id_usuario,
    tipo_movimiento: datos.tipo,
    cantidad: datos.cantidad,
  });
  if (errMov) throw new Error(errMov.message);

  // 2. Descontar el stock
  const { error: errStock } = await supabase
    .from('inventario')
    .update({ stock_actual: datos.stockActual - datos.cantidad })
    .eq('id_inventario', datos.id_inventario);
  if (errStock) throw new Error(errStock.message);

  // 3. Si es MERMA, registrar también en la tabla merma
  if (datos.tipo === 'MERMA') {
    const { error: errMerma } = await supabase.from('merma').insert({
      id_inventario: datos.id_inventario,
      id_usuario: datos.id_usuario,
      motivo: datos.motivo ?? 'VENCIMIENTO',
      cantidad: datos.cantidad,
    });
    if (errMerma) throw new Error(errMerma.message);
  }
}
