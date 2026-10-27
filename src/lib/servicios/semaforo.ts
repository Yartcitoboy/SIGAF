import type { Configuracion, EstadoSemaforo } from "@/tipos/database";
import { diasHasta } from "./fechas";
export function calcularSemaforoLote(
  fecha: string,
  config: Configuracion,
  hoy: string,
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
