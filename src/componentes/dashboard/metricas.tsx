import type { DatosOperacion } from "@/lib/servicios/operacion";
export const clp = (valor: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
export function Metrica({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <article className="panel metrica">
      <p className="text-xs font-medium text-muted">{titulo}</p>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{valor}</p>
      {detalle && <p className="mt-2 text-xs text-muted">{detalle}</p>}
    </article>
  );
}
export function sumarValor(datos: DatosOperacion["inventario"]) {
  return datos.reduce(
    (a, i) => a + i.stock_actual * (i.lote?.costo_unitario ?? 0),
    0,
  );
}
