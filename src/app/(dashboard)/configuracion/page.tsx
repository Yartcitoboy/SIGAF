'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { mockFarmacia, mockSucursales } from '@/datos-mock/inventario-data';
import { Building2, Sliders, Shield, Save, Plus } from 'lucide-react';

export default function ConfiguracionPage() {
  const [diasRojo, setDiasRojo] = useState(30);
  const [diasAmarillo, setDiasAmarillo] = useState(90);

  const guardarParametros = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Parámetros del Semáforo actualizados: Rojo <= ${diasRojo} días, Amarillo <= ${diasAmarillo} días`);
  };

  return (
    <div className="space-y-6">
      <Header
        titulo="Configuración del Sistema y Parámetros FEFO"
        subtitulo="Ajustes corporativos de la farmacia, mantención de sucursales y umbrales del semáforo"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Datos Corporativos de la Farmacia */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
                defaultValue={mockFarmacia.razon_social}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">RUT Empresa</label>
              <input
                type="text"
                defaultValue={mockFarmacia.rut}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Dirección Casa Matriz</label>
              <input
                type="text"
                defaultValue={mockFarmacia.direccion}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            onClick={() => alert('Datos de la farmacia actualizados')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar Datos Corporativos
          </button>
        </div>

        {/* 2. Parámetros del Semáforo de Riesgo */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
                  className="w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-red-300 font-bold text-center"
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
                  className="w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 font-bold text-center"
                />
                <span className="text-slate-600 dark:text-slate-400">días antes de la fecha de caducidad</span>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              Actualizar Reglas del Semáforo
            </button>
          </form>
        </div>
      </div>

      {/* 3. Mantenedor de Sucursales de la Farmacia */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Sucursales y Puntos Físicos Habilitados
            </h3>
            <p className="text-[11px] text-slate-500">Locales pertenecientes a {mockFarmacia.razon_social}</p>
          </div>
          <button
            onClick={() => alert('Modal: Registrar Nueva Sucursal')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
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
              {mockSucursales.map((s) => (
                <tr key={s.id_sucursal} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
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
                      onClick={() => alert(`Editar sucursal: ${s.nombre}`)}
                      className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      Editar
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
