'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, Barcode, Sparkles, Loader2 } from 'lucide-react';
import { crearProducto, type NuevoProducto } from '@/lib/servicios/productos';
import type { Categoria } from '@/tipos/database';
import { toast } from 'sonner';

interface ModalCrearProductoProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  categorias: Categoria[];
}

export function ModalCrearProducto({
  abierto,
  alCerrar,
  alGuardarExitoso,
  categorias,
}: ModalCrearProductoProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | ''>(
    categorias[0]?.id_categoria || ''
  );
  const [unidadMedida, setUnidadMedida] = useState('Caja x 30 comp');
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Genera un código de barras EAN-13 simulado con prefijo chileno 780
  const generarCodigoBarras = () => {
    const aleatorio = Math.floor(100000000 + Math.random() * 900000000);
    setCodigoBarras(`780${aleatorio}`);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!nombre.trim()) {
      setErrorLocal('El nombre del medicamento es obligatorio.');
      return;
    }

    if (!idCategoria) {
      setErrorLocal('Debes seleccionar una categoría terapéutica.');
      return;
    }

    setGuardando(true);
    try {
      const payload: NuevoProducto = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        codigo_barras: codigoBarras.trim() || null,
        unidad_medida: unidadMedida.trim() || null,
        id_categoria: Number(idCategoria),
      };

      await crearProducto(payload);
      toast.success('Medicamento registrado', {
        description: `"${payload.nombre}" se agregó al catálogo maestro.`,
      });

      // Limpiar formulario y cerrar
      setNombre('');
      setDescripcion('');
      setCodigoBarras('');
      alGuardarExitoso();
      alCerrar();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al guardar el producto.';
      setErrorLocal(msg);
      toast.error('No se pudo guardar el medicamento', { description: msg });
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
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nuevo Medicamento
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ficha técnica farmacéutica y catálogo maestro
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
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
                  {errorLocal}
                </div>
              )}

              {/* Nombre Fármaco */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre Comercial / Fármaco <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Paracetamol 500 mg, Amoxicilina 875 mg"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>

              {/* Categoría y Unidad de Medida (2 columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoría Terapéutica <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Presentación / Unidad
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Caja x 30 comp, Frasco 100 mL"
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Código de Barras con generador automático */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Código de Barras (EAN-13 / GS1)
                  </label>
                  <button
                    type="button"
                    onClick={generarCodigoBarras}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline active:scale-95 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generar EAN Automático
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="ej. 7801234567890"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Descripción / Laboratorio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Principio Activo, Laboratorio y Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Laboratorio Chile - Bioequivalente. Almacenar a T° ambiente (<25°C)."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                />
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
                      Registrando...
                    </>
                  ) : (
                    'Guardar Medicamento'
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
