"use client";
import { useState, type FormEvent } from "react";
import { Pill, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginFormulario() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const configurado = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOcupado(true);
    setError(null);
    try {
      const form = new FormData(e.currentTarget),
        db = createClient();
      const { error } = await db.auth.signInWithPassword({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      });
      if (error)
        throw new Error(
          "No fue posible iniciar sesión. Revisa tu correo y contraseña.",
        );
      const respuesta = await fetch("/api/sesion", { cache: "no-store" });
      if (!respuesta.ok) {
        await db.auth.signOut();
        throw new Error(
          "Tu cuenta está inactiva o no tiene un perfil SIGAF. Contacta a administración.",
        );
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-900 lg:grid-cols-2 dark:bg-slate-950 dark:text-white">
      <section className="hidden flex-col justify-between bg-slate-900 p-14 text-white lg:flex">
        <div className="flex items-center gap-3 text-xl font-bold">
          <Pill className="text-teal-400" />
          SIGAF
        </div>
        <div>
          <p className="mb-5 text-sm uppercase tracking-[.25em] text-teal-400">
            Gestión farmacéutica
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            Cada lote cuenta.
            <br />
            Cada día también.
          </h1>
          <p className="mt-6 max-w-md text-slate-400">
            Inventario trazable, vencimientos bajo control y dispensación guiada
            por FEFO.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Sistema Inteligente de Gestión y Alerta de Caducidad
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Pill className="mb-8 h-10 w-10 text-teal-600" />
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            Acceso a tu farmacia
          </p>
          <h2 className="mt-3 text-3xl font-bold">Bienvenido a SIGAF</h2>
          <p className="mb-8 mt-3 text-sm text-slate-500">
            Ingresa con tu cuenta institucional.
          </p>
          {!configurado && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"
            >
              Falta configurar la conexión de Supabase del proyecto.
            </p>
          )}
          <form onSubmit={entrar} className="space-y-5">
            <label className="block text-sm font-medium">
              Correo electrónico
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                className="campo mt-2"
                disabled={ocupado}
              />
            </label>
            <label className="block text-sm font-medium">
              Contraseña
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="campo mt-2"
                disabled={ocupado}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              disabled={ocupado || !configurado}
              className="boton-primario w-full justify-center"
            >
              {ocupado ? "Verificando cuenta…" : "Iniciar sesión"}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} />
            Acceso según tu rol y sucursal asignada.
          </p>
        </div>
      </section>
    </main>
  );
}
