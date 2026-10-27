import { z } from "zod";
export const contextoSistemaSchema = z.object({
  hoy: z.iso.date(),
  ahora: z.iso.datetime({ offset: true }),
  tema: z.enum(["claro", "oscuro"]),
  opciones: z.array(
    z.object({
      tipo: z.enum(["presentacion", "vida_util", "cantidad"]),
      valor: z.string(),
      etiqueta: z.string(),
    }),
  ),
});
export type ContextoSistema = z.infer<typeof contextoSistemaSchema>;
