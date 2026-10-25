// ============================================================
//  Servicio del Dashboard - consultas y cálculos desde Supabase
//  Calcula los KPIs a partir de los datos reales de inventario,
//  lotes y notificaciones.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Inventario, Notificacion, EstadoSemaforo } from '@/tipos/database';

const supabase = createClient();

export interface DashboardKpis {
  totalUnidadesStock: number;
  totalLotesRegistrados: number;
  lotesVencidos: number;
  lotesCriticos: number;   // ROJO (<7 días)
  lotesAmarillos: number;  // AMARILLO (<30 días)
  lotesVerdes: number;
  porcentajeCumplimientoFEFO: number;
  alertasActivasSinLeer: number;
}

function calcularDiasRestantes(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.floor((new Date(fecha).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function calcularEstado(dias: number): EstadoSemaforo {
  if (dias < 0) return 'VENCIDO';
  if (dias <= 7) return 'ROJO';
  if (dias <= 30) return 'AMARILLO';
  return 'VERDE';
}

/** Trae el inventario con relaciones y el semáforo calculado. */
export async function obtenerInventarioDashboard(): Promise<Inventario[]> {
  const { data, error } = await supabase
    .from('inventario')
    .select('*, lote:lote(*, producto:producto(*)), bodega:bodega(*)')
    .order('id_inventario', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((item: Inventario) => {
    if (item.lote?.fecha_vencimiento) {
      const dias = calcularDiasRestantes(item.lote.fecha_vencimiento);
      item.lote.dias_restantes = dias;
      item.estado_semaforo = calcularEstado(dias);
    }
    return item;
  }) as Inventario[];
}

/** Calcula los KPIs del dashboard a partir del inventario y las alertas. */
export async function obtenerKpis(inventario: Inventario[]): Promise<DashboardKpis> {
  const totalUnidadesStock = inventario.reduce((s, i) => s + (i.stock_actual ?? 0), 0);
  const totalLotesRegistrados = inventario.length;

  const lotesVencidos = inventario.filter((i) => i.estado_semaforo === 'VENCIDO').length;
  const lotesCriticos = inventario.filter((i) => i.estado_semaforo === 'ROJO').length;
  const lotesAmarillos = inventario.filter((i) => i.estado_semaforo === 'AMARILLO').length;
  const lotesVerdes = inventario.filter((i) => i.estado_semaforo === 'VERDE').length;

  // Cumplimiento FEFO: proporción de lotes NO vencidos sobre el total
  const porcentajeCumplimientoFEFO =
    totalLotesRegistrados > 0
      ? Math.round(((totalLotesRegistrados - lotesVencidos) / totalLotesRegistrados) * 1000) / 10
      : 0;

  // Alertas sin leer (pendientes)
  const { count, error } = await supabase
    .from('notificacion')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'PENDIENTE');

  if (error) throw new Error(error.message);

  return {
    totalUnidadesStock,
    totalLotesRegistrados,
    lotesVencidos,
    lotesCriticos,
    lotesAmarillos,
    lotesVerdes,
    porcentajeCumplimientoFEFO,
    alertasActivasSinLeer: count ?? 0,
  };
}

/** Trae las notificaciones recientes para el dashboard. */
export async function obtenerNotificacionesRecientes(): Promise<Notificacion[]> {
  const { data, error } = await supabase
    .from('notificacion')
    .select('*')
    .order('fecha_envio', { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  return (data ?? []) as Notificacion[];
}
