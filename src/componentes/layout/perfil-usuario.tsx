"use client";
import { useState, type FormEvent } from "react";
import { LogOut, ChevronUp, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRol } from "@/context/rol-context";
import { createClient } from "@/lib/supabase/client";
import { Dialogo } from "@/componentes/ui/dialogo";
import { GestionEntregaAlertas } from "@/componentes/alertas/gestion-entrega";
export function PerfilUsuario() {
  const { perfilActual: p } = useRol(),
    router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [clave, setClave] = useState(false);
  const [correo, setCorreo] = useState(false);
  const perfilActual = p;
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
    setOcupado(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("No se pudo cerrar la sesión.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <>
      <div className="flex items-center gap-2 border-t border-barra-borde p-3">
        <details className="relative min-w-0 flex-1">
          <summary
            aria-label="Perfil de usuario"
            className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl p-2 hover:bg-barra-hover"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-barra-activa text-xs font-bold text-barra-activa-tinta">
              {p.iniciales}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-barra-tinta">
                {p.nombre}
              </span>
              <span className="block truncate text-[10px] text-barra-muted">
                {p.cargo}
              </span>
            </span>
            <ChevronUp size={14} className="shrink-0 text-barra-muted" />
          </summary>
          <div className="absolute bottom-full left-0 z-50 mb-2 w-[min(17rem,85vw)] rounded-xl border border-borde bg-superficie p-4 text-tinta shadow-xl">
            <p className="font-semibold">{p.nombre}</p>
            <p className="mt-1 break-all text-xs text-muted">{p.email}</p>
            <p className="mt-3 text-xs text-muted">
              {p.rol} · {p.sucursal}
            </p>
            <button
              type="button"
              onClick={() => setClave(true)}
              className="boton-secundario mt-3 w-full"
            >
              <KeyRound size={15} />
              Cambiar contraseña
            </button>
            <button
              type="button"
              onClick={() => setCorreo(true)}
              className="boton-secundario mt-2 w-full"
            >
              Correo de alertas
            </button>
          </div>
        </details>
        <button
          type="button"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          disabled={ocupado}
          onClick={salir}
          className="grid min-h-11 min-w-11 place-items-center rounded-xl text-barra-muted hover:bg-barra-hover hover:text-barra-tinta"
        >
          <LogOut size={18} />
        </button>
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
      {correo && (
        <Dialogo titulo="Correo de alertas" cerrar={() => setCorreo(false)}>
          <GestionEntregaAlertas soloPersonal />
        </Dialogo>
      )}
    </>
  );
}
