import { guardarFila } from "./datos";
import type { Configuracion, Farmacia } from "@/tipos/database";
export async function guardarConfiguracion(config: Configuracion) {
  if (
    !Number.isInteger(config.dias_critico) ||
    config.dias_critico <= 0 ||
    !Number.isInteger(config.dias_preventivo) ||
    config.dias_preventivo <= config.dias_critico ||
    !Number.isInteger(config.holgura_dias) ||
    config.holgura_dias < 0
  )
    throw new Error(
      "Los umbrales deben ser enteros positivos y el preventivo mayor al crítico.",
    );
  const { dias_critico, dias_preventivo, holgura_dias } = config;
  await guardarFila(
    "configuracion",
    { dias_critico, dias_preventivo, holgura_dias },
    1,
  );
}
export async function guardarFarmacia(datos: Farmacia) {
  const { id_farmacia, ...campos } = datos;
  await guardarFila("farmacia", campos, id_farmacia || undefined);
}
