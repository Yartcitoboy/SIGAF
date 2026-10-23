import type { Inventario } from "@/tipos/database";
import { fechaChile } from "@/lib/servicios/fechas";
export function GraficoVencimientosMeses({
  inventario,
}: {
  inventario: Inventario[];
}) {
  const hoy = fechaChile();
  const meses = Array.from({ length: 6 }, (_, n) => {
    const fecha = new Date(hoy.slice(0, 7) + "-01T12:00:00Z");
    fecha.setUTCMonth(fecha.getUTCMonth() + n);
    const mes = fecha.toISOString().slice(0, 7);
    return {
      mes,
      nombre: new Intl.DateTimeFormat("es-CL", {
        month: "short",
        timeZone: "UTC",
      }).format(fecha),
      unidades: inventario
        .filter((i) => i.lote?.fecha_vencimiento.startsWith(mes))
        .reduce((a, i) => a + i.stock_actual, 0),
    };
  });
  const max = Math.max(1, ...meses.map((m) => m.unidades));
  return (
    <section className="panel">
      <h2 className="font-semibold">Próximos vencimientos</h2>
      <p className="mt-1 text-xs text-muted">
        Unidades por mes · próximos seis meses
      </p>
      <div className="mt-7 flex h-48 items-end gap-3">
        {meses.map((m) => (
          <div
            key={m.mes}
            className="flex h-full min-w-0 flex-1 flex-col justify-end text-center"
          >
            <span className="mb-2 text-xs font-medium">{m.unidades}</span>
            <div
              title={m.mes + ": " + m.unidades + " unidades"}
              className="barra-grafico mx-auto w-full max-w-12 rounded-t-lg"
              style={{
                height: (m.unidades / max) * 130 + "px",
                minHeight: m.unidades ? 4 : 0,
              }}
            />
            <span className="mt-3 text-xs text-muted">{m.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
