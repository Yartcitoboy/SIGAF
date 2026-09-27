'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { mockMovimientos, mockSucursales } from '@/datos-mock/inventario-data';
import { ArrowLeftRight, Truck, Trash2, Plus, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react';

export default function MovimientosPage() {
  const [modalAbierto, setModalAbierto] = useState<'TRASLADO' | 'MERMA' | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Header
          titulo="Movimientos de Inventario y Kardex"
          subtitulo="Registro de entradas, salidas, traslados entre sucursales y bajas por merma"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalAbierto('TRASLADO')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Truck className="w-4 h-4" />
            Solicitar Traslado
          </button>
          <button
            onClick={() => setModalAbierto('MERMA')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Trash2 className="w-4 h-4" />
            Declarar Merma / Baja
          </button>
        </div>
      </div>

      {/* Tarjetas informativas de toma de decisión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-950 bg-teal-50/50 dark:bg-teal-950/20 text-xs">
          <h4 className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5 mb-1">
            <Truck className="w-4 h-4 text-teal-600" />
            Estrategia de Traslado (Lotes en Amarillo)
          </h4>
          <p className="text-teal-800/80 dark:text-teal-400">
            Si un medicamento tiene baja rotación en esta farmacia y le quedan entre 30 y 90 días, trasládalo a una sucursal con mayor flujo para evitar que expire.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 text-xs">
          <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5 mb-1">
            <Trash2 className="w-4 h-4 text-red-600" />
            Protocolo de Merma Sanitaria (Lotes en Rojo/Caducados)
          </h4>
          <p className="text-red-800/80 dark:text-red-400">
            Todo medicamento caducado debe darse de baja del inventario físico inmediatamente, generando el comprobante formal de destrucción para el ISP.
          </p>
        </div>
      </div>

      {/* Tabla del Kardex / Historial de Movimientos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Historial de Operaciones Registradas
          </h3>
          <span className="text-xs text-slate-400">Trazabilidad inmutable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Tipo Movimiento</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4">Motivo / Observación</th>
                <th className="py-3 px-4">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockMovimientos.map((mov) => {
                const getBadge = () => {
                  switch (mov.tipo_movimiento) {
                    case 'ENTRADA':
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <ArrowDownLeft className="w-3 h-3" /> ENTRADA
                        </span>
                      );
                    case 'SALIDA':
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
                          <ArrowUpRight className="w-3 h-3" /> SALIDA FEFO
                        </span>
                      );
                    case 'MERMA':
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-semibold text-[11px]">
                          <Trash2 className="w-3 h-3" /> MERMA / BAJA
                        </span>
                      );
                    case 'TRASLADO':
                    default:
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-semibold text-[11px]">
                          <Truck className="w-3 h-3" /> TRASLADO
                        </span>
                      );
                  }
                };

                return (
                  <tr key={mov.id_movimiento} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {mov.fecha}
                    </td>
                    <td className="py-3 px-4">
                      {getBadge()}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {mov.cantidad} un.
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {mov.motivo}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Carlos Carrasco (Admin)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal simulado para Traslado o Merma */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {modalAbierto === 'TRASLADO' ? '📦 Solicitar Traslado a Sucursal' : '🗑️ Declarar Baja / Merma Sanitaria'}
            </h3>
            <p className="text-xs text-slate-500">
              {modalAbierto === 'TRASLADO'
                ? 'Selecciona la sucursal de destino para acelerar la rotación del lote antes de su caducidad.'
                : 'Esta acción dará de baja las unidades seleccionadas y generará el acta oficial de merma.'}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Lote a Afectar</label>
                <select className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option>Paracetamol 500mg (L-2023-V99) - Caducado</option>
                  <option>Losartán 50mg (L-2024-LOS77) - 28 días restantes</option>
                  <option>Ibuprofeno 400mg (L-2025-IBU88) - 65 días restantes</option>
                </select>
              </div>

              {modalAbierto === 'TRASLADO' ? (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Sucursal de Destino</label>
                  <select className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {mockSucursales.map(s => (
                      <option key={s.id_sucursal}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Motivo de la Baja</label>
                  <select className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <option>Fecha de caducidad vencida (ISP)</option>
                    <option>Deterioro físico o rotura de envase</option>
                    <option>Devolución rechazada por proveedor</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Cantidad de unidades</label>
                <input type="number" defaultValue={10} className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalAbierto(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Operación registrada exitosamente');
                  setModalAbierto(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${modalAbierto === 'TRASLADO' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
