'use client';

import React from 'react';
import { Bell, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { mockDashboardKpis } from '@/datos-mock/inventario-data';

interface HeaderProps {
  titulo: string;
  subtitulo?: string;
}

export const Header: React.FC<HeaderProps> = ({ titulo, subtitulo }) => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitulo}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Banner de Monitoreo Sanitario */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Monitoreo FEFO Activo</span>
        </div>

        {/* Botón de Alertas Rápido */}
        <Link
          href="/alertas"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Ver alertas del sistema"
        >
          <Bell className="w-5 h-5" />
          {mockDashboardKpis.alertasActivasSinLeer > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          )}
          {mockDashboardKpis.alertasActivasSinLeer > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* Alerta de caducidad urgente si hay lotes vencidos */}
        {mockDashboardKpis.lotesVencidos > 0 && (
          <Link
            href="/lotes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{mockDashboardKpis.lotesVencidos} Lotes Caducados</span>
          </Link>
        )}
      </div>
    </header>
  );
};
