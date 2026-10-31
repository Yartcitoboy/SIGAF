"use client";
import { useEffect, useState } from "react";
export function useBusquedaDiferida(texto: string) {
  const [valor, setValor] = useState(texto);
  useEffect(() => {
    const id = window.setTimeout(() => setValor(texto), 300);
    return () => window.clearTimeout(id);
  }, [texto]);
  return valor;
}
export function usePaginaListado(clave: string) {
  const [estado, setEstado] = useState({ clave, pagina: 1 });
  const pagina = estado.clave === clave ? estado.pagina : 1;
  return { pagina, cambiar: (pagina: number) => setEstado({ clave, pagina }) };
}
