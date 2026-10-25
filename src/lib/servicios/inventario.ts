// ============================================================
//  Servicio de Inventario - consultas a Supabase
//  Trae el stock con su lote, producto y bodega relacionados,
//  y calcula los días restantes y el estado del semáforo.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Inventario, Bodega, EstadoSemaforo } from '@/tipos/database';

const supabase = createClient();

/** Calcula los días que faltan para el vencimiento (negativo si ya venció). */
function calcularDiasRestantes(fechaVencimiento: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  return Math.floor((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

/** Determina el color del semáforo según los días restantes. */
function calcularEstadoSemaforo(dias: number): EstadoSemaforo {
  if (dias < 0) return 'VENCIDO';
  if (dias <= 7) return 'ROJO';
  if (dias <= 30) return 'AMARILLO';
  return 'VERDE';
}

/** Obtiene el inventario con lote, producto y bodega relacionados. */
export async function obtenerInventario(): Promise<Inventario[]> {
  const { data, error } = await supabase
    .from('inventario')
    .select(`
      *,
      lote:lote (
        *,
        producto:producto ( * )
      ),
      bodega:bodega ( * )
    `)
    .order('id_inventario', { ascending: true });

  if (error) throw new Error(error.message);

  // Enriquecer cada registro con días restantes y estado del semáforo calculados
  const inventario = (data ?? []).map((item: Inventario) => {
    if (item.lote?.fecha_vencimiento) {
      const dias = calcularDiasRestantes(item.lote.fecha_vencimiento);
      item.lote.dias_restantes = dias;
      item.estado_semaforo = calcularEstadoSemaforo(dias);
    }
    return item;
  });

  return inventario as Inventario[];
}

/** Obtiene todas las bodegas (para el filtro). */
export async function obtenerBodegas(): Promise<Bodega[]> {
  const { data, error } = await supabase
    .from('bodega')
    .select('*')
    .order('id_bodega', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Bodega[];
}
