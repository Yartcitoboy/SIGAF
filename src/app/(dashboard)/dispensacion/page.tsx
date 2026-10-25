'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerProductosDispensables,
  obtenerBodegas,
  consultarLoteFEFO,
  dispensar,
  type ProductoDisponible,
  type Bodega,
  type LoteFEFO,
} from '@/lib/servicios/dispensacion';
import {
  ShoppingCart,
  Pill,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const USUARIO_DEMO = '00000000-0000-0000-0000-000000000001';

export default function DispensacionPage() {
  const [productos, setProductos] = useState<ProductoDisponible[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [idProducto, setIdProducto] = useState<number | ''>('');
  const [idBodega, setIdBodega] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState(1);

  const [loteFEFO, setLoteFEFO] = useState<LoteFEFO | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [consultando, setConsultando] = useState(false);
  const [dispensando, setDispensando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const [prods, bods] = await Promise.all([
          obtenerProductosDispensables(),
          obtenerBodegas(),
        ]);
        setProductos(prods);
        setBodegas(bods);
        setIdProducto(prods[0]?.id_producto ?? '');
        setIdBodega(bods[0]?.id_bodega ?? '');
      } catch (e) {
        setError((e as Error).message);
      }
    }
    cargar();
  }, []);

  // Consultar el lote FEFO cuando cambia producto o bodega
  useEffect(() => {
    async function consultar() {
      if (idProducto === '' || idBodega === '') return;
      setConsultando(true);
      setResultado(null);
      setBloqueado(false);
      setLoteFEFO(null);
      try {
        const lote = await consultarLoteFEFO(Number(idProducto), Number(idBodega));
        if (!lote) {
          setBloqueado(true);
        } else {
          setLoteFEFO(lote);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setConsultando(false);
      }
    }
    consultar();
  }, [idProducto, idBodega]);

  const confirmarDispensacion = async () => {
    if (idProducto === '' || idBodega === '') return;
    setDispensando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await dispensar(Number(idProducto), Number(idBodega), cantidad, USUARIO_DEMO);
      setResultado(
        `Dispensadas ${res.despachado} unidades del lote ${res.numero_lote}. Stock restante: ${res.stock_restante}.`
      );
      // Volver a consultar el lote (puede cambiar si se agotó)
      const lote = await consultarLoteFEFO(Number(idProducto), Number(idBodega));
      setLoteFEFO(lote);
      setBloqueado(!lote);
      setCantidad(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDispensando(false);
    }
  };

  const diasRestantes = loteFEFO
    ? Math.floor((new Date(loteFEFO.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <TransicionPagina>
      <Header
        titulo="Dispensación de Medicamentos (Motor FEFO)"
        subtitulo="El sistema indica automáticamente qué lote retirar y bloquea los productos vencidos"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de selección */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-600" />
            Nueva Dispensación
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Medicamento a dispensar</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={idProducto}
                  onChange={(e) => setIdProducto(Number(e.target.value))}
                  className="w-full pl-9 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                >
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Bodega / Punto de venta</label>
              <select
                value={idBodega}
                onChange={(e) => setIdBodega(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
              >
                {bodegas.map((b) => (
                  <option key={b.id_bodega} value={b.id_bodega}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Cantidad a dispensar</label>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <button
              onClick={confirmarDispensacion}
              disabled={dispensando || bloqueado || !loteFEFO}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-xs active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dispensando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {dispensando ? 'Dispensando...' : 'Confirmar Dispensación'}
            </button>

            {resultado && (
              <div className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg px-3 py-2 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{resultado}</span>
              </div>
            )}
            {error && (
              <div className="text-xs text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Panel de indicación FEFO */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <Pill className="w-4 h-4 text-teal-600" />
            Lote indicado por el sistema (FEFO)
          </h3>

          <AnimatePresence mode="wait">
            {consultando ? (
              <motion.div key="cargando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando el motor FEFO...
              </motion.div>
            ) : bloqueado ? (
              <motion.div key="bloqueado" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border-2 border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 text-center">
                <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-2" />
                <p className="font-bold text-red-700 dark:text-red-400 text-sm">Dispensación Bloqueada</p>
                <p className="text-xs text-red-600/80 mt-1">
                  No hay stock disponible o todos los lotes están vencidos. Por seguridad sanitaria, el sistema impide esta dispensación.
                </p>
              </motion.div>
            ) : loteFEFO ? (
              <motion.div key="lote" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border-2 border-teal-300 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 p-5 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Retirar del lote</p>
                  <p className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">{loteFEFO.numero_lote}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-400">Vence</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{loteFEFO.fecha_vencimiento}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-400">Stock disponible</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{loteFEFO.stock_actual} un.</p>
                    </div>
                  </div>
                </div>
                <div className={`text-center text-xs font-semibold rounded-lg py-1.5 ${
                  diasRestantes <= 7 ? 'bg-red-100 text-red-700' : diasRestantes <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {diasRestantes} días para vencer
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  El sistema aplica FEFO: siempre se despacha primero el lote que vence antes.
                </p>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">Selecciona un producto y una bodega.</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TransicionPagina>
  );
}
