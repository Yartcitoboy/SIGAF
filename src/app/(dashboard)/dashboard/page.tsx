'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { SemaforoBadge } from '@/componentes/ui/semaforo-badge';
import { GraficoDistribucionSemaforo } from '@/componentes/graficos/grafico-distribucion-semaforo';
import { GraficoVencimientosMeses } from '@/componentes/graficos/grafico-vencimientos-meses';
import { 
  mockDashboardKpis, 
  mockInventario, 
  mockNotificaciones 
} from '@/datos-mock/inventario-data';
import { 
  Boxes, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Truck,
  Trash2,
  BellRing
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardAdminPage() {
  const [filtroUrgencia, setFiltroUrgencia] = useState<'TODOS' | 'VENCIDOS' | 'AMARILLO'>('TODOS');

  // Filtramos los lotes que requieren acción (Rojos o Amarillos)
  const lotesConAccion = mockInventario.filter((inv) => {
    if (filtroUrgencia === 'VENCIDOS') return inv.estado_semaforo === 'VENCIDO' || inv.estado_semaforo === 'ROJO';
    if (filtroUrgencia === 'AMARILLO') return inv.estado_semaforo === 'AMARILLO';
    return inv.estado_semaforo !== 'VERDE';
  });

  return (
    <div className="space-y-6">
      <Header 
        titulo="Panel de Control General" 
        subtitulo="Monitoreo de caducidad, inventario en bodega y cumplimiento del algoritmo FEFO" 
      />

      {/* 1. Tarjetas de KPIs Operativos y Sanitarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Unidades */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stock Total Físico</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {mockDashboardKpis.totalUnidadesStock.toLocaleString('es-CL')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Distribuido en {mockDashboardKpis.totalLotesRegistrados} lotes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Lotes Vencidos (Alerta Máxima) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-950/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Caducados (Bloqueados)
            </p>
            <p className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">
              {mockDashboardKpis.lotesVencidos} <span className="text-xs font-normal text-slate-500">lotes</span>
            </p>
            <p className="text-[11px] text-red-600/80 font-medium mt-1">
              Venta prohibida · Retiro urgente
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Próximos a Vencer (Amarillos / Preventivos) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Próximos a Vencer (30-90d)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {mockDashboardKpis.lotesAmarillos + mockDashboardKpis.lotesCriticos} <span className="text-xs font-normal text-slate-500">lotes</span>
            </p>
            <p className="text-[11px] text-amber-700/80 mt-1">
              Prioridad FEFO de dispensación
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Efectividad Sanitaria FEFO */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Cumplimiento FEFO</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {mockDashboardKpis.porcentajeCumplimientoFEFO}%
            </p>
            <p className="text-[11px] text-emerald-600/80 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> 0% caducados entregados
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Sección de Gráficos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoDistribucionSemaforo />
        <GraficoVencimientosMeses />
      </div>

      {/* 3. Tabla Operativa: Lotes que Requieren Toma de Decisión Administrativa */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Lotes con Decisión Administrativa Requerida
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Medicamentos en riesgo de vencimiento o caducados que requieren traslado o baja a merma
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFiltroUrgencia('TODOS')}
              className={`px-2.5 py-1 rounded-md transition ${filtroUrgencia === 'TODOS' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Todos en Riesgo ({mockInventario.filter(i => i.estado_semaforo !== 'VERDE').length})
            </button>
            <button
              onClick={() => setFiltroUrgencia('VENCIDOS')}
              className={`px-2.5 py-1 rounded-md transition ${filtroUrgencia === 'VENCIDOS' ? 'bg-red-500 text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Solo Caducados
            </button>
            <button
              onClick={() => setFiltroUrgencia('AMARILLO')}
              className={`px-2.5 py-1 rounded-md transition ${filtroUrgencia === 'AMARILLO' ? 'bg-amber-400 text-amber-950 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Preventivos (30-90d)
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Medicamento / Principio Activo</th>
                <th className="py-3 px-4">N° Lote</th>
                <th className="py-3 px-4">Ubicación Física</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4">Fecha Vencimiento</th>
                <th className="py-3 px-4">Estado Semáforo</th>
                <th className="py-3 px-4 text-right">Acción Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lotesConAccion.map((item) => (
                <tr key={item.id_inventario} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {item.lote?.producto?.nombre}
                    <span className="block text-[11px] font-normal text-slate-400 font-mono">
                      {item.lote?.producto?.codigo_barras}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {item.lote?.numero_lote}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.bodega?.nombre}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {item.stock_actual} un.
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.lote?.fecha_vencimiento}
                  </td>
                  <td className="py-3 px-4">
                    <SemaforoBadge
                      estado={item.estado_semaforo}
                      diasRestantes={item.lote?.dias_restantes}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.estado_semaforo === 'VENCIDO' || item.estado_semaforo === 'ROJO' ? (
                      <Link
                        href={`/movimientos?accion=merma&lote=${item.lote?.numero_lote}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shadow-xs transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Declarar Merma
                      </Link>
                    ) : (
                      <Link
                        href={`/movimientos?accion=traslado&lote=${item.lote?.numero_lote}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] shadow-xs transition"
                      >
                        <Truck className="w-3 h-3" />
                        Mover a Sucursal
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-right">
          <Link
            href="/inventario"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            Ver inventario completo por bodega <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Notificaciones Automatizadas Recientes (Resumen) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Últimas Alertas Despachadas (Proceso Diario 00:00)
            </h3>
          </div>
          <Link href="/alertas" className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
            Bandeja completa
          </Link>
        </div>

        <div className="space-y-2">
          {mockNotificaciones.slice(0, 3).map((notif) => (
            <div
              key={notif.id_notificacion}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between text-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className={`w-2 h-2 mt-1.5 rounded-full ${notif.estado === 'PENDIENTE' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{notif.mensaje}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Enviado vía Web & Correo Resend · {notif.fecha_envio}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${notif.estado === 'PENDIENTE' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                {notif.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
