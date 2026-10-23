"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Bell, LogOut, KeyRound } from "lucide-react";
import { useRol } from "@/context/rol-context";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerNotificaciones, marcarLeida } from "@/lib/servicios/alertas";
import { createClient } from "@/lib/supabase/client";
import { Dialogo } from "@/componentes/ui/dialogo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BotonTema } from "./boton-tema";

export function Header({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  const router = useRouter();
  const { perfilActual, soloLectura } = useRol();
  const { datos, error, recargar } = useConsulta(obtenerNotificaciones);
  const [clave, setClave] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    const refrescar = () => {
      void recargar();
    };
    window.addEventListener("sigaf:alertas", refrescar);
    return () => {
      window.removeEventListener("sigaf:alertas", refrescar);
    };
  }, [recargar]);
  const sinLeer =
    datos?.filter(
      (n) => n.id_usuario === perfilActual.id_usuario && n.estado !== "LEIDO",
    ) ?? [];
  async function cambiarClave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("nueva") !== form.get("confirmacion")) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setOcupado(true);
    try {
      const db = createClient();
      const { error: authError } = await db.auth.signInWithPassword({
        email: perfilActual.email,
        password: String(form.get("actual")),
      });
      if (authError) throw new Error("La contraseña actual no es correcta.");
      const { error } = await db.auth.updateUser({
        password: String(form.get("nueva")),
      });
      if (error) throw error;
      toast.success("Contraseña actualizada");
      setClave(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setOcupado(false);
    }
  }
  async function salir() {
    try {
      if (perfilActual.accesoLocal) {
        const respuesta = await fetch("/api/acceso-local", {
          method: "DELETE",
        });
        if (!respuesta.ok)
          throw new Error("No se pudo cerrar la sesión local.");
      } else {
        const { error } = await createClient().auth.signOut();
        if (error) throw error;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("No se pudo cerrar la sesión. Inténtalo nuevamente.");
    }
  }
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-borde pb-5">
      <div className="min-w-0 flex-1 basis-full sm:basis-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-acento">
          SIGAF / {perfilActual.sucursal}
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-1 max-w-2xl text-sm text-muted">{subtitulo}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <BotonTema />
        <details className="relative">
          <summary
            aria-label="Notificaciones"
            className="relative cursor-pointer list-none rounded-xl border border-borde p-3"
          >
            <Bell size={19} />
            {sinLeer.length > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-accion px-1.5 text-[10px] text-sobre-accion">
                {sinLeer.length}
              </span>
            )}
          </summary>
          <div className="absolute right-0 z-40 mt-2 w-[min(20rem,85vw)] rounded-xl border border-borde bg-superficie p-4 shadow-xl">
            <h3 className="mb-3 font-semibold">Tus notificaciones</h3>
            {error ? (
              <p className="text-sm text-red-700 dark:text-red-300">
                No se pudieron consultar las alertas.
              </p>
            ) : datos === null ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : !sinLeer.length ? (
              <p className="text-sm text-muted">
                Estás al día. Sin alertas pendientes.
              </p>
            ) : (
              sinLeer.slice(0, 5).map((n) => (
                <button
                  key={n.id_notificacion}
                  disabled={soloLectura}
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
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 hover:bg-elevado">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-acento-suave text-sm font-bold text-acento">
              {perfilActual.iniciales}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-xs font-semibold">
                {perfilActual.nombre}
              </span>
              <span className="block text-[10px] text-muted">
                {perfilActual.cargo}
              </span>
            </span>
          </summary>
          <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-borde bg-superficie p-3 shadow-xl">
            <p className="mb-3 break-all px-2 text-xs text-muted">
              {perfilActual.email} · {perfilActual.rol}
            </p>
            {!perfilActual.accesoLocal && (
              <button
                onClick={() => setClave(true)}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-elevado"
              >
                <KeyRound size={15} />
                Cambiar contraseña
              </button>
            )}
            <button
              onClick={salir}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-red-700 dark:text-red-300"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        </details>
      </div>
      {clave && (
        <Dialogo
          titulo="Cambiar contraseña"
          cerrar={() => setClave(false)}
          ocupado={ocupado}
        >
          <form onSubmit={cambiarClave} className="space-y-4">
            <label className="block text-sm">
              Contraseña actual
              <input
                name="actual"
                type="password"
                autoComplete="current-password"
                required
                className="campo mt-1"
              />
            </label>
            <label className="block text-sm">
              Nueva contraseña
              <input
                name="nueva"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="campo mt-1"
              />
            </label>
            <label className="block text-sm">
              Repite la nueva contraseña
              <input
                name="confirmacion"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="campo mt-1"
              />
            </label>
            <button disabled={ocupado} className="boton-primario">
              {ocupado ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </Dialogo>
      )}
    </header>
  );
}
