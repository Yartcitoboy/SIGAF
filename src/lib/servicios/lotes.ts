// ============================================================
//  Servicio de Lotes - consultas a Supabase
//  Trae los lotes con su producto, cruza con inventario para
//  obtener stock y bodega, y calcula días restantes y semáforo.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Lote, Producto, EstadoSemaforo } from '@/tipos/database';

const supabase = createClient();

export interface LoteConStock extends Lote {
  producto?: Producto;
  dias_restantes?: number;
  estado_semaforo?: EstadoSemaforo;
  stock: number;
  bodega: string;
}

function calcularDiasRestantes(fechaVencimiento: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  return Math.floor((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function calcularEstadoSemaforo(dias: number): EstadoSemaforo {
  if (dias < 0) return 'VENCIDO';
  if (dias <= 7) return 'ROJO';
  if (dias <= 30) return 'AMARILLO';
  return 'VERDE';
}

/** Obtiene los lotes con producto, stock y bodega, y calcula el semáforo. */
export async function obtenerLotes(): Promise<LoteConStock[]> {
  // Lotes con su producto
  const { data: lotes, error: errLotes } = await supabase
    .from('lote')
    .select('*, producto:producto(*)')
    .order('fecha_vencimiento', { ascending: true });

  if (errLotes) throw new Error(errLotes.message);

  // Inventario con su bodega (para cruzar stock y ubicación por lote)
  const { data: inventario, error: errInv } = await supabase
    .from('inventario')
    .select('id_lote, stock_actual, bodega:bodega(nombre)');

  if (errInv) throw new Error(errInv.message);

  const resultado: LoteConStock[] = (lotes ?? []).map((lote: Lote) => {
    const inv = (inventario ?? []).find(
      (i: { id_lote: number }) => i.id_lote === lote.id_lote
    ) as { stock_actual?: number; bodega?: { nombre?: string } } | undefined;

    const dias = lote.fecha_vencimiento ? calcularDiasRestantes(lote.fecha_vencimiento) : 0;

    return {
      ...lote,
      dias_restantes: dias,
      estado_semaforo: calcularEstadoSemaforo(dias),
      stock: inv?.stock_actual ?? 0,
      bodega: inv?.bodega?.nombre ?? 'Sin asignar',
    };
  });

  return resultado;
}

/** Obtiene los productos (para el selector al registrar un lote). */
export async function obtenerProductosParaLote() {
  const { data, error } = await supabase
    .from('producto')
    .select('id_producto, nombre, codigo_barras')
    .order('nombre', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Obtiene las bodegas (para el selector al registrar un lote). */
export async function obtenerBodegasParaLote() {
  const { data, error } = await supabase
    .from('bodega')
    .select('id_bodega, nombre')
    .order('id_bodega', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Registra la entrada de un lote de mercadería:
 * 1. Crea el lote (producto + nº lote + vencimiento)
 * 2. Crea el registro de inventario (stock en una bodega)
 * 3. Registra el movimiento de ENTRADA
 */
export async function registrarEntradaLote(datos: {
  id_producto: number;
  numero_lote: string;
  fecha_vencimiento: string;
  id_bodega: number;
  cantidad: number;
  id_usuario: string;
}): Promise<void> {
  // 1. Crear el lote
  const { data: lote, error: errLote } = await supabase
    .from('lote')
    .insert({
      numero_lote: datos.numero_lote,
      fecha_vencimiento: datos.fecha_vencimiento,
      id_producto: datos.id_producto,
    })
    .select()
    .single();
  if (errLote) throw new Error(errLote.message);

  // 2. Crear el inventario (stock del lote en la bodega)
  const { data: inv, error: errInv } = await supabase
    .from('inventario')
    .insert({
      id_lote: lote.id_lote,
      id_bodega: datos.id_bodega,
      stock_actual: datos.cantidad,
      estado_semaforo: 'VERDE',
    })
    .select()
    .single();
  if (errInv) throw new Error(errInv.message);

  // 3. Registrar el movimiento de entrada
  const { error: errMov } = await supabase.from('movimiento_inventario').insert({
    id_inventario: inv.id_inventario,
    id_usuario: datos.id_usuario,
    tipo_movimiento: 'ENTRADA',
    cantidad: datos.cantidad,
  });
  if (errMov) throw new Error(errMov.message);
}
