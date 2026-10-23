"use client";
import { createContext, useContext, useState, type CSSProperties } from "react";
import { Toaster } from "sonner";
import type { RolPerfil } from "@/tipos/database";
import {
  alternarModo,
  nombreCookieTema,
  variablesTema,
  type ModoTema,
} from "@/lib/tema/paletas";

const TemaContext = createContext<{
  modo: ModoTema;
  alternar: () => void;
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
  // La preferencia viene de la cookie en SSR: sin destello ni diferencias al hidratar.
  const [modo, setModo] = useState(modoInicial);
  function alternar() {
    const siguiente = alternarModo(modo);
    document.cookie = `${nombreCookieTema(rol)}=${siguiente}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setModo(siguiente);
  }
  return (
    <TemaContext.Provider value={{ modo, alternar }}>
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
