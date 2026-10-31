import { z } from "zod";
import { diaMovimiento, coincide } from "./presentacion";

const celda = z.union([z.string().max(10000), z.number().finite()]);
export const archivoReporteSchema = z
  .object({
    version: z.literal(1),
    autor: z.string().max(500).optional(),
    farmacia: z
      .object({
        id_farmacia: z.number().int().positive(),
        razon_social: z.string(),
        rut: z.string(),
        direccion: z.string().nullable(),
        logo_url: z.string().nullish(),
        director_tecnico: z.string().nullish(),
      })
      .strict(),
    tablas: z
      .array(
        z
          .object({
            titulo: z.string(),
            columnas: z.array(z.string()).min(1).max(30),
            filas: z.array(z.array(celda).max(30)).max(50000),
          })
          .strict(),
      )
      .min(1)
      .max(3),
    filtros: z.string().max(4000),
    ubicacion: z.string().max(1000),
    nombre: z.string().regex(/^[\w-]+$/),
    emitido: z.iso.datetime({ offset: true }),
  })
  .strict()
  .superRefine((a, ctx) => {
    if (
      a.tablas.some((t) => t.filas.some((f) => f.length !== t.columnas.length))
    )
      ctx.addIssue({
        code: "custom",
        message: "Las columnas no corresponden al contenido.",
      });
    if (JSON.stringify(a).length > 5_000_000)
      ctx.addIssue({
        code: "custom",
        message: "El informe supera el tamaño permitido.",
      });
  });
export type ArchivoReporte = z.infer<typeof archivoReporteSchema>;
export function leerArchivoReporte(valor: unknown): ArchivoReporte | null {
  const r = archivoReporteSchema.safeParse(valor);
  return r.success ? r.data : null;
}
export function periodoReporte(
  hoy: string,
  periodo: "mes" | "trimestre" | "todo",
) {
  if (periodo === "todo") return { desde: "", hasta: "" };
  const [ano, mes] = hoy.split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, mes - (periodo === "mes" ? 1 : 3), 1));
  return { desde: inicio.toISOString().slice(0, 10), hasta: hoy };
}
export function filtrarEmisiones<
  T extends {
    id_reporte: number;
    tipo: string | null;
    formato: string | null;
    responsable: string;
    fecha_generacion: string;
    contenido?: unknown;
    archivo_emitido?: string | null;
    archivo_filtros?: string | null;
    archivo_farmacia?: string | null;
    archivo_nombre?: string | null;
  },
>(
  filas: T[],
  filtro: {
    texto: string;
    tipo: string;
    formato: string;
    desde: string;
    hasta: string;
  },
) {
  if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) return [];
  return filas.filter((r) => {
    const archivo = leerArchivoReporte(r.contenido);
    const dia = diaMovimiento(
      archivo?.emitido ?? r.archivo_emitido ?? r.fecha_generacion,
    );
    return (
      coincide(
        filtro.texto,
        String(r.id_reporte),
        r.tipo,
        r.formato,
        r.responsable,
        archivo?.farmacia.razon_social,
        archivo?.filtros,
        r.archivo_filtros,
        r.archivo_farmacia,
      ) &&
      (!filtro.tipo ||
        r.tipo === filtro.tipo ||
        archivo?.tablas.length === 3 ||
        r.archivo_nombre?.startsWith("SIGAF-completo-")) &&
      (!filtro.formato || r.formato === filtro.formato) &&
      (!filtro.desde || dia >= filtro.desde) &&
      (!filtro.hasta || dia <= filtro.hasta)
    );
  });
}
export function resumenTablaReporte(tabla: ArchivoReporte["tablas"][number]) {
  const cantidad = tabla.columnas.findIndex(
    (c) => c === "Stock físico" || c === "Stock" || c === "Cantidad",
  );
  const costo = tabla.columnas.indexOf("Costo unit. CLP");
  let conCosto = 0;
  let unidades = 0,
    valor = 0,
    sinCosto = 0;
  for (const fila of tabla.filas) {
    const n =
      typeof fila[cantidad] === "number" ? (fila[cantidad] as number) : 0;
    unidades += n;
    if (costo < 0 || typeof fila[costo] !== "number") {
      if (n > 0) sinCosto++;
    } else {
      valor += n * (fila[costo] as number);
      conCosto++;
    }
  }
  return {
    registros: tabla.filas.length,
    unidades,
    valor: costo < 0 || (sinCosto > 0 && conCosto === 0) ? null : valor,
    sinCosto,
  };
}
