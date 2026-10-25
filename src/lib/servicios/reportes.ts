// ============================================================
//  Servicio de Reportes - consultas a Supabase
//  - Obtiene datos reales de inventario para los informes.
//  - Registra en la tabla "reporte" cada documento generado.
//  - Lista el historial de reportes generados.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Inventario, Reporte, Farmacia, EstadoSemaforo } from '@/tipos/database';

const supabase = createClient();

// ID de usuario de demostración (Administrador). En producción vendría de la sesión.
const USUARIO_DEMO = '00000000-0000-0000-0000-000000000001';

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

/** Trae los datos del inventario (para armar el contenido del reporte). */
export async function obtenerDatosInventario(): Promise<Inventario[]> {
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

/** Obtiene los datos de la farmacia (para el encabezado del reporte). */
export async function obtenerFarmacia(): Promise<Farmacia | null> {
  const { data, error } = await supabase
    .from('farmacia')
    .select('*')
    .order('id_farmacia', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Farmacia | null;
}

/** Registra en la tabla "reporte" que se generó un documento. */
export async function registrarReporte(tipo: string, formato: string): Promise<void> {
  const { error } = await supabase.from('reporte').insert({
    id_usuario: USUARIO_DEMO,
    tipo,
    formato,
  });
  if (error) throw new Error(error.message);
}

/** Lista el historial de reportes generados, con el usuario que lo generó. */
export async function obtenerHistorialReportes(): Promise<Reporte[]> {
  const { data, error } = await supabase
    .from('reporte')
    .select('*, usuario:usuario(nombre)')
    .order('fecha_generacion', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Reporte[];
}
