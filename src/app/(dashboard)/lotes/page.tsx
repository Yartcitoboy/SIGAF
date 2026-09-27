'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { SemaforoBadge } from '@/componentes/ui/semaforo-badge';
import { mockLotes, mockInventario } from '@/datos-mock/inventario-data';
import { Search, Plus, QrCode, Filter, Calendar } from 'lucide-react';

export default function LotesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [semaforoFiltro, setSemaforoFiltro] = useState('TODOS');

  const lotesConStock = mockLotes.map((lote) => {
    const inv = mockInventario.find((i) => i.id_lote === lote.id_lote);
    return {
      ...lote,
      stock: inv?.stock_actual || 0,
      bodega: inv?.bodega?.nombre || 'Sin asignar',
    };
  });

  const filtrados = lotesConStock.filter((l) => {
    const coincideTexto =
      l.numero_lote.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.producto?.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideSemaforo = semaforoFiltro === 'TODOS' || l.estado_semaforo === semaforoFiltro;

    return coincideTexto && coincideSemaforo;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header
          titulo="Control y Trazabilidad de Lotes (FEFO)"
          subtitulo="Registro de fechas de vencimiento, lote de fabricante y control de caducidad"
        />
        <button
          onClick={() => alert('Modal: Registrar Nuevo Lote (Recepción de Mercadería)')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Registrar Entrada de Lote
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° lote o nombre de medicamento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Estado Semáforo:</span>
          <select
            value={semaforoFiltro}
            onChange={(e) => setSemaforoFiltro(e.target.value)}
            className="py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500"
          >
            <option value="TODOS">Todos los lotes</option>
            <option value="VERDE">🟢 Vigentes (&gt;90 días)</option>
            <option value="AMARILLO">🟡 Preventivos (30-90 días)</option>
            <option value="ROJO">🔴 Críticos (&lt;30 días)</option>
            <option value="VENCIDO">❌ Caducados (Bloqueados)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Lotes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Lote / Código</th>
                <th className="py-3 px-4">Medicamento</th>
                <th className="py-3 px-4">Fecha Ingreso</th>
                <th className="py-3 px-4">Fecha Vencimiento</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4">Semáforo de Riesgo</th>
                <th className="py-3 px-4 text-right">Etiqueta QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtrados.map((lote) => (
                <tr key={lote.id_lote} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {lote.numero_lote}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {lote.producto?.nombre}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      Ubicación: {lote.bodega}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {lote.fecha_ingreso}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {lote.fecha_vencimiento}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {lote.stock} un.
                  </td>
                  <td className="py-3 px-4">
                    <SemaforoBadge
                      estado={lote.estado_semaforo}
                      diasRestantes={lote.dias_restantes}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Imprimir etiqueta QR para lote: ${lote.numero_lote}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      title="Imprimir código QR para la estantería"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Imprimir QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
