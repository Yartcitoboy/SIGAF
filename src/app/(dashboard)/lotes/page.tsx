'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { SemaforoBadge } from '@/componentes/ui/semaforo-badge';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerLotes,
  obtenerProductosParaLote,
  obtenerBodegasParaLote,
  registrarEntradaLote,
  type LoteConStock,
} from '@/lib/servicios/lotes';
import { Search, Plus, QrCode, Filter, Calendar, X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Usuario de demostración (Administrador) para registrar el movimiento
const USUARIO_DEMO = '00000000-0000-0000-0000-000000000001';

interface FormLote {
  id_producto: number | '';
  numero_lote: string;
  fecha_vencimiento: string;
  id_bodega: number | '';
  cantidad: number;
}

export default function LotesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [semaforoFiltro, setSemaforoFiltro] = useState('TODOS');

  // Datos desde Supabase
  const [lotesConStock, setLotesConStock] = useState<LoteConStock[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de registro de entrada
  const [form, setForm] = useState<FormLote | null>(null);
  const [productos, setProductos] = useState<{ id_producto: number; nombre: string }[]>([]);
  const [bodegas, setBodegas] = useState<{ id_bodega: number; nombre: string }[]>([]);
  const [guardando, setGuardando] = useState(false);

  const recargarLotes = async () => {
    const data = await obtenerLotes();
    setLotesConStock(data);
  };

  useEffect(() => {
    async function cargarDatos() {
      try {
        const data = await obtenerLotes();
        setLotesConStock(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const abrirNuevoLote = async () => {
    try {
      const [prods, bods] = await Promise.all([
        obtenerProductosParaLote(),
        obtenerBodegasParaLote(),
      ]);
      setProductos(prods);
      setBodegas(bods);
      setForm({
        id_producto: prods[0]?.id_producto ?? '',
        numero_lote: '',
        fecha_vencimiento: '',
        id_bodega: bods[0]?.id_bodega ?? '',
        cantidad: 1,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Genera e imprime una etiqueta del lote para pegar en la estantería
  const imprimirEtiqueta = (lote: LoteConStock) => {
    const ventana = window.open('', '_blank', 'width=400,height=500');
    if (!ventana) return;
    ventana.document.write(`
      <html>
      <head><title>Etiqueta ${lote.numero_lote}</title>
      <style>
        body{font-family:Arial,sans-serif;text-align:center;padding:24px;}
        .caja{border:2px dashed #0d9488;border-radius:12px;padding:20px;}
        h2{margin:0 0 4px;color:#0f766e;font-size:18px;}
        .lote{font-family:monospace;font-size:22px;font-weight:bold;letter-spacing:1px;margin:10px 0;}
        .campo{font-size:13px;color:#333;margin:4px 0;}
        .venc{color:#b91c1c;font-weight:bold;}
        .barras{font-family:'Libre Barcode 39',monospace;font-size:48px;margin-top:10px;letter-spacing:-2px;}
      </style></head>
      <body>
        <div class="caja">
          <h2>${lote.producto?.nombre ?? 'Producto'}</h2>
          <div class="campo">Ubicación: ${lote.bodega}</div>
          <div class="lote">${lote.numero_lote}</div>
          <div class="campo venc">Vence: ${lote.fecha_vencimiento}</div>
          <div class="campo">Stock: ${lote.stock} unidades</div>
          <div class="barras">*${lote.numero_lote}*</div>
          <div class="campo">SIGAF · Control FEFO</div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  const guardarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || form.id_producto === '' || form.id_bodega === '') return;
    setGuardando(true);
    try {
      await registrarEntradaLote({
        id_producto: Number(form.id_producto),
        numero_lote: form.numero_lote,
        fecha_vencimiento: form.fecha_vencimiento,
        id_bodega: Number(form.id_bodega),
        cantidad: form.cantidad,
        id_usuario: USUARIO_DEMO,
      });
      await recargarLotes();
      setForm(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = lotesConStock.filter((l) => {
    const coincideTexto =
      l.numero_lote.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.producto?.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideSemaforo = semaforoFiltro === 'TODOS' || l.estado_semaforo === semaforoFiltro;

    return coincideTexto && coincideSemaforo;
  });

  return (
    <TransicionPagina>
      <div className="flex items-center justify-between">
        <Header
          titulo="Control y Trazabilidad de Lotes (FEFO)"
          subtitulo="Registro de fechas de vencimiento, lote de fabricante y control de caducidad"
        />
        <button
          onClick={abrirNuevoLote}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Registrar Entrada de Lote
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between transition-all duration-200 hover:shadow-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° lote o nombre de medicamento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Estado Semáforo:</span>
          <select
            value={semaforoFiltro}
            onChange={(e) => setSemaforoFiltro(e.target.value)}
            className="py-1.5 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500 transition"
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
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
              {cargando && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Cargando lotes desde la base de datos...
                  </td>
                </tr>
              )}
              {error && !cargando && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-red-500 text-xs">
                    Error al cargar datos: {error}
                  </td>
                </tr>
              )}
              {!cargando && !error && filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron lotes con los filtros seleccionados.
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {filtrados.map((lote) => (
                  <motion.tr
                    key={lote.id_lote}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
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
                        onClick={() => imprimirEtiqueta(lote)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 active:scale-95 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-all"
                        title="Imprimir etiqueta para la estantería"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Imprimir QR
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal registrar entrada de lote */}
      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => !guardando && setForm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  Registrar Entrada de Lote
                </h3>
                <button onClick={() => !guardando && setForm(null)} className="text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={guardarLote} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Medicamento</label>
                  <select
                    required
                    value={form.id_producto}
                    onChange={(e) => setForm({ ...form, id_producto: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  >
                    {productos.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Número de lote</label>
                  <input
                    type="text"
                    required
                    value={form.numero_lote}
                    onChange={(e) => setForm({ ...form, numero_lote: e.target.value })}
                    placeholder="Ej: L-2026-XX01"
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Fecha de vencimiento</label>
                  <input
                    type="date"
                    required
                    value={form.fecha_vencimiento}
                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Bodega de destino</label>
                  <select
                    required
                    value={form.id_bodega}
                    onChange={(e) => setForm({ ...form, id_bodega: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  >
                    {bodegas.map((b) => (
                      <option key={b.id_bodega} value={b.id_bodega}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Cantidad de unidades</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setForm(null)}
                    disabled={guardando}
                    className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-medium transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition disabled:opacity-60"
                  >
                    {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {guardando ? 'Registrando...' : 'Registrar entrada'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransicionPagina>
  );
}
