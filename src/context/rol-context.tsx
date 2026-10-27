"use client";
import { createContext, useContext } from "react";
import type { RolPerfil } from "@/tipos/database";
import { PERMISOS_MODULOS, tieneAcceso } from "@/lib/permisos";
import type { ContextoSistema } from "@/lib/datos/contexto";
export type RolUsuario = RolPerfil;
export interface PerfilActivo {
  sistema: ContextoSistema;
  id_usuario: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  cargo: string;
  iniciales: string;
  sucursal: string;
  id_sucursal: number | null;
}
const RolContext = createContext<PerfilActivo | null>(null);
export function RolProvider({
  children,
  perfil,
}: {
  children: React.ReactNode;
  perfil: PerfilActivo;
}) {
  return <RolContext.Provider value={perfil}>{children}</RolContext.Provider>;
}
export function useRol() {
  const perfilActual = useContext(RolContext);
  if (!perfilActual) throw new Error("Se requiere una sesión autenticada.");
  return {
    rolActual: perfilActual.rol,
    perfilActual,
    modulosPermitidos: PERMISOS_MODULOS[perfilActual.rol],
    tieneAccesoAModulo: (ruta: string) => tieneAcceso(perfilActual.rol, ruta),
  };
}
