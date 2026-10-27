"use client";
import { createContext, useContext, useState, type CSSProperties } from "react";
import { Toaster, toast } from "sonner";
import type { RolPerfil } from "@/tipos/database";
import { alternarModo, variablesTema, type ModoTema } from "@/lib/tema/paletas";

const TemaContext = createContext<{
  modo: ModoTema;
  alternar: () => Promise<void>;
  guardando: boolean;
} | null>(null);
export function TemaProvider({
  rol,
  modoInicial,
  children,
}: {
  rol: RolPerfil;
  modoInicial: ModoTema;
  children: React.ReactNode;
}) {
  const [modo, setModo] = useState(modoInicial);
  const [guardando, setGuardando] = useState(false);
  async function alternar() {
    if (guardando) return;
    const siguiente = alternarModo(modo);
    setGuardando(true);
    try {
      const respuesta = await fetch("/api/preferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: siguiente }),
      });
      if (!respuesta.ok)
        throw new Error("No se pudo guardar el tema en Supabase.");
      setModo(siguiente);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo guardar el tema.",
      );
    } finally {
      setGuardando(false);
    }
  }
  return (
    <TemaContext.Provider value={{ modo, alternar, guardando }}>
      <div
        data-rol={rol}
        data-modo={modo}
        className="tema-rol min-h-screen md:flex"
        style={variablesTema(rol, modo) as CSSProperties}
      >
        {children}
        <Toaster
          richColors
          position="top-right"
          theme={modo === "oscuro" ? "dark" : "light"}
          style={
            {
              "--normal-bg": "var(--superficie)",
              "--normal-text": "var(--tinta)",
              "--normal-border": "var(--borde)",
            } as CSSProperties
          }
        />
      </div>
    </TemaContext.Provider>
  );
}
export function useTema() {
  const tema = useContext(TemaContext);
  if (!tema) throw new Error("Se requiere un tema de SIGAF.");
  return tema;
}
