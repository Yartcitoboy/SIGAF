"use client";
import { useState, type FormEvent } from "react";
import { Pill, ArrowRight, ShieldCheck, Package, Check } from "lucide-react";
import { CUENTAS_LOCALES } from "@/lib/auth/cuentas-locales";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export function LoginFormulario({ accesoLocal }: { accesoLocal: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOcupado(true);
    setError(null);
    try {
      if (
        accesoLocal &&
        CUENTAS_LOCALES.some((c) => c.email === email.trim().toLowerCase())
      ) {
        if (configurado) {
          const db = createClient();
          const {
            data: { session },
          } = await db.auth.getSession();
          if (session) {
            const { error } = await db.auth.signOut({ scope: "local" });
            if (error)
              throw new Error(
                "Cierra la sesión institucional antes de usar un acceso local.",
              );
          }
        }
        const respuesta = await fetch("/api/acceso-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!respuesta.ok) {
          const datos = await respuesta.json();
          throw new Error(datos.error || "No se pudo iniciar sesión local.");
        }
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      await fetch("/api/acceso-local", { method: "DELETE" });
      const db = createClient();
      const { error } = await db.auth.signInWithPassword({
        email: email.trim(),
        password: password,
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
      setError(e instanceof Error ? e.message : "Error al iniciar sesión.");
    } finally {
      setOcupado(false);
    }
  }
  const configurado = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="hidden lg:flex flex-col justify-between bg-slate-900 p-14 text-white">
        <div className="flex items-center gap-3 text-xl font-bold">
          <Pill className="text-teal-400" /> SIGAF
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
          <p className="mt-3 mb-8 text-sm text-slate-500">
            {accesoLocal
              ? "Elige un perfil temporal o usa tu cuenta institucional."
              : "Ingresa con tu cuenta institucional."}
          </p>
          {accesoLocal && (
            <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-900 dark:bg-teal-950/25">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                  Acceso rápido temporal
                </h3>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-teal-700 dark:bg-teal-900 dark:text-teal-200">
                  LOCAL
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CUENTAS_LOCALES.map((cuenta) => {
                  const seleccionado = email === cuenta.email;
                  const Icono =
                    cuenta.rol === "ADMIN"
                      ? ShieldCheck
                      : cuenta.rol === "BODEGUERO"
                        ? Package
                        : Pill;
                  return (
                    <button
                      key={cuenta.rol}
                      type="button"
                      disabled={ocupado}
                      aria-pressed={seleccionado}
                      onClick={() => {
                        setEmail(cuenta.email);
                        setPassword(cuenta.password);
                        setError(null);
                      }}
                      className={
                        "relative flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition motion-safe:hover:-translate-y-0.5 disabled:opacity-50 " +
                        (seleccionado
                          ? "border-teal-500 bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")
                      }
                    >
                      <Icono size={20} />
                      <span className="text-xs font-semibold">
                        {cuenta.etiqueta}
                      </span>
                      <span
                        className={
                          "text-[9px] " +
                          (seleccionado ? "text-teal-100" : "text-slate-500")
                        }
                      >
                        {cuenta.descripcion}
                      </span>
                      {seleccionado && (
                        <Check
                          size={12}
                          className="absolute right-1.5 top-1.5"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-teal-700 dark:text-teal-400">
                Selecciona una tarjeta para completar tus datos y pulsa Iniciar
                sesión. Las tarjetas consultan los datos existentes de Supabase
                en modo de solo lectura.
              </p>
            </div>
          )}
          {!configurado && !accesoLocal && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"
            >
              Conexión pendiente: configura las variables de Supabase del
              proyecto.
            </p>
          )}
          <form onSubmit={entrar} className="space-y-5">
            <label className="block text-sm font-medium">
              Correo electrónico
              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="username"
                required
                className="campo mt-2"
              />
            </label>
            <label className="block text-sm font-medium">
              Contraseña
              <input
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="campo mt-2"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              disabled={ocupado || (!configurado && !accesoLocal)}
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
