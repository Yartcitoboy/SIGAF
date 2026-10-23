"use client";
import { Moon, Sun } from "lucide-react";
import { useTema } from "@/context/tema-context";

export function BotonTema() {
  const { modo, alternar } = useTema();
  const oscuro = modo === "oscuro";
  const etiqueta = oscuro ? "Activar modo claro" : "Activar modo oscuro";
  const Icono = oscuro ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={oscuro}
      className="boton-secundario min-w-11 justify-center px-3"
    >
      <Icono size={18} aria-hidden="true" />
      <span className="hidden text-xs sm:inline">
        {oscuro ? "Modo claro" : "Modo oscuro"}
      </span>
    </button>
  );
}
