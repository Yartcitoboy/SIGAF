// ============================================================
//  Servicio de Lotes e Inventario FEFO - consultas a Supabase
//  Capa de acceso a datos y lógica de dominio sanitario.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Lote, Bodega, EstadoSemaforo, Producto } from '@/tipos/database';

const supabase = createClient();

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
  fecha_vencimiento: string; // YYYY-MM-DD
  fecha_ingreso: string;     // YYYY-MM-DD
  id_bodega: number;
  stock_inicial: number;
}

/**
 * Calcula el estado de semáforo de caducidad en base a los días restantes.
 * Regla de negocio sanitaria SIGAF:
 * - < 0 días: VENCIDO (Caducado, bloqueo automático)
 * - <= 30 días: ROJO (Crítico, prioridad máxima de despacho o merma)
 * - <= 90 días: AMARILLO (Preventivo, monitoreo de rotación)
 * - > 90 días: VERDE (Vigente)
 */
export function calcularSemaforoLote(fechaVencimiento: string): {
  diasRestantes: number;
  estado: EstadoSemaforo;
} {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [year, month, day] = fechaVencimiento.split('-').map(Number);
  const venc = new Date(year, month - 1, day);
  venc.setHours(0, 0, 0, 0);

  const diffMs = venc.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let estado: EstadoSemaforo = 'VERDE';
  if (diasRestantes < 0) {
    estado = 'VENCIDO';
  } else if (diasRestantes <= 30) {
    estado = 'ROJO';
  } else if (diasRestantes <= 90) {
    estado = 'AMARILLO';
  } else {
    estado = 'VERDE';
  }

  return { diasRestantes, estado };
}

/** Obtiene todos los lotes con su producto asociado e inventario físico (Orden FEFO). */
export async function obtenerLotes(): Promise<LoteConDetalle[]> {
  const { data, error } = await supabase
    .from('lote')
    .select(`
      *,
      producto:id_producto (*),
      inventario:inventario (
        id_inventario,
        id_bodega,
        stock_actual,
        estado_semaforo,
        bodega:id_bodega (*)
      )
    `)
    .order('fecha_vencimiento', { ascending: true }); // Principio FEFO

  if (error) throw new Error(error.message);

  return (data ?? []).map((item: any) => {
    const semaforoInfo = calcularSemaforoLote(item.fecha_vencimiento);
    const inventarios = Array.isArray(item.inventario) ? item.inventario : [];
    
    // Sumatoria de stock de este lote en las bodegas
    const stockTotal = inventarios.reduce((acc: number, inv: any) => acc + (inv.stock_actual || 0), 0);
    const primeraBodega = inventarios[0]?.bodega?.nombre || 'Bodega Central';
    const primerIdBodega = inventarios[0]?.id_bodega;
    const primerIdInventario = inventarios[0]?.id_inventario;

    return {
      ...item,
      dias_restantes: semaforoInfo.diasRestantes,
      estado_semaforo: semaforoInfo.estado,
      stock_total: stockTotal,
      bodega_nombre: primeraBodega,
      id_bodega: primerIdBodega,
      id_inventario: primerIdInventario,
    };
  }) as LoteConDetalle[];
}

/** Obtiene las bodegas físicas disponibles para asignación de stock. */
export async function obtenerBodegas(): Promise<Bodega[]> {
  const { data, error } = await supabase
    .from('bodega')
    .select('*, sucursal(*)')
    .order('id_bodega', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Bodega[];
}

/**
 * Registra una entrada de mercadería:
 * 1. Crea el lote farmacéutico.
 * 2. Asigna el stock físico en la tabla `inventario`.
 * 3. Registra el movimiento de entrada para auditoría.
 */
export async function crearLoteConInventario(payload: NuevoLotePayload): Promise<void> {
  const semaforo = calcularSemaforoLote(payload.fecha_vencimiento);

  // 1. Insertar Lote
  const { data: loteCreado, error: errorLote } = await supabase
    .from('lote')
    .insert([
      {
        id_producto: payload.id_producto,
        numero_lote: payload.numero_lote.trim(),
        fecha_vencimiento: payload.fecha_vencimiento,
        fecha_ingreso: payload.fecha_ingreso,
      },
    ])
    .select()
    .single();

  if (errorLote) {
    throw new Error(`Error al registrar lote: ${errorLote.message}`);
  }

  // 2. Insertar Inventario vinculado al Lote
  const { data: invCreado, error: errorInv } = await supabase
    .from('inventario')
    .insert([
      {
        id_lote: loteCreado.id_lote,
        id_bodega: payload.id_bodega,
        stock_actual: payload.stock_inicial,
        estado_semaforo: semaforo.estado,
      },
    ])
    .select()
    .single();

  if (errorInv) {
    throw new Error(`Lote creado (ID ${loteCreado.id_lote}), pero falló el registro en inventario: ${errorInv.message}`);
  }

  // 3. Auditoría de movimiento (si existe usuario demo o autenticado)
  try {
    const { data: user } = await supabase.from('usuario').select('id_usuario').limit(1).single();
    if (user && invCreado) {
      await supabase.from('movimiento_inventario').insert([
        {
          id_inventario: invCreado.id_inventario,
          id_usuario: user.id_usuario,
          tipo_movimiento: 'ENTRADA',
          cantidad: payload.stock_inicial,
        },
      ]);
    }
  } catch {
    // Si falla la auditoría opcional, no bloqueamos la operación principal
  }
}
