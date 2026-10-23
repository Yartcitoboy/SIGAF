"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerNotificaciones, marcarLeida } from "@/lib/servicios/alertas";
import { useRol } from "@/context/rol-context";
export default function AlertasPage() {
  const consulta = useConsulta(obtenerNotificaciones);
  const { rolActual, soloLectura } = useRol();
  const [pendientes, setPendientes] = useState(false);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const filas =
    consulta.datos?.filter((n) => !pendientes || n.estado !== "LEIDO") ?? [];
  async function atender(id: number) {
    setOcupado(id);
    try {
      await marcarLeida(id);
      await consulta.recargar();
      toast.success("Alerta atendida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo atender.");
    } finally {
      setOcupado(null);
    }
  }
  return (
    <TransicionPagina>
      <Header
        titulo="Centro de alertas"
        subtitulo="Historial de caducidad, destinatarios y atención de notificaciones."
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pendientes}
          onChange={(e) => setPendientes(e.target.checked)}
        />
        Mostrar solo pendientes
      </label>
      <EstadoDatos {...consulta} vacio={!filas.length} />
      {consulta.datos && !consulta.cargando && !consulta.error && (
        <div className="space-y-3">
          {filas.map((n) => (
            <article
              key={n.id_notificacion}
              className="panel flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-acento">
                  {n.tipo} · {n.estado === "LEIDO" ? "Atendida" : "Pendiente"}
                </span>
                <p className="mt-2 text-sm font-medium">{n.mensaje}</p>
                <p className="mt-2 text-xs text-muted">
                  {n.fecha_envio.replace("T", " ").slice(0, 16)}
                  {rolActual === "ADMIN" &&
                    " · Destinatario: " +
                      (n.destinatario_email || n.id_usuario) +
                      " · Correo: " +
                      (n.estado_correo || "Sin registro")}
                </p>
                {rolActual === "ADMIN" && n.error_correo && (
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                    {n.error_correo}
                  </p>
                )}
              </div>
              {n.estado !== "LEIDO" && (
                <button
                  disabled={ocupado !== null || soloLectura}
                  onClick={() => atender(n.id_notificacion)}
                  className="boton-secundario"
                >
                  {ocupado === n.id_notificacion
                    ? "Guardando…"
                    : "Marcar atendida"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </TransicionPagina>
  );
}
