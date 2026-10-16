'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Building2, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { crearUsuario, type NuevoUsuarioPayload } from '@/lib/servicios/usuarios';
import type { Perfil, Sucursal } from '@/tipos/database';
import { toast } from 'sonner';

interface ModalCrearUsuarioProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  perfiles: Perfil[];
  sucursales: Sucursal[];
}

export function ModalCrearUsuario({
  abierto,
  alCerrar,
  alGuardarExitoso,
  perfiles,
  sucursales,
}: ModalCrearUsuarioProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [idPerfil, setIdPerfil] = useState<number | ''>(perfiles[0]?.id_perfil || 2);
  const [idSucursal, setIdSucursal] = useState<number | ''>(sucursales[0]?.id_sucursal || 1);
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!nombre.trim()) {
      setErrorLocal('El nombre completo es obligatorio.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorLocal('Ingresa un correo electrónico institucional válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!idPerfil) {
      setErrorLocal('Debes seleccionar un perfil/rol para el control de acceso.');
      return;
    }

    setGuardando(true);
    try {
      const payload: NuevoUsuarioPayload = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        id_perfil: Number(idPerfil),
        id_sucursal: idSucursal ? Number(idSucursal) : null,
        activo,
      };

      await crearUsuario(payload);
      toast.success('Usuario creado con éxito', {
        description: `Se dio de alta a ${payload.nombre} con credenciales activas.`,
      });

      // Limpiar formulario y cerrar
      setNombre('');
      setEmail('');
      setPassword('');
      alGuardarExitoso();
      alCerrar();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al crear el usuario.';
      setErrorLocal(msg);
      toast.error('No se pudo crear el usuario', { description: msg });
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
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nuevo Usuario del Sistema
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control de acceso basado en roles (RBAC) y asignación
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

              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Dra. Marcela Reyes, Juan Carlos Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico Institucional <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ej. marcela.reyes@farmavence.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Contraseña Inicial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña Inicial Temporal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rol y Sucursal (2 columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rol / Perfil de Acceso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={idPerfil}
                      onChange={(e) => setIdPerfil(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                      {perfiles.map((p) => (
                        <option key={p.id_perfil} value={p.id_perfil}>
                          {p.nombre} {p.descripcion ? `(${p.descripcion})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sucursal Asignada
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={idSucursal}
                      onChange={(e) => setIdSucursal(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                      {sucursales.map((s) => (
                        <option key={s.id_sucursal} value={s.id_sucursal}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Toggle Estado Activo */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Estado de la Cuenta
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Permite al colaborador iniciar sesión y operar el sistema
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                </label>
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
                      Creando Cuenta...
                    </>
                  ) : (
                    'Crear Usuario'
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
