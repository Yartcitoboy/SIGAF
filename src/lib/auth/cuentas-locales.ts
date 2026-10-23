import type { RolPerfil } from "@/tipos/database";

// Credenciales ficticias y temporales. Nunca son cuentas de Supabase.
export const CUENTAS_LOCALES: readonly {
  rol: RolPerfil;
  nombre: string;
  etiqueta: string;
  descripcion: string;
  email: string;
  password: string;
  id_usuario: string;
  id_perfil: number;
}[] = [
  {
    rol: "ADMIN",
    nombre: "Administrador local",
    etiqueta: "Admin",
    descripcion: "Gestión completa",
    email: "admin@sigaf.local",
    password: "SigafLocal2026!",
    id_usuario: "10000000-0000-4000-8000-000000000001",
    id_perfil: 1,
  },
  {
    rol: "BODEGUERO",
    nombre: "Bodeguero local",
    etiqueta: "Bodega",
    descripcion: "Operación física",
    email: "bodega@sigaf.local",
    password: "SigafLocal2026!",
    id_usuario: "10000000-0000-4000-8000-000000000002",
    id_perfil: 2,
  },
  {
    rol: "AUXILIAR",
    nombre: "Auxiliar local",
    etiqueta: "Auxiliar",
    descripcion: "Dispensación",
    email: "auxiliar@sigaf.local",
    password: "SigafLocal2026!",
    id_usuario: "10000000-0000-4000-8000-000000000003",
    id_perfil: 3,
  },
];
