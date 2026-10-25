'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerMovimientos,
  obtenerSucursales,
  obtenerInventarioDisponible,
  registrarMovimiento,
} from '@/lib/servicios/movimientos';
import type { MovimientoInventario, Sucursal } from '@/tipos/database';
import { Truck, Trash2, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const USUARIO_DEMO = '00000000-0000-0000-0000-000000000001';

interface ItemInventario {
  id_inventario: number;
  stock_actual: number;
  lote?: { numero_lote?: string; producto?: { nombre?: string } };
}

export default function MovimientosPage() {
  const [modalAbierto, setModalAbierto] = useState<'TRASLADO' | 'MERMA' | null>(null);

  // Datos desde Supabase
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [inventarioDisp, setInventarioDisp] = useState<ItemInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario del modal
  const [idInventarioSel, setIdInventarioSel] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('VENCIMIENTO');
  const [guardando, setGuardando] = useState(false);

  const recargarMovimientos = async () => {
    const [movs, inv] = await Promise.all([
      obtenerMovimientos(),
      obtenerInventarioDisponible(),
    ]);
    setMovimientos(movs);
    setInventarioDisp(inv as ItemInventario[]);
  };

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [movs, sucs, inv] = await Promise.all([
          obtenerMovimientos(),
          obtenerSucursales(),
          obtenerInventarioDisponible(),
        ]);
        setMovimientos(movs);
        setSucursales(sucs);
        setInventarioDisp(inv as ItemInventario[]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const abrirModal = (tipo: 'TRASLADO' | 'MERMA') => {
    setModalAbierto(tipo);
    setIdInventarioSel(inventarioDisp[0]?.id_inventario ?? '');
    setCantidad(1);
    setMotivo('VENCIMIENTO');
  };

  const confirmarMovimiento = async () => {
    if (idInventarioSel === '') return;
    const item = inventarioDisp.find((i) => i.id_inventario === idInventarioSel);
    if (!item) return;
    setGuardando(true);
    try {
      await registrarMovimiento({
        id_inventario: Number(idInventarioSel),
        tipo: modalAbierto as 'TRASLADO' | 'MERMA',
        cantidad,
        stockActual: item.stock_actual,
        id_usuario: USUARIO_DEMO,
        motivo: modalAbierto === 'MERMA' ? motivo : undefined,
      });
      await recargarMovimientos();
      setModalAbierto(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <TransicionPagina>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Header
          titulo="Movimientos de Inventario y Kardex"
          subtitulo="Registro de entradas, salidas, traslados entre sucursales y bajas por merma"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => abrirModal('TRASLADO')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
          >
            <Truck className="w-4 h-4" />
            Solicitar Traslado
          </button>
          <button
            onClick={() => abrirModal('MERMA')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
          >
            <Trash2 className="w-4 h-4" />
            Declarar Merma / Baja
          </button>
        </div>
      </div>

      {/* Tarjetas informativas de toma de decisión con hover suave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-950 bg-teal-50/50 dark:bg-teal-950/20 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
          <h4 className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5 mb-1">
            <Truck className="w-4 h-4 text-teal-600" />
            Estrategia de Traslado (Lotes en Amarillo)
          </h4>
          <p className="text-teal-800/80 dark:text-teal-400">
            Si un medicamento tiene baja rotación en esta farmacia y le quedan entre 30 y 90 días, trasládalo a una sucursal con mayor flujo para evitar que expire.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
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
              {cargando && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Cargando movimientos desde la base de datos...
                  </td>
                </tr>
              )}
              {error && !cargando && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-red-500 text-xs">
                    Error al cargar datos: {error}
                  </td>
                </tr>
              )}
              {!cargando && !error && movimientos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
              {movimientos.map((mov) => {
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
                  <tr key={mov.id_movimiento} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
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
                      {mov.motivo ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {mov.usuario?.nombre ?? 'Sin asignar'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal con animación suave de apertura y cierre rápido */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
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
                  <select
                    value={idInventarioSel}
                    onChange={(e) => setIdInventarioSel(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
                  >
                    {inventarioDisp.map((i) => (
                      <option key={i.id_inventario} value={i.id_inventario}>
                        {i.lote?.producto?.nombre} ({i.lote?.numero_lote}) - Stock: {i.stock_actual}
                      </option>
                    ))}
                  </select>
                </div>

                {modalAbierto === 'TRASLADO' ? (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Sucursal de Destino</label>
                    <select className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500">
                      {sucursales.map(s => (
                        <option key={s.id_sucursal}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Motivo de la Baja</label>
                    <select
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="VENCIMIENTO">Fecha de caducidad vencida (ISP)</option>
                      <option value="DETERIORO">Deterioro físico o rotura de envase</option>
                      <option value="DEVOLUCION">Devolución rechazada por proveedor</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Cantidad de unidades</label>
                  <input
                    type="number"
                    min={1}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setModalAbierto(null)}
                  disabled={guardando}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-medium transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarMovimiento}
                  disabled={guardando || idInventarioSel === ''}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform disabled:opacity-60 ${
                    modalAbierto === 'TRASLADO' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {guardando ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransicionPagina>
  );
}
