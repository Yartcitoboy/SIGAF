// ============================================================
//  Servicio de Notificaciones / Alertas - consultas a Supabase
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Notificacion } from '@/tipos/database';

const supabase = createClient();

/** Obtiene todas las notificaciones ordenadas por fecha (más recientes primero). */
export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const { data, error } = await supabase
    .from('notificacion')
    .select('*')
    .order('fecha_envio', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Notificacion[];
}

/** Marca una notificación como leída (atendida) en la base de datos. */
export async function marcarNotificacionLeida(id: number): Promise<void> {
  const { error } = await supabase
    .from('notificacion')
    .update({ estado: 'LEIDO' })
    .eq('id_notificacion', id);

  if (error) throw new Error(error.message);
}
