import { leerGS1 } from "./gs1";
import { gtinValido } from "../vistas/presentacion";
export class ErrorCodigo extends Error {
  estado: number;
  constructor(mensaje: string, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}
export function interpretarCodigo(entrada: string) {
  if (entrada.length > 512)
    throw new ErrorCodigo("El código es demasiado largo.");
  const valor = entrada
    .replace(/[\r\n]+$/g, "")
    .trim()
    .replace(/^\](?:E0|C0|d2|C1|Q3|Q1)/, "");
  if (!valor) throw new ErrorCodigo("Escanea o escribe un código.");
  if (valor.startsWith("(01)") || /^01\d{14}/.test(valor)) {
    try {
      const datos = leerGS1(valor);
      if (!datos.gtin) throw new Error("El GS1 no identifica un producto.");
      return {
        codigo: datos.gtin,
        lote: datos.lote,
        vencimiento: datos.vencimiento,
      };
    } catch (e) {
      throw new ErrorCodigo(e instanceof Error ? e.message : "GS1 inválido.");
    }
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,49}$/.test(valor))
    throw new ErrorCodigo(
      "Código no admitido. Usa el código del producto; no enlaces web ni texto libre.",
    );
  if (/^\d+$/.test(valor) && ![8, 12, 13, 14].includes(valor.length))
    throw new ErrorCodigo(
      "La longitud del GTIN debe ser 8, 12, 13 o 14 dígitos.",
    );
  return { codigo: valor, lote: undefined, vencimiento: undefined };
}
export function variantesCodigo(codigo: string) {
  if (!/^\d+$/.test(codigo)) return [codigo];
  const base = codigo.padStart(14, "0");
  return [
    ...new Set([
      codigo,
      base,
      ...[8, 12, 13]
        .filter((n) => /^0*$/.test(base.slice(0, 14 - n)))
        .map((n) => base.slice(-n)),
    ]),
  ];
}
export function codigoNuevoValido(codigo: string) {
  return !/^\d+$/.test(codigo) || gtinValido(codigo);
}
export function codigoCanonico(codigo: string) {
  return /^\d+$/.test(codigo) ? codigo.padStart(14, "0") : codigo;
}
