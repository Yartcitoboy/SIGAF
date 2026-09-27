'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { SemaforoBadge } from '@/componentes/ui/semaforo-badge';
import { mockInventario, mockBodegas } from '@/datos-mock/inventario-data';
import { Search, Filter, Boxes } from 'lucide-react';

export default function InventarioPage() {
  const [busqueda, setBusqueda] = useState('');
  const [bodegaFiltro, setBodegaFiltro] = useState<string>('TODAS');
  const [semaforoFiltro, setSemaforoFiltro] = useState<string>('TODOS');

  const inventarioFiltrado = mockInventario.filter((item) => {
    const coincideTexto = 
      item.lote?.producto?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.lote?.numero_lote.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.lote?.producto?.codigo_barras?.includes(busqueda);

    const coincideBodega = bodegaFiltro === 'TODAS' || item.bodega?.id_bodega.toString() === bodegaFiltro;
    const coincideSemaforo = semaforoFiltro === 'TODOS' || item.estado_semaforo === semaforoFiltro;

    return coincideTexto && coincideBodega && coincideSemaforo;
  });

  return (
    <div className="space-y-6">
      <Header
        titulo="Inventario por Bodega y Semáforo FEFO"
        subtitulo="Control de existencias físicas cruzadas por lote y ubicación de almacenamiento"
      />

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por medicamento, código de barras o N° lote..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Bodega:</span>
            <select
              value={bodegaFiltro}
              onChange={(e) => setBodegaFiltro(e.target.value)}
              className="py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500"
            >
              <option value="TODAS">Todas las ubicaciones</option>
              {mockBodegas.map((b) => (
                <option key={b.id_bodega} value={b.id_bodega.toString()}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Semáforo:</span>
            <select
              value={semaforoFiltro}
              onChange={(e) => setSemaforoFiltro(e.target.value)}
              className="py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="VERDE">🟢 Vigentes (&gt;90d)</option>
              <option value="AMARILLO">🟡 Preventivos (30-90d)</option>
              <option value="ROJO">🔴 Críticos (&lt;30d)</option>
              <option value="VENCIDO">❌ Caducados (Bloqueados)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Medicamento</th>
                <th className="py-3 px-4">N° Lote</th>
                <th className="py-3 px-4">Ubicación / Bodega</th>
                <th className="py-3 px-4 text-center">Stock Disponible</th>
                <th className="py-3 px-4">Caducidad</th>
                <th className="py-3 px-4">Estado FEFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {inventarioFiltrado.length > 0 ? (
                inventarioFiltrado.map((item) => (
                  <tr key={item.id_inventario} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {item.lote?.producto?.nombre}
                      <span className="block text-[11px] font-mono text-slate-400 font-normal">
                        {item.lote?.producto?.codigo_barras}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.lote?.numero_lote}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.bodega?.nombre}
                      <span className="block text-[10px] text-slate-400">{item.bodega?.ubicacion}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No se encontraron productos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
