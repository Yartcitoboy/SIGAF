'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { mockProductos, mockCategorias } from '@/datos-mock/inventario-data';
import { Search, Plus, Pill, Filter } from 'lucide-react';

export default function ProductosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  const productosFiltrados = mockProductos.filter((p) => {
    const coincideTexto = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo_barras?.includes(busqueda) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCat = categoriaFiltro === 'TODAS' || p.id_categoria.toString() === categoriaFiltro;

    return coincideTexto && coincideCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header
          titulo="Catálogo Maestro de Productos"
          subtitulo="Ficha técnica de medicamentos, código de barras y clasificación terapéutica"
        />
        <button
          onClick={() => alert('Modal: Nuevo Producto (Ficha técnica)')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Medicamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, principio activo o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Categoría:</span>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500"
          >
            <option value="TODAS">Todas las categorías</option>
            {mockCategorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria.toString()}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Código de Barras</th>
                <th className="py-3 px-4">Nombre Comercial / Fármaco</th>
                <th className="py-3 px-4">Presentación / Unidad</th>
                <th className="py-3 px-4">Categoría Terapéutica</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productosFiltrados.map((prod) => {
                const cat = mockCategorias.find((c) => c.id_categoria === prod.id_categoria);

                return (
                  <tr key={prod.id_producto} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">
                      {prod.codigo_barras || 'Sin código'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <div>
                          <span>{prod.nombre}</span>
                          <span className="block text-[11px] font-normal text-slate-400">
                            {prod.descripcion}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {prod.unidad_medida}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {cat?.nombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Editar producto: ${prod.nombre}`)}
                        className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
