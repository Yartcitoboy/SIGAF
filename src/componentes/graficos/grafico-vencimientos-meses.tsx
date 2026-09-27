'use client';

import React, { useState } from 'react';
import { CalendarClock, TrendingUp } from 'lucide-react';

export const GraficoVencimientosMeses: React.FC = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);

  const meses = [
    { mes: 'Caducados', cantidadLotes: 2, unidades: 55, color: 'bg-red-900', nivel: 'Crítico inmediato' },
    { mes: 'Oct 2026', cantidadLotes: 1, unidades: 50, color: 'bg-red-500', nivel: 'Riesgo alto (<30d)' },
    { mes: 'Nov 2026', cantidadLotes: 1, unidades: 75, color: 'bg-amber-400', nivel: 'Preventivo (60d)' },
    { mes: 'Dic 2026', cantidadLotes: 2, unidades: 210, color: 'bg-amber-400', nivel: 'Preventivo (90d)' },
    { mes: 'Ene - Mar 27', cantidadLotes: 0, unidades: 0, color: 'bg-emerald-400', nivel: 'Sin vencimientos' },
    { mes: 'Abr+ 2027', cantidadLotes: 3, unidades: 740, color: 'bg-emerald-500', nivel: 'Stock vigente a largo plazo' },
  ];

  const maxUnidades = 750;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Proyección Temporal de Vencimientos
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-teal-500" />
            Unidades por mes
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Pasa el cursor por las barras para ver el detalle de unidades en riesgo
        </p>
      </div>

      {/* Gráfico de Barras Verticales Interactivo */}
      <div className="h-44 flex items-end justify-between gap-3 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        {meses.map((item, idx) => {
          const alturaPct = item.unidades === 0 ? 4 : Math.max(12, Math.round((item.unidades / maxUnidades) * 100));
          const isHovered = mesSeleccionado === idx;

          return (
            <div
              key={item.mes}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setMesSeleccionado(idx)}
              onMouseLeave={() => setMesSeleccionado(null)}
            >
              {/* Valor emergente en hover */}
              <div
                className={`text-[11px] font-bold transition-all duration-200 mb-1.5 ${
                  isHovered ? 'opacity-100 transform -translate-y-1 text-slate-900 dark:text-white' : 'opacity-0'
                }`}
              >
                {item.unidades} un.
              </div>

              {/* Barra */}
              <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-t-md h-full flex items-end p-0.5">
                <div
                  style={{ height: `${alturaPct}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${item.color} ${
                    isHovered ? 'brightness-110 shadow-md scale-x-105' : 'opacity-85'
                  }`}
                />
              </div>

              {/* Etiqueta del mes */}
              <span className={`text-[10px] mt-2 font-medium text-center truncate w-full ${
                isHovered ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
              }`}>
                {item.mes}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detalle del mes seleccionado */}
      <div className="mt-4 pt-3 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
        {mesSeleccionado !== null ? (
          <>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {meses[mesSeleccionado].mes}: {meses[mesSeleccionado].cantidadLotes} lotes ({meses[mesSeleccionado].unidades} unidades)
            </span>
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              {meses[mesSeleccionado].nivel}
            </span>
          </>
        ) : (
          <span className="text-slate-400 text-center w-full text-[11px]">
            💡 Selecciona un mes para ver la recomendación operativa FEFO
          </span>
        )}
      </div>
    </div>
  );
};
