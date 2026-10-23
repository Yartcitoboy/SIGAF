import type { Configuracion, EstadoSemaforo } from "@/tipos/database";
import { diasHasta } from "./fechas";
export const UMBRALES_INICIALES: Configuracion = {
  id: 1,
  dias_critico: 45,
  dias_preventivo: 90,
  holgura_dias: 0,
};
export function calcularSemaforoLote(
  fecha: string,
  config = UMBRALES_INICIALES,
  hoy?: string,
): { diasRestantes: number; estado: EstadoSemaforo } {
  const diasRestantes = diasHasta(fecha, hoy);
  const estado =
    diasRestantes <= 0
      ? "VENCIDO"
      : diasRestantes <= config.dias_critico
        ? "NARANJO"
        : diasRestantes <= config.dias_preventivo
          ? "AMARILLO"
          : "VERDE";
  return { diasRestantes, estado };
}
