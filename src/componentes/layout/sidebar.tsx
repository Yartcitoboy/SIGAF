'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Boxes, 
  Pill, 
  QrCode, 
  ArrowLeftRight, 
  Bell, 
  FileSpreadsheet, 
  Users, 
  Settings,
  ShieldCheck,
  Building2,
  ShoppingCart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { mockDashboardKpis } from '@/datos-mock/inventario-data';
import { logout, obtenerUsuarioSesion } from '@/lib/servicios/auth';
import type { Usuario } from '@/tipos/database';

interface NavItem {
  nombre: string;
  href: string;
  icono: React.ElementType;
  badge?: number;
  badgeColor?: string;
  descripcion: string;
  roles: string[]; // perfiles que pueden ver este módulo
}

// Roles: ADMIN ve todo · BODEGUERO gestión de stock · AUXILIAR solo consulta
const modulosNavegacion: NavItem[] = [
  {
    nombre: 'Dashboard',
    href: '/dashboard',
    icono: LayoutDashboard,
    descripcion: 'Resumen de stock y alertas',
    roles: ['ADMIN', 'BODEGUERO', 'AUXILIAR'],
  },
  {
    nombre: 'Inventario',
    href: '/inventario',
    icono: Boxes,
    descripcion: 'Stock consolidado por bodega',
    roles: ['ADMIN', 'BODEGUERO', 'AUXILIAR'],
  },
  {
    nombre: 'Productos',
    href: '/productos',
    icono: Pill,
    descripcion: 'Catálogo de medicamentos',
    roles: ['ADMIN', 'BODEGUERO'],
  },
  {
    nombre: 'Lotes',
    href: '/lotes',
    icono: QrCode,
    badge: mockDashboardKpis.lotesVencidos + mockDashboardKpis.lotesCriticos,
    badgeColor: 'bg-red-500 text-white',
    descripcion: 'Fechas de caducidad y FEFO',
    roles: ['ADMIN', 'BODEGUERO'],
  },
  {
    nombre: 'Dispensación',
    href: '/dispensacion',
    icono: ShoppingCart,
    descripcion: 'Venta guiada con motor FEFO',
    roles: ['ADMIN', 'BODEGUERO', 'AUXILIAR'],
  },
  {
    nombre: 'Movimientos',
    href: '/movimientos',
    icono: ArrowLeftRight,
    descripcion: 'Kardex, traslados y mermas',
    roles: ['ADMIN', 'BODEGUERO'],
  },
  {
    nombre: 'Alertas',
    href: '/alertas',
    icono: Bell,
    badge: mockDashboardKpis.alertasActivasSinLeer,
    badgeColor: 'bg-amber-500 text-white',
    descripcion: 'Notificaciones automáticas',
    roles: ['ADMIN', 'BODEGUERO', 'AUXILIAR'],
  },
  {
    nombre: 'Reportes',
    href: '/reportes',
    icono: FileSpreadsheet,
    descripcion: 'Exportar PDF/XLS e importar',
    roles: ['ADMIN', 'BODEGUERO'],
  },
  {
    nombre: 'Usuarios',
    href: '/usuarios',
    icono: Users,
    descripcion: 'Personal y asignación de roles',
    roles: ['ADMIN'],
  },
  {
    nombre: 'Configuración',
    href: '/configuracion',
    icono: Settings,
    descripcion: 'Datos de farmacia y sucursales',
    roles: ['ADMIN'],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    setUsuario(obtenerUsuarioSesion());
  }, []);

  const manejarLogout = () => {
    logout();
    router.push('/login');
  };

  // Iniciales del nombre para el avatar
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase()
    : 'US';

  // Rol del usuario actual (si no hay sesión aún, se muestran todos para no ocultar durante la carga)
  const rolActual = usuario?.perfil?.nombre;
  const modulosVisibles = rolActual
    ? modulosNavegacion.filter((m) => m.roles.includes(rolActual))
    : modulosNavegacion;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 sticky top-0 z-30">
      {/* Header del Sidebar: Logo y Nombre */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
            <Pill className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              SIGAF
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FEFO
              </span>
            </h1>
            <p className="text-xs text-slate-400 truncate">Farmacia FarmaVence</p>
          </div>
        </div>

        {/* Indicador de Sucursal Activa */}
        <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">Sucursal Central</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Lista de Navegación de los 9 Módulos con Indicador Suave */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos de Gestión
        </p>
        {modulosVisibles.map((item) => {
          const Icon = item.icono;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <motion.div
              key={item.href}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="relative"
            >
              <Link
                href={item.href}
                className={`relative z-10 flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.nombre}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Indicador suave que se desliza entre opciones activas */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                  }}
                  className="absolute inset-0 bg-teal-600 rounded-lg shadow-md shadow-teal-600/30 z-0"
                />
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Footer del Sidebar: Perfil del Usuario + Cerrar Sesión */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-teal-400">
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {usuario?.nombre ?? 'Invitado'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>{usuario?.perfil?.nombre ?? 'SIN SESIÓN'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={manejarLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white text-xs font-semibold transition-colors duration-150 border border-slate-700 hover:border-red-500"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
