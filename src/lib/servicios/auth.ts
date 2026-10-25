// ============================================================
//  Servicio de Autenticación - SIGAF
//  Valida el inicio de sesión contra la tabla "usuario".
//
//  NOTA (capstone): esta es una validación de demostración que
//  consulta la tabla usuario por email. La verificación real de
//  contraseña con bcrypt debe hacerse del lado del servidor
//  (Supabase Auth o una Edge Function), nunca en el navegador.
//  Para la demo se acepta una clave común: "sigaf2026".
// ============================================================
import { createClient } from '@/lib/supabase/client';
import type { Usuario } from '@/tipos/database';

const supabase = createClient();

// Clave de demostración (en producción se reemplaza por Supabase Auth)
const CLAVE_DEMO = 'sigaf2026';

export interface ResultadoLogin {
  ok: boolean;
  usuario?: Usuario & { perfil?: { nombre: string } };
  mensaje?: string;
}

/** Inicia sesión validando el email contra la tabla usuario. */
export async function login(email: string, password: string): Promise<ResultadoLogin> {
  // Buscar el usuario por email, trayendo su perfil
  const { data, error } = await supabase
    .from('usuario')
    .select('*, perfil(nombre, descripcion)')
    .eq('email', email.trim().toLowerCase())
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    return { ok: false, mensaje: 'Error al conectar con la base de datos.' };
  }

  if (!data) {
    return { ok: false, mensaje: 'Usuario no encontrado o inactivo.' };
  }

  // Validación de contraseña (demo)
  if (password !== CLAVE_DEMO) {
    return { ok: false, mensaje: 'Contraseña incorrecta.' };
  }

  // Guardar sesión simple en el navegador (demo)
  if (typeof window !== 'undefined') {
    localStorage.setItem('sigaf_usuario', JSON.stringify(data));
  }

  return { ok: true, usuario: data };
}

/** Cierra la sesión. */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sigaf_usuario');
  }
}

/** Obtiene el usuario de la sesión actual (demo). */
export function obtenerUsuarioSesion(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('sigaf_usuario');
  return raw ? (JSON.parse(raw) as Usuario) : null;
}
