"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useConsulta<T>(consulta: () => Promise<T>) {
  const [estado, setEstado] = useState<{
    datos: T | null;
    cargando: boolean;
    error: string | null;
  }>({ datos: null, cargando: true, error: null });
  const secuencia = useRef(0);
  const solicitar = useCallback(() => {
    const actual = ++secuencia.current;
    return Promise.resolve()
      .then(consulta)
      .then(
        (datos) => {
          if (actual === secuencia.current)
            setEstado({ datos, cargando: false, error: null });
        },
        (e) => {
          if (actual === secuencia.current)
            setEstado({
              datos: null,
              cargando: false,
              error:
                e instanceof Error
                  ? e.message
                  : "No se pudieron cargar los datos.",
            });
        },
      );
  }, [consulta]);
  const cancelar = useCallback(() => {
    secuencia.current++;
  }, []);
  useEffect(() => {
    void solicitar();
    const actualizar = () => {
      if (document.visibilityState === "visible") void solicitar();
    };
    const intervalo = window.setInterval(actualizar, 30000);
    window.addEventListener("focus", actualizar);
    document.addEventListener("visibilitychange", actualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
      document.removeEventListener("visibilitychange", actualizar);
      cancelar();
    };
  }, [solicitar, cancelar]);
  const recargar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    await solicitar();
  }, [solicitar]);
  return { ...estado, recargar };
}
