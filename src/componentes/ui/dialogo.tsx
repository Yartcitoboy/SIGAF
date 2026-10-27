"use client";
import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";
export function Dialogo({
  titulo,
  children,
  cerrar,
  ocupado = false,
}: {
  titulo: string;
  children: React.ReactNode;
  cerrar: () => void;
  ocupado?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  useEffect(() => {
    const dialogo = ref.current;
    const previo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogo?.showModal();
    return () => {
      dialogo?.close();
      previo?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      onCancel={(e) => {
        e.preventDefault();
        if (!ocupado) cerrar();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-borde bg-superficie p-0 text-tinta shadow-2xl backdrop:bg-velo/60 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-borde bg-superficie p-5">
        <h2 id={tituloId} className="text-lg font-semibold">
          {titulo}
        </h2>
        <button
          aria-label="Cerrar diálogo"
          disabled={ocupado}
          onClick={cerrar}
          className="rounded-lg p-2 hover:bg-elevado"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
