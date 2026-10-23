"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export function PanelLateral({
  titulo,
  cerrar,
  children,
}: {
  titulo: string;
  cerrar: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialogo = ref.current;
    const anterior = document.body.style.overflow;
    const focoAnterior = document.activeElement;
    dialogo?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialogo?.close();
      document.body.style.overflow = anterior;
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected)
        focoAnterior.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-modal="true"
      aria-labelledby={id}
      className="panel-lateral bg-superficie text-tinta shadow-2xl backdrop:bg-velo/40 backdrop:backdrop-blur-[2px]"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          cerrar();
      }}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-separador px-6 py-6 sm:px-8">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.24em] text-acento">
              Detalle
            </p>
            <h2 id={id} className="text-2xl font-semibold tracking-tight">
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            autoFocus
            onClick={cerrar}
            aria-label="Cerrar detalle del producto"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-elevado hover:text-tinta"
          >
            <X size={21} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-7 sm:px-8">
          {children}
        </div>
      </div>
    </dialog>
  );
}
