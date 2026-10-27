"use client";
import { useState } from "react";
import { Mail, Send, MessageSquare } from "lucide-react";
import { Header } from "@/componentes/layout/header";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
export default function MensajesPage() {
  const [canal, setCanal] = useState("Administración");
  return (
    <TransicionPagina>
      <Header
        titulo="Mensajes"
        subtitulo="Espacio de comunicación del equipo."
      />
      <div className="mb-4 rounded-xl border border-borde bg-sutil p-4 text-sm text-muted">
        Interfaz en preparación. Aún no se envían ni se guardan mensajes.
      </div>
      <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[16rem_1fr]">
        <section className="panel">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Mail size={18} />
            Equipos
          </h2>
          <div className="space-y-2">
            {["Administración", "Gerencia", "Bodega", "Auxiliares"].map(
              (nombre) => (
                <button
                  key={nombre}
                  type="button"
                  aria-pressed={canal === nombre}
                  onClick={() => setCanal(nombre)}
                  className={
                    "w-full rounded-xl p-3 text-left text-sm transition " +
                    (canal === nombre
                      ? "bg-acento-suave font-semibold text-acento"
                      : "hover:bg-elevado")
                  }
                >
                  {nombre}
                </button>
              ),
            )}
          </div>
          <p className="mt-5 text-xs text-muted">
            Gerencia es una propuesta de canal. No crea un rol ni cambia los
            permisos actuales.
          </p>
        </section>
        <section className="panel flex min-w-0 flex-col">
          <h2 className="border-b border-borde pb-4 font-semibold">{canal}</h2>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
            <MessageSquare size={32} className="text-acento" />
            <h3 className="font-semibold">Sin conversaciones disponibles</h3>
            <p className="max-w-sm text-sm text-muted">
              Aquí podrás consultar las conversaciones cuando se habilite la
              mensajería.
            </p>
          </div>
          <div className="flex items-end gap-2 border-t border-borde pt-4">
            <label className="min-w-0 flex-1 text-sm">
              Mensaje
              <textarea
                disabled
                placeholder="El envío todavía no está habilitado"
                className="campo mt-2 resize-none"
                rows={2}
              />
            </label>
            <button
              disabled
              aria-label="Enviar mensaje: función pendiente"
              className="boton-primario min-h-11"
            >
              <Send size={17} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </section>
      </div>
    </TransicionPagina>
  );
}
