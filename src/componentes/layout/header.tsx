"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Bell, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRol } from "@/context/rol-context";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerNotificaciones, marcarLeida } from "@/lib/servicios/alertas";
import { BotonTema } from "./boton-tema";
export function Header({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  const { perfilActual } = useRol();
  const { datos, error, recargar } = useConsulta(obtenerNotificaciones);
  useEffect(() => {
    const refrescar = () => {
      void recargar();
    };
    window.addEventListener("sigaf:alertas", refrescar);
    return () => window.removeEventListener("sigaf:alertas", refrescar);
  }, [recargar]);
  const sinLeer =
    datos?.filter(
      (n) => n.id_usuario === perfilActual.id_usuario && n.estado !== "LEIDO",
    ) ?? [];
  return (
    <header
      id="contenido-principal"
      tabIndex={-1}
      className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-borde pb-5"
    >
      <div className="min-w-0 flex-1 basis-full sm:basis-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-acento">
          SIGAF /{" "}
          {perfilActual.rol === "ADMIN"
            ? "Administración general · todas las sucursales"
            : perfilActual.sucursal}
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-1 max-w-2xl text-sm text-muted">{subtitulo}</p>
        )}
      </div>
      <div
        aria-label="Herramientas de usuario"
        className="ml-auto flex shrink-0 items-center gap-2"
      >
        <details className="relative">
          <summary
            aria-label="Notificaciones"
            title="Notificaciones"
            className="relative grid min-h-11 min-w-11 cursor-pointer list-none place-items-center rounded-xl border border-borde bg-superficie hover:bg-elevado"
          >
            <Bell size={18} />
            {sinLeer.length > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-accion px-1.5 text-[10px] text-sobre-accion">
                {sinLeer.length}
              </span>
            )}
          </summary>
          <div className="absolute right-0 z-40 mt-2 w-[min(20rem,85vw)] rounded-xl border border-borde bg-superficie p-4 shadow-xl">
            <h2 className="mb-3 font-semibold">Tus notificaciones</h2>
            {error ? (
              <p
                role="alert"
                className="text-sm text-red-700 dark:text-red-300"
              >
                No se pudieron consultar las alertas.
              </p>
            ) : datos === null ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : !sinLeer.length ? (
              <p className="text-sm text-muted">
                No tienes notificaciones sin leer.
              </p>
            ) : (
              sinLeer.slice(0, 5).map((n) => (
                <button
                  key={n.id_notificacion}
                  className="mb-2 block w-full rounded-lg bg-sutil p-3 text-left text-xs"
                  onClick={() => {
                    void marcarLeida(n.id_notificacion).catch((e) =>
                      toast.error(e.message),
                    );
                  }}
                >
                  {n.mensaje}
                </button>
              ))
            )}
            <Link className="mt-3 block text-sm text-acento" href="/alertas">
              Ver centro de alertas →
            </Link>
          </div>
        </details>
        <Link
          href="/mensajes"
          aria-label="Mensajes"
          title="Mensajes"
          className="boton-secundario min-h-11 min-w-11 justify-center px-3"
        >
          <Mail size={18} />
        </Link>
        <BotonTema />
      </div>
    </header>
  );
}
