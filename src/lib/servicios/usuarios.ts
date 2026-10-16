// ============================================================
//  Servicio de Usuarios y Control de Acceso (RBAC) - Supabase
//  Capa de acceso a datos para gestión de personal.
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Usuario, Perfil, Sucursal } from '@/tipos/database';

const supabase = createClient();

export interface NuevoUsuarioPayload {
  nombre: string;
  email: string;
  password?: string;
  id_perfil: number;
  id_sucursal: number | null;
  activo: boolean;
}

/** Obtiene la lista completa de colaboradores con su perfil y sucursal. */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      *,
      perfil:id_perfil (*),
      sucursal:id_sucursal (*)
    `)
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Usuario[];
}

/** Obtiene los roles/perfiles disponibles en el sistema (ADMIN, BODEGUERO, AUXILIAR). */
export async function obtenerPerfiles(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('perfil')
    .select('*')
    .order('id_perfil', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Perfil[];
}

/** Obtiene las sucursales de farmacia para asignación laboral. */
export async function obtenerSucursales(): Promise<Sucursal[]> {
  const { data, error } = await supabase
    .from('sucursal')
    .select('*')
    .order('id_sucursal', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Sucursal[];
}

/** Inserta un nuevo usuario en la base de datos. */
export async function crearUsuario(payload: NuevoUsuarioPayload): Promise<Usuario> {
  // Simulamos un hash seguro para entorno académico si no viene encriptado
  const passwordHash = payload.password
    ? `$2a$10$hash_${btoa(payload.password).slice(0, 20)}`
    : '$2a$10$defaultDemoHash2026';

  const { data, error } = await supabase
    .from('usuario')
    .insert([
      {
        nombre: payload.nombre.trim(),
        email: payload.email.trim().toLowerCase(),
        password_hash: passwordHash,
        id_perfil: payload.id_perfil,
        id_sucursal: payload.id_sucursal || null,
        activo: payload.activo ?? true,
      },
    ])
    .select(`
      *,
      perfil:id_perfil (*),
      sucursal:id_sucursal (*)
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`El correo electrónico "${payload.email}" ya está registrado.`);
    }
    throw new Error(error.message);
  }

  return data as Usuario;
}
