'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import { obtenerUsuarios, obtenerPerfiles, obtenerSucursales } from '@/lib/servicios/usuarios';
import type { Usuario, Perfil, Sucursal } from '@/tipos/database';
import { Plus, ShieldCheck, Mail, Building2, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalCrearUsuario } from '@/componentes/modales/modal-crear-usuario';

export default function UsuariosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState('TODOS');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Datos reales desde Supabase
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [usrData, perfData, sucData] = await Promise.all([
        obtenerUsuarios(),
        obtenerPerfiles(),
        obtenerSucursales(),
      ]);
      setUsuarios(usrData);
      setPerfiles(perfData);
      setSucursales(sucData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const usuariosFiltrados = usuarios.filter((usr) => {
    const coincideTexto =
      usr.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usr.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincidePerfil =
      perfilFiltro === 'TODOS' || usr.perfil?.nombre === perfilFiltro;

    return coincideTexto && coincidePerfil;
  });

  return (
    <TransicionPagina>
      <div className="flex items-center justify-between">
        <Header
          titulo="Gestión de Personal y Cuentas de Acceso"
          subtitulo="Control de usuarios de farmacia y asignación de roles (RBAC)"
        />
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between transition-all duration-200 hover:shadow-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Perfil / Rol:</span>
          <select
            value={perfilFiltro}
            onChange={(e) => setPerfilFiltro(e.target.value)}
            className="py-1.5 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-teal-500 transition"
          >
            <option value="TODOS">Todos los roles</option>
            {perfiles.map((p) => (
              <option key={p.id_perfil} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Cuentas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol del Sistema</th>
                <th className="py-3 px-4">Sucursal Asignada</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cargando && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Cargando cuentas de acceso desde la base de datos...
                  </td>
                </tr>
              )}
              {error && !cargando && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-500 text-xs">
                    Error al cargar usuarios: {error}
                  </td>
                </tr>
              )}
              {!cargando && !error && usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {usuariosFiltrados.map((usr) => (
                  <motion.tr
                    key={usr.id_usuario}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-teal-600">
                          {usr.nombre.charAt(0)}
                        </div>
                        <span>{usr.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {usr.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        usr.perfil?.nombre === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : usr.perfil?.nombre === 'BODEGUERO'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {usr.perfil?.nombre || 'SIN ROL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {usr.sucursal?.nombre || 'Sin sucursal'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {usr.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-[11px]">
                          <XCircle className="w-3 h-3" /> Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Editar usuario: ${usr.nombre}`)}
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

      {/* Modal para Crear Usuario */}
      <ModalCrearUsuario
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alGuardarExitoso={cargarDatos}
        perfiles={perfiles}
        sucursales={sucursales}
      />
    </TransicionPagina>
  );
}
