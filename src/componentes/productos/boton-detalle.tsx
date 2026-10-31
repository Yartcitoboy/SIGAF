"use client";
import { ChevronRight } from "lucide-react";
export function BotonDetalle({
  nombre,
  abrir,
  children,
}: {
  nombre: string;
  abrir: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`Ver detalle de ${nombre}`}
      aria-haspopup="dialog"
      onClick={abrir}
      className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-left font-medium transition hover:text-acento"
    >
      <span>{children}</span>
      <ChevronRight
        aria-hidden="true"
        size={16}
        className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-acento"
      />
    </button>
  );
}
