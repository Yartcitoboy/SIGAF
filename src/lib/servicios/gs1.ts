import { fechaValida } from "./fechas";
export interface EscaneoGS1 {
  gtin?: string;
  lote?: string;
  vencimiento?: string;
}
function fechaGS1(valor: string) {
  const fecha =
    "20" +
    valor.slice(0, 2) +
    "-" +
    valor.slice(2, 4) +
    "-" +
    valor.slice(4, 6);
  // En productos sanitarios el día debe estar especificado (GS1, desde 2025).
  if (!fechaValida(fecha))
    throw new Error(
      "Fecha GS1 inválida o día no especificado. Revisa el envase.",
    );
  return fecha;
}
export function leerGS1(entrada: string): EscaneoGS1 {
  const valor = entrada.trim().replace(/^\](d2|C1|Q3)/, "");
  const resultado: EscaneoGS1 = {};
  const asignar = (ai: string, dato: string) => {
    if (ai === "01") {
      if (!/^\d{14}$/.test(dato)) throw new Error("GTIN GS1 inválido.");
      const suma = dato
        .slice(0, 13)
        .split("")
        .reduce(
          (total, digito, i) => total + Number(digito) * (i % 2 === 0 ? 3 : 1),
          0,
        );
      if ((suma + Number(dato[13])) % 10 !== 0)
        throw new Error(
          "El dígito de control GTIN no coincide. Revisa el código del envase.",
        );
      resultado.gtin = dato;
    } else if (ai === "17") {
      if (!/^\d{6}$/.test(dato)) throw new Error("Fecha GS1 incompleta.");
      resultado.vencimiento = fechaGS1(dato);
    } else if (ai === "10") {
      if (!dato || dato.length > 20)
        throw new Error("Número de lote GS1 inválido.");
      resultado.lote = dato;
    }
  };
  if (valor.includes("(")) {
    const partes = [...valor.matchAll(/\((\d{2,4})\)([^()]*)/g)];
    if (partes.length === 0) throw new Error("Código GS1 no reconocido.");
    for (const p of partes) asignar(p[1], p[2]);
  } else {
    let resto = valor;
    while (resto) {
      if (resto.startsWith("\u001d")) {
        resto = resto.slice(1);
        continue;
      }
      const ai = resto.slice(0, 2);
      resto = resto.slice(2);
      if (ai === "01" || ai === "17") {
        const largo = ai === "01" ? 14 : 6;
        asignar(ai, resto.slice(0, largo));
        resto = resto.slice(largo);
      } else if (ai === "10" || ai === "21") {
        const corte = resto.indexOf("\u001d");
        const dato = corte < 0 ? resto : resto.slice(0, corte);
        asignar(ai, dato);
        resto = corte < 0 ? "" : resto.slice(corte + 1);
      } else
        throw new Error(
          "Identificador GS1 no admitido: " +
            ai +
            ". Ingresa los datos del envase.",
        );
    }
  }
  if (!resultado.gtin && !resultado.lote && !resultado.vencimiento)
    throw new Error("No se encontraron datos de recepción GS1.");
  return resultado;
}
