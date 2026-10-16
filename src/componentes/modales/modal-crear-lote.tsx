'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Calendar, Warehouse, Hash, PackageCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { crearLoteConInventario, calcularSemaforoLote, type NuevoLotePayload } from '@/lib/servicios/lotes';
import { SemaforoBadge } from '@/componentes/ui/semaforo-badge';
import type { Producto, Bodega } from '@/tipos/database';
import { toast } from 'sonner';

interface ModalCrearLoteProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  productos: Producto[];
  bodegas: Bodega[];
}

export function ModalCrearLote({
  abierto,
  alCerrar,
  alGuardarExitoso,
  productos,
  bodegas,
}: ModalCrearLoteProps) {
  const hoyString = new Date().toISOString().split('T')[0];
  
  // Fecha tentativa por defecto: 6 meses en el futuro
  const fechaFuturaDefault = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  }, []);

  const [idProducto, setIdProducto] = useState<number | ''>(productos[0]?.id_producto || '');
  const [numeroLote, setNumeroLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(fechaFuturaDefault);
  const [fechaIngreso, setFechaIngreso] = useState(hoyString);
  const [idBodega, setIdBodega] = useState<number | ''>(bodegas[0]?.id_bodega || '');
  const [stockInicial, setStockInicial] = useState<number>(50);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Calcula semáforo en tiempo real para feedback instantáneo
  const semaforoCalculado = useMemo(() => {
    if (!fechaVencimiento) return null;
    return calcularSemaforoLote(fechaVencimiento);
  }, [fechaVencimiento]);

  // Generador de código de lote de muestra
  const generarNumeroLote = () => {
    const anio = new Date().getFullYear();
    const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const random = Math.floor(100 + Math.random() * 900);
    setNumeroLote(`LOT-${anio}-${letra}${random}`);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!idProducto) {
      setErrorLocal('Debes seleccionar un medicamento.');
      return;
    }

    if (!numeroLote.trim()) {
      setErrorLocal('El número de lote del fabricante es obligatorio.');
      return;
    }

    if (!fechaVencimiento) {
      setErrorLocal('La fecha de vencimiento es obligatoria para el algoritmo FEFO.');
      return;
    }

    if (!idBodega) {
      setErrorLocal('Debes seleccionar la bodega o ubicación física.');
      return;
    }

    if (!stockInicial || stockInicial <= 0) {
      setErrorLocal('El stock inicial debe ser mayor a 0 unidades.');
      return;
    }

    setGuardando(true);
    try {
      const payload: NuevoLotePayload = {
        id_producto: Number(idProducto),
        numero_lote: numeroLote.trim(),
        fecha_vencimiento: fechaVencimiento,
        fecha_ingreso: fechaIngreso,
        id_bodega: Number(idBodega),
        stock_inicial: Number(stockInicial),
      };

      await crearLoteConInventario(payload);
      toast.success('Lote registrado con éxito', {
        description: `Lote ${payload.numero_lote} ingresado con ${payload.stock_inicial} unidades bajo control FEFO.`,
      });

      // Reset
      setNumeroLote('');
      alGuardarExitoso();
      alCerrar();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al registrar el lote.';
      setErrorLocal(msg);
      toast.error('No se pudo registrar el lote', { description: msg });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={alCerrar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Tarjeta Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registrar Entrada de Lote (FEFO)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recepción de mercadería, trazabilidad de caducidad y stock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={alCerrar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarEnvio} className="p-6 space-y-4">
              {errorLocal && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorLocal}</span>
                </div>
              )}

              {/* Selección de Medicamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Medicamento / Fármaco <span className="text-red-500">*</span>
                </label>
                <select
                  value={idProducto}
                  onChange={(e) => setIdProducto(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                >
                  {productos.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre} {prod.unidad_medida ? `(${prod.unidad_medida})` : ''} — EAN: {prod.codigo_barras || 'S/C'}
                    </option>
                  ))}
                </select>
              </div>

              {/* N° de Lote y Generador */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    N° de Lote del Fabricante <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generarNumeroLote}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline active:scale-95 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    Sugerir Lote
                  </button>
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="ej. LOT-2026-X89"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Fechas: Vencimiento e Ingreso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fecha de Vencimiento (Caducidad) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fecha de Ingreso / Recepción <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={fechaIngreso}
                      onChange={(e) => setFechaIngreso(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa en tiempo real del Semáforo FEFO */}
              {semaforoCalculado && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      Clasificación Sanitaria Estimada (FEFO):
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {semaforoCalculado.diasRestantes > 0
                        ? `Faltan ${semaforoCalculado.diasRestantes} días para el vencimiento`
                        : `Vencido hace ${Math.abs(semaforoCalculado.diasRestantes)} días`}
                    </span>
                  </div>
                  <SemaforoBadge
                    estado={semaforoCalculado.estado}
                    diasRestantes={semaforoCalculado.diasRestantes}
                    tamano="sm"
                  />
                </div>
              )}

              {/* Bodega y Stock Inicial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bodega / Estantería Asignada <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Warehouse className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={idBodega}
                      onChange={(e) => setIdBodega(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                      {bodegas.map((b) => (
                        <option key={b.id_bodega} value={b.id_bodega}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cantidad Recibida (Unidades) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PackageCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min={1}
                      required
                      value={stockInicial}
                      onChange={(e) => setStockInicial(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={alCerrar}
                  disabled={guardando}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:scale-98 text-white shadow-xs transition disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registrando Entrada...
                    </>
                  ) : (
                    'Registrar Lote y Stock'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
