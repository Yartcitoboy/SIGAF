'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerUsuarios,
  obtenerPerfiles,
  obtenerSucursales,
  crearUsuario,
  actualizarUsuario,
} from '@/lib/servicios/usuarios';
import type { Usuario, Perfil, Sucursal } from '@/tipos/database';
import { Plus, ShieldCheck, Mail, Building2, CheckCircle2, XCircle, X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormUsuario {
  id_usuario?: string;
  nombre: string;
  email: string;
  id_perfil: number;
  id_sucursal: number | null;
  activo: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Crear / Editar
  const [form, setForm] = useState<FormUsuario | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [users, perfs, sucs] = await Promise.all([
          obtenerUsuarios(),
          obtenerPerfiles(),
          obtenerSucursales(),
        ]);
        setUsuarios(users);
        setPerfiles(perfs);
        setSucursales(sucs);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setEsNuevo(true);
    setForm({
      nombre: '',
      email: '',
      id_perfil: perfiles[0]?.id_perfil ?? 1,
      id_sucursal: sucursales[0]?.id_sucursal ?? null,
      activo: true,
    });
  };

  const abrirEditar = (u: Usuario) => {
    setEsNuevo(false);
    setForm({
      id_usuario: u.id_usuario,
      nombre: u.nombre,
      email: u.email,
      id_perfil: u.id_perfil,
      id_sucursal: u.id_sucursal ?? null,
      activo: u.activo,
    });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    try {
      if (esNuevo) {
        const creado = await crearUsuario({
          nombre: form.nombre,
          email: form.email,
          id_perfil: form.id_perfil,
          id_sucursal: form.id_sucursal,
          activo: form.activo,
        });
        setUsuarios((prev) => [...prev, creado]);
      } else {
        const actualizado = await actualizarUsuario(form.id_usuario!, {
          nombre: form.nombre,
          email: form.email,
          id_perfil: form.id_perfil,
          id_sucursal: form.id_sucursal,
          activo: form.activo,
        });
        setUsuarios((prev) =>
          prev.map((u) => (u.id_usuario === actualizado.id_usuario ? actualizado : u))
        );
      }
      setForm(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <TransicionPagina>
      <div className="flex items-center justify-between">
        <Header
          titulo="Gestión de Personal y Cuentas de Acceso"
          subtitulo="Control de usuarios de farmacia y asignación de roles (RBAC)"
        />
        <button
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
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
                <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-xs">Cargando usuarios desde la base de datos...</td></tr>
              )}
              {error && !cargando && (
                <tr><td colSpan={6} className="py-8 text-center text-red-500 text-xs">Error al cargar datos: {error}</td></tr>
              )}
              {!cargando && !error && usuarios.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-xs">No hay usuarios registrados.</td></tr>
              )}
              <AnimatePresence>
                {usuarios.map((usr) => (
                  <motion.tr
                    key={usr.id_usuario}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        {usr.perfil?.nombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {usr.sucursal?.nombre ?? 'Sin asignar'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {usr.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-medium text-[11px]">
                          <XCircle className="w-3 h-3" /> Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => abrirEditar(usr)}
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

      {/* Modal crear / editar usuario */}
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
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  {esNuevo ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h3>
                <button onClick={() => !guardando && setForm(null)} className="text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={guardar} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Rol</label>
                  <select
                    value={form.id_perfil}
                    onChange={(e) => setForm({ ...form, id_perfil: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  >
                    {perfiles.map((p) => (
                      <option key={p.id_perfil} value={p.id_perfil}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Sucursal</label>
                  <select
                    value={form.id_sucursal ?? ''}
                    onChange={(e) => setForm({ ...form, id_sucursal: e.target.value ? Number(e.target.value) : null })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 transition"
                  >
                    <option value="">Sin asignar</option>
                    {sucursales.map((s) => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <label htmlFor="activo" className="text-slate-600 dark:text-slate-400 font-medium">Cuenta activa</label>
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
                    {guardando ? 'Guardando...' : esNuevo ? 'Crear usuario' : 'Guardar cambios'}
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
