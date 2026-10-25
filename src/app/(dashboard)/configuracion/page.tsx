'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerFarmacia,
  obtenerSucursales,
  actualizarFarmacia,
  crearSucursal,
  actualizarSucursal,
} from '@/lib/servicios/configuracion';
import type { Farmacia, Sucursal } from '@/tipos/database';
import { Building2, Sliders, Save, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormSucursal {
  id_sucursal?: number;
  nombre: string;
  direccion: string;
}

export default function ConfiguracionPage() {
  const [diasRojo, setDiasRojo] = useState(30);
  const [diasAmarillo, setDiasAmarillo] = useState(90);

  // Datos desde Supabase
  const [farmacia, setFarmacia] = useState<Farmacia | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Guardado de farmacia
  const [guardandoFarmacia, setGuardandoFarmacia] = useState(false);
  const [farmaciaGuardada, setFarmaciaGuardada] = useState(false);

  // Modal de sucursal
  const [formSucursal, setFormSucursal] = useState<FormSucursal | null>(null);
  const [esNuevaSucursal, setEsNuevaSucursal] = useState(false);
  const [guardandoSucursal, setGuardandoSucursal] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [farm, sucs] = await Promise.all([
          obtenerFarmacia(),
          obtenerSucursales(),
        ]);
        setFarmacia(farm);
        setSucursales(sucs);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    cargarDatos();
  }, []);

  const guardarParametros = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Parámetros del Semáforo actualizados: Rojo <= ${diasRojo} días, Amarillo <= ${diasAmarillo} días`);
  };

  // Guardar datos corporativos de la farmacia
  const guardarFarmacia = async () => {
    if (!farmacia) return;
    setGuardandoFarmacia(true);
    setFarmaciaGuardada(false);
    try {
      await actualizarFarmacia(farmacia.id_farmacia, {
        razon_social: farmacia.razon_social,
        rut: farmacia.rut,
        direccion: farmacia.direccion ?? undefined,
      });
      setFarmaciaGuardada(true);
      setTimeout(() => setFarmaciaGuardada(false), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardandoFarmacia(false);
    }
  };

  const abrirNuevaSucursal = () => {
    setEsNuevaSucursal(true);
    setFormSucursal({ nombre: '', direccion: '' });
  };

  const abrirEditarSucursal = (s: Sucursal) => {
    setEsNuevaSucursal(false);
    setFormSucursal({ id_sucursal: s.id_sucursal, nombre: s.nombre, direccion: s.direccion ?? '' });
  };

  const guardarSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSucursal || !farmacia) return;
    setGuardandoSucursal(true);
    try {
      if (esNuevaSucursal) {
        const creada = await crearSucursal({
          nombre: formSucursal.nombre,
          direccion: formSucursal.direccion,
          id_farmacia: farmacia.id_farmacia,
        });
        setSucursales((prev) => [...prev, creada]);
      } else {
        const actualizada = await actualizarSucursal(formSucursal.id_sucursal!, {
          nombre: formSucursal.nombre,
          direccion: formSucursal.direccion,
        });
        setSucursales((prev) => prev.map((s) => (s.id_sucursal === actualizada.id_sucursal ? actualizada : s)));
      }
      setFormSucursal(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardandoSucursal(false);
    }
  };

  return (
    <TransicionPagina>
      <Header
        titulo="Configuración del Sistema y Parámetros FEFO"
        subtitulo="Ajustes corporativos de la farmacia, mantención de sucursales y umbrales del semáforo"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Datos Corporativos de la Farmacia */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Datos de la Razón Social (Farmacia)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Razón Social</label>
              <input
                type="text"
                value={farmacia?.razon_social ?? ''}
                onChange={(e) => farmacia && setFarmacia({ ...farmacia, razon_social: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">RUT Empresa</label>
              <input
                type="text"
                value={farmacia?.rut ?? ''}
                onChange={(e) => farmacia && setFarmacia({ ...farmacia, rut: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Dirección Casa Matriz</label>
              <input
                type="text"
                value={farmacia?.direccion ?? ''}
                onChange={(e) => farmacia && setFarmacia({ ...farmacia, direccion: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={guardarFarmacia}
              disabled={guardandoFarmacia}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150 disabled:opacity-60"
            >
              {guardandoFarmacia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {guardandoFarmacia ? 'Guardando...' : 'Guardar Datos Corporativos'}
            </button>
            {farmaciaGuardada && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
              </span>
            )}
          </div>
        </div>

        {/* 2. Parámetros del Semáforo de Riesgo */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Umbrales del Semáforo de Vencimiento
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Define cuántos días antes de la fecha de caducidad el lote cambia de color para activar alertas y prioridad FEFO.
          </p>

          <form onSubmit={guardarParametros} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl border border-red-200 bg-red-50/40 dark:bg-red-950/20">
              <label className="block text-red-900 dark:text-red-300 font-bold mb-1">
                🔴 Límite Alerta Roja (Crítico / Retiro)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={diasRojo}
                  onChange={(e) => setDiasRojo(Number(e.target.value))}
                  className="w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-red-300 font-bold text-center focus:ring-2 focus:ring-red-500 transition"
                />
                <span className="text-slate-600 dark:text-slate-400">días antes de la fecha de caducidad</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20">
              <label className="block text-amber-900 dark:text-amber-300 font-bold mb-1">
                🟡 Límite Alerta Amarilla (Preventivo / Rotación FEFO)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={diasAmarillo}
                  onChange={(e) => setDiasAmarillo(Number(e.target.value))}
                  className="w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 font-bold text-center focus:ring-2 focus:ring-amber-500 transition"
                />
                <span className="text-slate-600 dark:text-slate-400">días antes de la fecha de caducidad</span>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
            >
              <Save className="w-3.5 h-3.5" />
              Actualizar Reglas del Semáforo
            </button>
          </form>
        </div>
      </div>

      {/* 3. Mantenedor de Sucursales de la Farmacia */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Sucursales y Puntos Físicos Habilitados
            </h3>
            <p className="text-[11px] text-slate-500">Locales pertenecientes a {farmacia?.razon_social ?? 'la farmacia'}</p>
          </div>
          <button
            onClick={abrirNuevaSucursal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Sucursal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre de Sucursal</th>
                <th className="py-3 px-4">Dirección Física</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {error && (
                <tr><td colSpan={4} className="py-6 text-center text-red-500 text-xs">Error al cargar datos: {error}</td></tr>
              )}
              <AnimatePresence>
                {sucursales.map((s) => (
                  <motion.tr
                    key={s.id_sucursal}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-400">
                      #{s.id_sucursal}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {s.nombre}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {s.direccion}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirEditarSucursal(s)}
                        className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline active:scale-95 transition-transform"
                      >
                        Editar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear / editar sucursal */}
      <AnimatePresence>
        {formSucursal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={() => !guardandoSucursal && setFormSucursal(null)}
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
                  <Building2 className="w-4 h-4 text-teal-600" />
                  {esNuevaSucursal ? 'Nueva Sucursal' : 'Editar Sucursal'}
                </h3>
                <button onClick={() => !guardandoSucursal && setFormSucursal(null)} className="text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={guardarSucursal} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nombre de la sucursal</label>
                  <input
                    type="text"
                    required
                    value={formSucursal.nombre}
                    onChange={(e) => setFormSucursal({ ...formSucursal, nombre: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Dirección física</label>
                  <input
                    type="text"
                    value={formSucursal.direccion}
                    onChange={(e) => setFormSucursal({ ...formSucursal, direccion: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormSucursal(null)}
                    disabled={guardandoSucursal}
                    className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 text-xs font-medium transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoSucursal}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition disabled:opacity-60"
                  >
                    {guardandoSucursal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {guardandoSucursal ? 'Guardando...' : esNuevaSucursal ? 'Crear sucursal' : 'Guardar cambios'}
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
