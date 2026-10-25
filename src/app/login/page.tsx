'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pill, Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { login } from '@/lib/servicios/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await login(email, password);
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(res.mensaje ?? 'No fue posible iniciar sesión.');
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100">
      {/* Panel izquierdo - Branding (oculto en móvil) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Pill className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              SIGAF
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FEFO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Farmacia FarmaVence</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Gestión y Alerta<br />de Caducidad
          </h2>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Controla el inventario farmacéutico, evita vencimientos en estantería y
            garantiza la seguridad del paciente con el método FEFO.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceso seguro con control por roles</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          Sistema Inteligente de Gestión y Alerta de Caducidad · {new Date().getFullYear()}
        </p>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Logo visible en móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <Pill className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold text-xl">SIGAF</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Iniciar sesión</h2>
          <p className="text-sm text-slate-400 mb-7">
            Ingresa tus credenciales para acceder al sistema.
          </p>

          <form onSubmit={manejarSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@farmavence.cl"
                  className="w-full pl-9 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type={verPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition"
                >
                  {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Ayuda de credenciales demo */}
          <div className="mt-6 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 leading-relaxed">
            <p className="font-semibold text-slate-400 mb-1">Credenciales de demostración:</p>
            <p>admin@farmavence.cl · bodega@farmavence.cl · cajero@farmavence.cl</p>
            <p className="mt-1">Contraseña: <span className="font-mono text-emerald-400">sigaf2026</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
