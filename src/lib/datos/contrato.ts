import { z } from "zod";

// Identificadores cerrados: nunca se acepta SQL ni nombres de columnas del navegador.
export const TABLAS = {
  inventario: "id_inventario",
  lote: "id_lote",
  producto: "id_producto",
  bodega: "id_bodega",
  movimiento_inventario: "id_movimiento",
  merma: "id_merma",
  sucursal: "id_sucursal",
  farmacia: "id_farmacia",
  configuracion: "id",
  categoria: "id_categoria",
  perfil: "id_perfil",
  usuario: "id_usuario",
  notificacion: "id_notificacion",
  reporte: "id_reporte",
} as const;
export type TablaDatos = keyof typeof TABLAS;
export const COLUMNAS_USUARIO =
  "id_usuario,nombre,email,id_perfil,id_sucursal,activo";
const tabla = z.enum(Object.keys(TABLAS) as [TablaDatos, ...TablaDatos[]]);
const escalar = z.union([
  z.string().max(5000),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);
export const comandoDatos = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("contexto") }).strict(),
  z.object({ accion: z.literal("leer"), tabla }).strict(),
  z
    .object({
      accion: z.literal("guardar"),
      tabla: z.enum([
        "producto",
        "configuracion",
        "farmacia",
        "sucursal",
        "bodega",
        "notificacion",
        "reporte",
      ]),
      id: z.number().int().positive().optional(),
      campos: z.record(z.string(), escalar),
    })
    .strict(),
  z
    .object({
      accion: z.literal("recibir"),
      datos: z
        .object({
          id_producto: z.number().int().positive(),
          numero_lote: z.string().trim().min(1).max(50),
          fecha_vencimiento: z.iso.date(),
          fecha_ingreso: z.iso.date(),
          fecha_fabricacion: z.iso.date().optional(),
          id_bodega: z.number().int().positive(),
          stock_inicial: z.number().int().positive(),
          costo_unitario: z.number().nonnegative(),
          operacion: z.uuid(),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      accion: z.literal("operar"),
      datos: z
        .object({
          inventario: z.number().int().positive(),
          cantidad: z.number().int().positive(),
          tipo: z.enum(["SALIDA", "MERMA", "TRASLADO"]),
          motivo: z.string().max(150).optional(),
          destino: z.number().int().positive().optional(),
          operacion: z.uuid(),
        })
        .strict(),
    })
    .strict(),
]);
export type ComandoDatos = z.infer<typeof comandoDatos>;
const CAMPOS: Record<
  Extract<ComandoDatos, { accion: "guardar" }>["tabla"],
  readonly string[]
> = {
  producto: [
    "nombre",
    "descripcion",
    "codigo_barras",
    "unidad_medida",
    "id_categoria",
    "principio_activo",
    "registro_isp",
    "vida_util_meses",
  ],
  configuracion: ["dias_critico", "dias_preventivo", "holgura_dias"],
  farmacia: [
    "razon_social",
    "rut",
    "direccion",
    "logo_url",
    "director_tecnico",
  ],
  sucursal: ["nombre", "direccion", "id_farmacia"],
  bodega: ["nombre", "ubicacion", "id_sucursal", "es_sala_ventas"],
  notificacion: ["estado"],
  reporte: ["tipo", "formato"],
};
export function validarCampos(
  comando: Extract<ComandoDatos, { accion: "guardar" }>,
) {
  const claves = Object.keys(comando.campos);
  if (!claves.length || claves.some((c) => !CAMPOS[comando.tabla].includes(c)))
    throw new Error("Campos de escritura no permitidos.");
  if (
    comando.tabla === "notificacion" &&
    (!comando.id || comando.campos.estado !== "LEIDO")
  )
    throw new Error("Solo se permite marcar una alerta como leída.");
  if (comando.tabla === "configuracion" && comando.id !== 1)
    throw new Error("Configuración inválida.");
  if (comando.tabla === "reporte" && comando.id)
    throw new Error("El registro de emisión no se puede modificar.");
}
