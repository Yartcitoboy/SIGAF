// ============================================================
//  Servicio de Configuración - consultas a Supabase
//  Trae los datos de la farmacia y sus sucursales.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Farmacia, Sucursal } from '@/tipos/database';

const supabase = createClient();

/** Obtiene los datos de la farmacia (primera registrada). */
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

/** Obtiene todas las sucursales. */
export async function obtenerSucursales(): Promise<Sucursal[]> {
  const { data, error } = await supabase
    .from('sucursal')
    .select('*')
    .order('id_sucursal', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Sucursal[];
}

/** Actualiza los datos corporativos de la farmacia. */
export async function actualizarFarmacia(
  idFarmacia: number,
  cambios: { razon_social?: string; rut?: string; direccion?: string }
): Promise<Farmacia> {
  const { data, error } = await supabase
    .from('farmacia')
    .update(cambios)
    .eq('id_farmacia', idFarmacia)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Farmacia;
}

/** Crea una nueva sucursal. */
export async function crearSucursal(nueva: {
  nombre: string;
  direccion: string | null;
  id_farmacia: number;
}): Promise<Sucursal> {
  const { data, error } = await supabase
    .from('sucursal')
    .insert(nueva)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Sucursal;
}

/** Actualiza una sucursal existente. */
export async function actualizarSucursal(
  idSucursal: number,
  cambios: { nombre?: string; direccion?: string | null }
): Promise<Sucursal> {
  const { data, error } = await supabase
    .from('sucursal')
    .update(cambios)
    .eq('id_sucursal', idSucursal)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Sucursal;
}
