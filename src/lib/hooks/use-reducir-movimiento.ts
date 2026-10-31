"use client";
import { useSyncExternalStore } from "react";
const consulta = "(prefers-reduced-motion: reduce)";
function suscribir(callback: () => void) {
  const media = window.matchMedia(consulta);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const snapshot = () => window.matchMedia(consulta).matches;
const servidor = () => true;
export function useReducirMovimiento() {
  return useSyncExternalStore(suscribir, snapshot, servidor);
}
