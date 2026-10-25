// ============================================================
//  Servicio de Usuarios - consultas a Supabase
//  Trae el personal con su perfil (rol) y sucursal asignada.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Usuario, Perfil, Sucursal } from '@/tipos/database';

const supabase = createClient();

/** Obtiene todos los usuarios con su perfil y sucursal relacionados. */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select('*, perfil:perfil(nombre, descripcion), sucursal:sucursal(nombre)')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Usuario[];
}

/** Obtiene los perfiles disponibles (para el selector de rol). */
export async function obtenerPerfiles(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('perfil')
    .select('*')
    .order('id_perfil', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Perfil[];
}

/** Obtiene las sucursales (para el selector de sucursal). */
export async function obtenerSucursales(): Promise<Sucursal[]> {
  const { data, error } = await supabase
    .from('sucursal')
    .select('*')
    .order('id_sucursal', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Sucursal[];
}

/** Crea un nuevo usuario. */
export async function crearUsuario(nuevo: {
  nombre: string;
  email: string;
  id_perfil: number;
  id_sucursal: number | null;
  activo: boolean;
}): Promise<Usuario> {
  // password_hash de demostración (en producción se usa Supabase Auth)
  const { data, error } = await supabase
    .from('usuario')
    .insert({ ...nuevo, password_hash: '$2a$10$demohashnuevo' })
    .select('*, perfil:perfil(nombre, descripcion), sucursal:sucursal(nombre)')
    .single();

  if (error) throw new Error(error.message);
  return data as Usuario;
}

/** Actualiza un usuario existente. */
export async function actualizarUsuario(
  idUsuario: string,
  cambios: {
    nombre?: string;
    email?: string;
    id_perfil?: number;
    id_sucursal?: number | null;
    activo?: boolean;
  }
): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuario')
    .update(cambios)
    .eq('id_usuario', idUsuario)
    .select('*, perfil:perfil(nombre, descripcion), sucursal:sucursal(nombre)')
    .single();

  if (error) throw new Error(error.message);
  return data as Usuario;
}
