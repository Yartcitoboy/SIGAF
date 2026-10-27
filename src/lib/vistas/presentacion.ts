import type { Bodega, Inventario } from "@/tipos/database";
import type { DatosOperacion } from "@/lib/servicios/operacion";

// Proyecciones de pantalla sobre datos ya consultados. No autorizan ni escriben.
export function normalizarBusqueda(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
export function coincide(
  texto: string,
  ...valores: (string | null | undefined)[]
) {
  const busqueda = normalizarBusqueda(texto);
  return (
    !busqueda ||
    valores.some((v) => normalizarBusqueda(v ?? "").includes(busqueda))
  );
}
export function tipoUbicacion(bodega?: Bodega) {
  return typeof bodega?.es_sala_ventas !== "boolean"
    ? "Clasificación pendiente"
    : bodega.es_sala_ventas
      ? "Sala de ventas"
      : "Bodega";
}
export function fechaVisible(valor?: string | null) {
  if (!valor) return "Sin fecha";
  const partes = valor.slice(0, 10).split("-");
  return partes.length === 3 ? partes.reverse().join("/") : valor;
}
export function fechaHoraVisible(valor: string) {
  // No inventar zona para TIMESTAMP históricos que no la especifican.
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(valor))
    return `${fechaVisible(valor)} ${valor.replace("T", " ").slice(11, 16)} · hora de origen`;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Santiago",
      }).format(fecha) + " · Chile";
}
export function diaMovimiento(valor: string) {
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(valor)) return valor.slice(0, 10);
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  return ["year", "month", "day"]
    .map((tipo) => p.find((v) => v.type === tipo)?.value)
    .join("-");
}
export function resumirStock(filas: Inventario[], hoy: string, holgura = 0) {
  const limite = Date.parse(hoy) + holgura * 86400000;
  return filas.reduce(
    (r, i) => {
      r.fisico += i.stock_actual;
      const fecha = i.lote?.fecha_vencimiento;
      if (!fecha || !Number.isFinite(Date.parse(fecha)))
        r.sinFecha += i.stock_actual;
      else if (Date.parse(fecha) <= limite) r.bloqueado += i.stock_actual;
      else r.aptoPorFecha += i.stock_actual;
      return r;
    },
    { fisico: 0, aptoPorFecha: 0, bloqueado: 0, sinFecha: 0 },
  );
}
export function valoracionVisible(
  filas: { cantidad: number; costo?: number | null }[],
) {
  const sinCosto = filas.filter(
    (f) => f.cantidad > 0 && f.costo == null,
  ).length;
  const conCosto = filas.filter((f) => f.cantidad > 0 && f.costo != null);
  return {
    valor:
      sinCosto && !conCosto.length
        ? null
        : conCosto.reduce((s, f) => s + f.cantidad * f.costo!, 0),
    sinCosto,
  };
}
export function unidadesFuturasDelMes(
  filas: Inventario[],
  mes: string,
  hoy: string,
) {
  return filas
    .filter(
      (i) =>
        i.stock_actual > 0 &&
        i.lote?.fecha_vencimiento.startsWith(mes) &&
        i.lote.fecha_vencimiento > hoy,
    )
    .reduce((s, i) => s + i.stock_actual, 0);
}
export function filtrarSucursal(
  datos: DatosOperacion,
  sucursal: string,
): DatosOperacion {
  if (!sucursal) return datos;
  const bodegas = datos.bodegas.filter(
    (b) => String(b.id_sucursal) === sucursal,
  );
  const ids = new Set(bodegas.map((b) => b.id_bodega));
  const inventario = datos.inventario.filter((i) => ids.has(i.id_bodega));
  const existencias = new Set(inventario.map((i) => i.id_inventario));
  const lotes = new Set(inventario.map((i) => i.id_lote));
  return {
    ...datos,
    bodegas,
    inventario,
    lotes: datos.lotes.filter((l) => lotes.has(l.id_lote)),
    movimientos: datos.movimientos.filter(
      (m) =>
        existencias.has(m.id_inventario) ||
        (m.id_bodega_destino != null && ids.has(m.id_bodega_destino)),
    ),
    mermas: datos.mermas.filter((m) => existencias.has(m.id_inventario)),
  };
}
export function gtinValido(codigo: string) {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(codigo)) return false;
  const numeros = [...codigo].reverse().map(Number);
  return numeros.reduce((s, n, i) => s + n * (i % 2 ? 3 : 1), 0) % 10 === 0;
}
export function rutValido(rut: string) {
  const limpio = rut.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  const suma = [...limpio.slice(0, -1)]
    .reverse()
    .reduce((s, n, i) => s + Number(n) * (2 + (i % 6)), 0);
  const resto = 11 - (suma % 11);
  return (
    limpio.at(-1) === (resto === 11 ? "0" : resto === 10 ? "K" : String(resto))
  );
}
