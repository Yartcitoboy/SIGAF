"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useConsulta<T>(
  consulta: () => Promise<T>,
  {
    conservarDatosEnError = false,
    intervaloMs = 120000,
  }: { conservarDatosEnError?: boolean; intervaloMs?: number } = {},
) {
  const [estado, setEstado] = useState<{
    datos: T | null;
    cargando: boolean;
    error: string | null;
    actualizado: string | null;
    origen: typeof consulta | null;
  }>({
    datos: null,
    cargando: true,
    error: null,
    actualizado: null,
    origen: null,
  });
  const secuencia = useRef(0);
  const enCurso = useRef<{
    consulta: typeof consulta;
    promesa: Promise<void>;
  } | null>(null);
  const ultimaConsulta = useRef(0);
  const solicitar = useCallback(
    (forzar = false) => {
      if (!forzar && enCurso.current?.consulta === consulta)
        return enCurso.current.promesa;
      const actual = ++secuencia.current;
      const promesa = Promise.resolve()
        .then(consulta)
        .then(
          (datos) => {
            if (actual === secuencia.current)
              setEstado({
                origen: consulta,
                datos,
                cargando: false,
                error: null,
                actualizado:
                  datos &&
                  typeof datos === "object" &&
                  "ahora" in datos &&
                  typeof datos.ahora === "string"
                    ? datos.ahora
                    : null,
              });
          },
          (e) => {
            if (actual === secuencia.current)
              setEstado((anterior) => ({
                origen: consulta,
                datos:
                  conservarDatosEnError && anterior.origen === consulta
                    ? anterior.datos
                    : null,
                actualizado: conservarDatosEnError
                  ? anterior.actualizado
                  : null,
                cargando: false,
                error:
                  e instanceof Error
                    ? e.message
                    : "No se pudieron cargar los datos.",
              }));
          },
        )
        .finally(() => {
          if (enCurso.current?.promesa === promesa) {
            enCurso.current = null;
            ultimaConsulta.current = Date.now();
          }
        });
      enCurso.current = { consulta, promesa };
      return promesa;
    },
    [consulta, conservarDatosEnError],
  );
  const cancelar = useCallback(() => {
    secuencia.current++;
    enCurso.current = null;
  }, []);
  useEffect(() => {
    void solicitar();
    const actualizar = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - ultimaConsulta.current >= 15000
      )
        void solicitar();
    };
    const intervalo =
      intervaloMs > 0 ? window.setInterval(actualizar, intervaloMs) : undefined;
    window.addEventListener("focus", actualizar);
    document.addEventListener("visibilitychange", actualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
      document.removeEventListener("visibilitychange", actualizar);
      cancelar();
    };
  }, [solicitar, cancelar, intervaloMs]);
  const recargar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    await solicitar(true);
  }, [solicitar]);
  const actualizarDatos = useCallback((actualizar: (datos: T) => T) => {
    secuencia.current++;
    enCurso.current = null;
    setEstado((anterior) =>
      anterior.datos === null
        ? anterior
        : { ...anterior, datos: actualizar(anterior.datos) },
    );
  }, []);
  return {
    ...estado,
    datos: estado.origen === consulta ? estado.datos : null,
    error: estado.origen === consulta ? estado.error : null,
    cargando: estado.cargando || estado.origen !== consulta,
    recargar,
    actualizarDatos,
  };
}
