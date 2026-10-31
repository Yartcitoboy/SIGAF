"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerNotificaciones, marcarLeida } from "@/lib/servicios/alertas";
import { useRol } from "@/context/rol-context";
import Link from "next/link";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { coincide, fechaHoraVisible } from "@/lib/vistas/presentacion";
import { GestionEntregaAlertas } from "@/componentes/alertas/gestion-entrega";
import { estadoCorreoVisible } from "@/lib/servicios/entrega-alertas";
export default function AlertasPage() {
  const consulta = useConsulta(obtenerNotificaciones);
  const { rolActual } = useRol();
  const [pendientes, setPendientes] = useState(false);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("");
  const limpiar = () => {
    setPendientes(false);
    setTexto("");
    setTipo("");
  };
  const filas =
    consulta.datos
      ?.filter(
        (n) =>
          (!pendientes || n.estado !== "LEIDO") &&
          (!tipo || n.tipo === tipo) &&
          coincide(texto, n.mensaje, n.destinatario_email, n.id_usuario),
      )
      .sort((a, b) =>
        (b.generado_en || b.fecha_envio).localeCompare(
          a.generado_en || a.fecha_envio,
        ),
      ) ?? [];
  async function atender(id: number) {
    setOcupado(id);
    try {
      await marcarLeida(id);
      await consulta.recargar();
      toast.success(
        "Notificación marcada como leída. Esto no resuelve el incidente.",
      );
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
        subtitulo="Historial de notificaciones. Leer un aviso no equivale a resolver su causa."
      />
      <GestionEntregaAlertas />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pendientes}
          onChange={(e) => setPendientes(e.target.checked)}
        />
        Mostrar solo no leídas
      </label>
      <p className="my-4 rounded-xl border border-borde bg-sutil p-4 text-sm text-muted">
        Los mensajes conservan la situación al emitirse; los plazos escritos no
        son el estado actual del lote. Consulta Inventario antes de actuar.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar alertas"
          className="campo max-w-lg"
          placeholder="Mensaje o destinatario"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select
          aria-label="Tipo de alerta"
          className="campo w-auto!"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {["CADUCIDAD", "STOCK", "SISTEMA"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <Link href="/inventario" className="boton-secundario">
          Consultar estado actual
        </Link>
      </div>
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.length}
          unidad="notificaciones"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length}
        filtrado={Boolean(pendientes || texto || tipo)}
        limpiar={limpiar}
      />
      {consulta.datos && !consulta.cargando && !consulta.error && (
        <div className="space-y-3">
          {filas.map((n) => (
            <article
              key={n.id_notificacion}
              className="panel flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-acento">
                  {n.tipo} · {n.estado === "LEIDO" ? "Leída" : "No leída"} ·
                  Aviso histórico
                </span>
                <p className="mt-2 text-sm font-medium">{n.mensaje}</p>
                <p className="mt-2 text-xs text-muted">
                  Emitida {fechaHoraVisible(n.generado_en || n.fecha_envio)}
                  {rolActual === "ADMIN" &&
                    " · Destinatario: " +
                      (n.destinatario_email || n.id_usuario) +
                      " · Correo: " +
                      estadoCorreoVisible(n.estado_correo || "Sin registro")}
                </p>
                {rolActual === "ADMIN" && n.error_correo && (
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                    {n.error_correo}
                  </p>
                )}
              </div>
              {n.estado !== "LEIDO" && (
                <button
                  disabled={ocupado !== null}
                  onClick={() => atender(n.id_notificacion)}
                  className="boton-secundario"
                >
                  {ocupado === n.id_notificacion
                    ? "Guardando…"
                    : "Marcar como leída"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </TransicionPagina>
  );
}
