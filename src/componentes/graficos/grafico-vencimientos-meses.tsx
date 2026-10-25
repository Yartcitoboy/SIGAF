'use client';

import React, { useState } from 'react';
import { CalendarClock, TrendingUp } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface ItemInv {
  stock_actual: number;
  estado_semaforo?: string | null;
  lote?: { fecha_vencimiento?: string } | null;
}

interface Props {
  inventario?: ItemInv[];
}

const NOMBRE_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const GraficoVencimientosMeses: React.FC<Props> = ({ inventario = [] }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Agrupar el inventario real por mes de vencimiento
  const agrupado = new Map<string, { cantidadLotes: number; unidades: number; vencido: boolean; orden: number }>();

  inventario.forEach((item) => {
    if (!item.lote?.fecha_vencimiento) return;
    const f = new Date(item.lote.fecha_vencimiento);
    const esVencido = item.estado_semaforo === 'VENCIDO';
    const clave = esVencido ? 'Caducados' : `${NOMBRE_MES[f.getMonth()]} ${f.getFullYear()}`;
    const orden = esVencido ? 0 : f.getFullYear() * 12 + f.getMonth() + 1;
    const actual = agrupado.get(clave) ?? { cantidadLotes: 0, unidades: 0, vencido: esVencido, orden };
    actual.cantidadLotes += 1;
    actual.unidades += item.stock_actual ?? 0;
    agrupado.set(clave, actual);
  });

  const meses = Array.from(agrupado.entries())
    .map(([mes, v]) => {
      let color = 'bg-emerald-500';
      let nivel = 'Stock vigente';
      if (v.vencido) { color = 'bg-red-900'; nivel = 'Crítico inmediato'; }
      else if (v.orden <= 1) { color = 'bg-red-500'; nivel = 'Riesgo alto'; }
      else if (v.orden <= 3) { color = 'bg-amber-400'; nivel = 'Preventivo'; }
      return { mes, cantidadLotes: v.cantidadLotes, unidades: v.unidades, color, nivel, orden: v.orden };
    })
    .sort((a, b) => a.orden - b.orden)
    .slice(0, 6);

  const maxUnidades = Math.max(...meses.map((m) => m.unidades), 1);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
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

      {/* Gráfico de Barras Verticales Progresivo con Stagger */}
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
              <motion.div
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? -4 : 2,
                }}
                transition={{ duration: 0.15 }}
                className="text-[11px] font-bold mb-1.5 text-slate-900 dark:text-white pointer-events-none"
              >
                {item.unidades} un.
              </motion.div>

              {/* Contenedor de la Barra */}
              <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-t-md h-full flex items-end p-0.5">
                <motion.div
                  initial={shouldReduceMotion ? { height: `${alturaPct}%` } : { height: 0 }}
                  animate={{ height: `${alturaPct}%` }}
                  transition={{
                    duration: 0.65,
                    delay: shouldReduceMotion ? 0 : idx * 0.07,
                    ease: 'easeOut',
                  }}
                  className={`w-full rounded-t-sm transition-all duration-200 ${item.color} ${
                    isHovered ? 'brightness-110 shadow-md scale-x-105' : 'opacity-85'
                  }`}
                />
              </div>

              {/* Etiqueta del mes */}
              <span className={`text-[10px] mt-2 font-medium text-center truncate w-full transition-colors ${
                isHovered ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
              }`}>
                {item.mes}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detalle del mes seleccionado con transición suave */}
      <motion.div
        layout
        className="mt-4 pt-3 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors"
      >
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
            💡 Selecciona o pasa el cursor por un mes para ver la recomendación operativa FEFO
          </span>
        )}
      </motion.div>
    </div>
  );
};
