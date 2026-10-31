"use client";
import { useEffect, useRef, useState } from "react";
import type { Producto } from "@/tipos/database";
export interface ResultadoCodigo {
  producto: Producto;
  lectura: { codigo: string; lote?: string; vencimiento?: string };
  advertencia?: string;
}
export function EscanerCodigo({
  alEncontrar,
  alIniciar,
  alActividad,
  alNoEncontrado,
  deshabilitado = false,
}: {
  alEncontrar: (r: ResultadoCodigo) => void;
  alIniciar?: () => void;
  alActividad?: (activo: boolean) => void;
  alNoEncontrado?: (codigo: string) => void;
  deshabilitado?: boolean;
}) {
  const [valor, setValor] = useState(""),
    [buscando, setBuscando] = useState(false),
    [mensaje, setMensaje] = useState(""),
    [tipo, setTipo] = useState<"estado" | "error">("estado"),
    [ausente, setAusente] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null),
    control = useRef<AbortController | null>(null),
    secuencia = useRef(0),
    ultimo = useRef({ codigo: "", instante: 0 });
  useEffect(
    () => () => {
      secuencia.current++;
      control.current?.abort();
    },
    [],
  );
  function limpiar() {
    secuencia.current++;
    control.current?.abort();
    ultimo.current = { codigo: "", instante: 0 };
    setValor("");
    setMensaje("");
    setAusente(null);
    setBuscando(false);
    alActividad?.(false);
    alIniciar?.();
    campo.current?.focus();
  }
  async function buscar() {
    if (deshabilitado) return;
    const codigo = valor.replace(/[\r\n]+$/g, "").trim();
    if (
      ultimo.current.codigo === codigo &&
      Date.now() - ultimo.current.instante < 700
    )
      return;
    ultimo.current = { codigo, instante: Date.now() };
    const actual = ++secuencia.current;
    control.current?.abort();
    control.current = new AbortController();
    setAusente(null);
    alIniciar?.();
    setTipo("estado");
    setMensaje("");
    if (!codigo) {
      setTipo("error");
      setMensaje("Escanea o escribe un código.");
      setBuscando(false);
      alActividad?.(false);
      return;
    }
    setBuscando(true);
    alActividad?.(true);
    try {
      const r = await fetch(
        "/api/medicamentos/codigo?codigo=" + encodeURIComponent(codigo),
        {
          cache: "no-store",
          credentials: "same-origin",
          signal: control.current.signal,
        },
      );
      const datos = await r.json();
      if (actual !== secuencia.current) return;
      if (!r.ok) {
        if (r.status === 404) setAusente(datos.lectura?.codigo ?? null);
        throw new Error(datos.error || "No se pudo buscar el medicamento.");
      }
      setMensaje(
        `Encontrado: ${datos.producto.nombre}. ${datos.advertencia ?? "Revisa los datos antes de confirmar."}`,
      );
      alEncontrar(datos);
    } catch (e) {
      if (
        actual === secuencia.current &&
        !(e instanceof Error && e.name === "AbortError")
      ) {
        setTipo("error");
        setMensaje(
          e instanceof Error ? e.message : "No se pudo realizar la búsqueda.",
        );
      }
    } finally {
      if (actual === secuencia.current) {
        setBuscando(false);
        alActividad?.(false);
      }
    }
  }
  return (
    <section
      aria-label="Lector USB de medicamentos"
      className="rounded-xl bg-acento-suave p-3 space-y-3"
    >
      <label className="block text-sm font-semibold">
        Código del lector USB o ingreso manual
        <input
          ref={campo}
          autoComplete="off"
          spellCheck={false}
          disabled={deshabilitado}
          value={valor}
          maxLength={512}
          className="campo mt-2"
          placeholder="Activa el lector y escanea; finaliza con Enter"
          onChange={(e) => {
            setValor(e.target.value);
            setMensaje("");
            setAusente(null);
            alIniciar?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              if (!e.repeat && !e.nativeEvent.isComposing) void buscar();
            }
          }}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={deshabilitado}
          className="boton-secundario"
          onClick={() => campo.current?.focus()}
        >
          Activar escaneo
        </button>
        <button
          type="button"
          disabled={deshabilitado || buscando}
          className="boton-secundario"
          onClick={() => void buscar()}
        >
          Buscar código
        </button>
        <button
          type="button"
          disabled={deshabilitado}
          className="boton-secundario"
          onClick={limpiar}
        >
          Limpiar escaneo
        </button>
      </div>
      <p className="text-xs text-muted">
        El lector debe funcionar como teclado y terminar con Enter. Escanear
        solo consulta; no registra medicamentos ni existencias.
      </p>
      {buscando && (
        <p role="status" className="text-sm">
          Buscando medicamento…
        </p>
      )}
      {mensaje && (
        <p role={tipo === "error" ? "alert" : "status"} className="text-sm">
          {mensaje}
        </p>
      )}
      {ausente && alNoEncontrado && (
        <button
          type="button"
          className="boton-secundario"
          onClick={() => alNoEncontrado(ausente)}
        >
          Registrar medicamento manualmente
        </button>
      )}
    </section>
  );
}
