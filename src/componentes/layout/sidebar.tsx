'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Building2
} from 'lucide-react';
import { mockDashboardKpis } from '@/datos-mock/inventario-data';

interface NavItem {
  nombre: string;
  href: string;
  icono: React.ElementType;
  badge?: number;
  badgeColor?: string;
  descripcion: string;
}

const modulosNavegacion: NavItem[] = [
  {
    nombre: 'Dashboard',
    href: '/dashboard',
    icono: LayoutDashboard,
    descripcion: 'Resumen de stock y alertas',
  },
  {
    nombre: 'Inventario',
    href: '/inventario',
    icono: Boxes,
    descripcion: 'Stock consolidado por bodega',
  },
  {
    nombre: 'Productos',
    href: '/productos',
    icono: Pill,
    descripcion: 'Catálogo de medicamentos',
  },
  {
    nombre: 'Lotes',
    href: '/lotes',
    icono: QrCode,
    badge: mockDashboardKpis.lotesVencidos + mockDashboardKpis.lotesCriticos,
    badgeColor: 'bg-red-500 text-white',
    descripcion: 'Fechas de caducidad y FEFO',
  },
  {
    nombre: 'Movimientos',
    href: '/movimientos',
    icono: ArrowLeftRight,
    descripcion: 'Kardex, traslados y mermas',
  },
  {
    nombre: 'Alertas',
    href: '/alertas',
    icono: Bell,
    badge: mockDashboardKpis.alertasActivasSinLeer,
    badgeColor: 'bg-amber-500 text-white',
    descripcion: 'Notificaciones automáticas',
  },
  {
    nombre: 'Reportes',
    href: '/reportes',
    icono: FileSpreadsheet,
    descripcion: 'Exportar PDF/XLS e importar',
  },
  {
    nombre: 'Usuarios',
    href: '/usuarios',
    icono: Users,
    descripcion: 'Personal y asignación de roles',
  },
  {
    nombre: 'Configuración',
    href: '/configuracion',
    icono: Settings,
    descripcion: 'Datos de farmacia y sucursales',
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 sticky top-0">
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

      {/* Lista de Navegación de los 9 Módulos */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos de Gestión
        </p>
        {modulosNavegacion.map((item) => {
          const Icon = item.icono;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.nombre}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer del Sidebar: Perfil del Usuario Administrador */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-teal-400">
            CC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Carlos Carrasco</p>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>ADMINISTRADOR</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
