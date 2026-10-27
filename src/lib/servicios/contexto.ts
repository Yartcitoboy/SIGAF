import { solicitarDatos } from "./datos";
import { contextoSistemaSchema } from "../datos/contexto";
export async function obtenerContextoSistema() {
  return contextoSistemaSchema.parse(
    await solicitarDatos({ accion: "contexto" }),
  );
}
