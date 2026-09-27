'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { mockNotificaciones } from '@/datos-mock/inventario-data';
import { Bell, Check, Clock, Mail, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AlertasPage() {
  const [notificaciones, setNotificaciones] = useState(mockNotificaciones);

  const marcarComoLeida = (id: number) => {
    setNotificaciones(prev =>
      prev.map(n => n.id_notificacion === id ? { ...n, estado: 'LEIDO' } : n)
    );
  };

  return (
    <div className="space-y-6">
      <Header
        titulo="Bandeja de Alertas de Caducidad"
        subtitulo="Notificaciones generadas automáticamente a las 00:00 hrs enviadas a web y correo electrónico"
      />

      {/* Tarjeta explicativa del proceso automático */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Cron Worker Activo</span>
          </div>
          <h3 className="font-bold text-base">Evaluación Nocturna Automática</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Cada día a las 00:00 hrs, el sistema analiza las fechas de caducidad de todos los lotes. Si un lote pasa a Amarillo (&lt;90d) o Rojo (&lt;30d/Caducado), despacha un email transaccional vía Resend y genera una alerta aquí.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
          <Mail className="w-4 h-4 text-teal-400" />
          <span>Integrado con Resend REST API</span>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {notificaciones.map((notif) => {
          const esCritica = notif.mensaje?.includes('VENCIDO') || notif.mensaje?.includes('CRÍTICO');
          const esPendiente = notif.estado === 'PENDIENTE';

          return (
            <div
              key={notif.id_notificacion}
              className={`p-5 flex items-start justify-between gap-4 transition ${
                esPendiente ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  esCritica
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/60'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60'
                }`}>
                  {esCritica ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      esCritica
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-400 text-amber-950'
                    }`}>
                      {esCritica ? 'URGENTE / CADUCIDAD' : 'PREVENTIVO / FEFO'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {notif.fecha_envio}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                    {notif.mensaje}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>Lote: <strong className="text-slate-700 dark:text-slate-300 font-mono">{notif.lote_afectado}</strong></span>
                    <span>·</span>
                    <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Enviado a administradores y bodega
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {esPendiente ? (
                  <button
                    onClick={() => marcarComoLeida(notif.id_notificacion)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Marcar Atendida
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    Atendida
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
