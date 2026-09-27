'use client';

import React, { useState } from 'react';
import { mockDashboardKpis } from '@/datos-mock/inventario-data';
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

export const GraficoDistribucionSemaforo: React.FC = () => {
  const [segmentoActivo, setSegmentoActivo] = useState<string | null>(null);

  const total = mockDashboardKpis.totalLotesRegistrados;
  const pVerde = Math.round((mockDashboardKpis.lotesVerdes / total) * 100);
  const pAmarillo = Math.round((mockDashboardKpis.lotesAmarillos / total) * 100);
  const pRojo = Math.round((mockDashboardKpis.lotesCriticos / total) * 100);
  const pVencido = Math.round((mockDashboardKpis.lotesVencidos / total) * 100);

  const datos = [
    {
      id: 'verde',
      nombre: 'Vigentes (>90d)',
      cantidad: mockDashboardKpis.lotesVerdes,
      porcentaje: pVerde,
      color: 'bg-emerald-500',
      colorTexto: 'text-emerald-700 dark:text-emerald-400',
      colorHover: 'hover:bg-emerald-600',
      borde: 'border-emerald-500',
      icono: CheckCircle2,
      descripcion: 'Lotes seguros para dispensación regular.',
    },
    {
      id: 'amarillo',
      nombre: 'Preventivos (30-90d)',
      cantidad: mockDashboardKpis.lotesAmarillos,
      porcentaje: pAmarillo,
      color: 'bg-amber-400',
      colorTexto: 'text-amber-700 dark:text-amber-400',
      colorHover: 'hover:bg-amber-500',
      borde: 'border-amber-400',
      icono: AlertTriangle,
      descripcion: 'Priorizar venta inmediata con algoritmo FEFO.',
    },
    {
      id: 'rojo',
      nombre: 'Críticos (<30d)',
      cantidad: mockDashboardKpis.lotesCriticos,
      porcentaje: pRojo,
      color: 'bg-red-500',
      colorTexto: 'text-red-700 dark:text-red-400',
      colorHover: 'hover:bg-red-600',
      borde: 'border-red-500',
      icono: AlertCircle,
      descripcion: 'Alerta máxima: gestionar devolución o liquidación.',
    },
    {
      id: 'vencido',
      nombre: 'Caducados (0d)',
      cantidad: mockDashboardKpis.lotesVencidos,
      porcentaje: pVencido,
      color: 'bg-red-900',
      colorTexto: 'text-red-900 dark:text-red-400',
      colorHover: 'hover:bg-red-950',
      borde: 'border-red-900',
      icono: XCircle,
      descripcion: 'Dispensación bloqueada: retiro obligatorio a merma.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Distribución del Semáforo de Riesgo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clasificación total de los {total} lotes activos
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          En tiempo real
        </span>
      </div>

      {/* Barra segmentada interactiva */}
      <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5 mb-5 shadow-inner">
        {datos.map((item) => (
          <button
            key={item.id}
            type="button"
            style={{ width: `${item.porcentaje}%` }}
            className={`h-full transition-all duration-300 rounded-sm cursor-pointer ${item.color} ${item.colorHover} ${
              segmentoActivo === item.id ? 'ring-2 ring-slate-900 dark:ring-white scale-y-110 z-10' : 'opacity-90'
            }`}
            onMouseEnter={() => setSegmentoActivo(item.id)}
            onMouseLeave={() => setSegmentoActivo(null)}
            title={`${item.nombre}: ${item.cantidad} lotes (${item.porcentaje}%)`}
          />
        ))}
      </div>

      {/* Tarjetas informativas interactivas de cada color */}
      <div className="grid grid-cols-2 gap-2.5">
        {datos.map((item) => {
          const Icon = item.icono;
          const isSelected = segmentoActivo === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setSegmentoActivo(item.id)}
              onMouseLeave={() => setSegmentoActivo(null)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-xs translate-y-[-1px]'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  {item.nombre}
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.colorTexto}`} />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {item.cantidad} <span className="text-[11px] font-normal text-slate-500">lotes</span>
                </span>
                <span className={`text-xs font-bold ${item.colorTexto}`}>
                  {item.porcentaje}%
                </span>
              </div>
              {isSelected && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 animate-fadeIn">
                  {item.descripcion}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
