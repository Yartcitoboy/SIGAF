import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/tipos/database";
import {
  ErrorCodigo,
  interpretarCodigo,
  variantesCodigo,
  codigoNuevoValido,
  codigoCanonico,
} from "../servicios/codigo-medicamento";
export async function buscarMedicamentoCodigo(
  db: SupabaseClient<Database>,
  entrada: string,
) {
  const lectura = interpretarCodigo(entrada);
  const { data, error } = await db
    .from("producto")
    .select("*")
    .in("codigo_barras", variantesCodigo(lectura.codigo))
    .limit(3);
  if (error)
    throw new ErrorCodigo(
      "No se pudo consultar el catálogo. Intenta nuevamente.",
      503,
    );
  if (data.length > 1)
    throw new ErrorCodigo(
      "Hay varias fichas con códigos equivalentes. Administración debe revisar el catálogo.",
      409,
    );
  if (!data.length) {
    if (!codigoNuevoValido(lectura.codigo))
      throw new ErrorCodigo(
        "El dígito de control GTIN es inválido. Comprueba el envase.",
      );
    return {
      producto: null,
      lectura: { ...lectura, codigo: codigoCanonico(lectura.codigo) },
    };
  }
  return {
    producto: data[0],
    lectura,
    advertencia: codigoNuevoValido(lectura.codigo)
      ? undefined
      : "Código histórico encontrado con dígito de control inválido. Administración debe revisar el envase y la ficha.",
  };
}
export async function validarCodigoProducto(
  db: SupabaseClient<Database>,
  valor: unknown,
  id?: number,
) {
  if (valor === null || valor === "") return null;
  if (typeof valor !== "string")
    throw new ErrorCodigo("Código de producto inválido.");
  const lectura = interpretarCodigo(valor);
  if (lectura.lote || lectura.vencimiento)
    throw new ErrorCodigo(
      "Guarda solo el identificador del producto en la ficha, sin lote ni vencimiento.",
    );
  const { data, error } = await db
    .from("producto")
    .select("id_producto,codigo_barras")
    .in("codigo_barras", variantesCodigo(lectura.codigo))
    .limit(3);
  if (error)
    throw new ErrorCodigo("No se pudo verificar si el código ya existe.", 503);
  if (data.some((p) => p.id_producto !== id))
    throw new ErrorCodigo(
      "Ya existe otro medicamento con este código o un GTIN equivalente. Abre su ficha.",
      409,
    );
  if (!codigoNuevoValido(lectura.codigo)) {
    const actual = data.find(
      (p) => p.id_producto === id && p.codigo_barras === valor.trim(),
    );
    if (actual) return actual.codigo_barras;
    throw new ErrorCodigo("El dígito de control GTIN es inválido.");
  }
  return codigoCanonico(lectura.codigo);
}
