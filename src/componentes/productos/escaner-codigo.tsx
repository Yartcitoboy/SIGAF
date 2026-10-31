"use client";
import { useEffect, useRef, useState } from "react";
import { ControlLecturas } from "@/lib/servicios/control-lecturas";
import {
  consultarCodigoMedicamento,
  type ResultadoCodigo,
  type LecturaCodigo,
} from "@/lib/servicios/lector-usb";
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
  alNoEncontrado?: (codigo: string, lectura?: LecturaCodigo) => void;
  deshabilitado?: boolean;
}) {
  const [valor, setValor] = useState(""),
    [buscando, setBuscando] = useState(false),
    [mensaje, setMensaje] = useState(""),
    [tipo, setTipo] = useState<"estado" | "error">("estado"),
    [ausente, setAusente] = useState<string | null>(null);
  const [lecturaAusente, setLecturaAusente] = useState<
    LecturaCodigo | undefined
  >();
  const campo = useRef<HTMLInputElement>(null),
    control = useRef<AbortController | null>(null),
    lecturas = useRef(new ControlLecturas());
  useEffect(
    () => () => {
      lecturas.current.cancelar();
      control.current?.abort();
    },
    [],
  );
  function limpiar() {
    lecturas.current.cancelar();
    control.current?.abort();
    setValor("");
    setMensaje("");
    setAusente(null);
    setLecturaAusente(undefined);
    setBuscando(false);
    alActividad?.(false);
    alIniciar?.();
    campo.current?.focus();
  }
  async function buscar() {
    if (deshabilitado) return;
    const codigo = valor.replace(/[\r\n]+$/g, "").trim();
    const actual = lecturas.current.iniciar(codigo);
    if (actual === null) return;
    control.current?.abort();
    control.current = new AbortController();
    setAusente(null);
    alIniciar?.();
    setTipo("estado");
    setMensaje("");
    if (!codigo) {
      lecturas.current.terminar(actual);
      setTipo("error");
      setMensaje("Escanea o escribe un código.");
      setBuscando(false);
      alActividad?.(false);
      return;
    }
    setBuscando(true);
    campo.current?.select();
    alActividad?.(true);
    try {
      const r = await consultarCodigoMedicamento(
        codigo,
        control.current.signal,
      );
      const { datos } = r;
      if (!lecturas.current.vigente(actual)) return;
      if (!r.ok) {
        if (r.estado === 404) {
          setAusente(datos.lectura?.codigo ?? null);
          setLecturaAusente(datos.lectura);
        }
        throw new Error(datos.error || "No se pudo buscar el medicamento.");
      }
      if (!datos.producto || !datos.lectura)
        throw new Error("La respuesta del catálogo está incompleta.");
      setMensaje(
        `Encontrado: ${datos.producto.nombre}. ${datos.advertencia ?? "Revisa los datos antes de confirmar."}`,
      );
      alEncontrar({
        producto: datos.producto,
        lectura: datos.lectura,
        advertencia: datos.advertencia,
      });
    } catch (e) {
      if (
        lecturas.current.vigente(actual) &&
        !(e instanceof Error && e.name === "AbortError")
      ) {
        setTipo("error");
        setMensaje(
          e instanceof Error ? e.message : "No se pudo realizar la búsqueda.",
        );
      }
    } finally {
      if (lecturas.current.vigente(actual)) {
        lecturas.current.terminar(actual);
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
            if (e.target.value === valor) return;
            lecturas.current.cancelar();
            control.current?.abort();
            setBuscando(false);
            alActividad?.(false);
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
          onClick={() => {
            campo.current?.focus();
            campo.current?.select();
          }}
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
          onClick={() => alNoEncontrado(ausente, lecturaAusente)}
        >
          Registrar medicamento manualmente
        </button>
      )}
    </section>
  );
}
