import type { Inventario } from "@/tipos/database";
export function GraficoDistribucionSemaforo({
  inventario,
}: {
  inventario: Inventario[];
}) {
  const estados = [
    { estado: "VERDE", nombre: "Vigente", color: "bg-emerald-500" },
    { estado: "AMARILLO", nombre: "Preventivo", color: "bg-amber-400" },
    { estado: "NARANJO", nombre: "Crítico", color: "bg-orange-500" },
    { estado: "VENCIDO", nombre: "Caducado", color: "bg-red-600" },
  ];
  const total = inventario.reduce((a, i) => a + i.stock_actual, 0);
  return (
    <section className="panel">
      <h2 className="font-semibold">Distribución del inventario</h2>
      <p className="mt-1 text-xs text-muted">
        Unidades físicas según riesgo de vencimiento
      </p>
      <div
        className="my-6 flex h-5 overflow-hidden rounded-full bg-elevado"
        role="img"
        aria-label="Distribución de unidades por semáforo"
      >
        {estados.map((e) => {
          const unidades = inventario
            .filter((i) => i.estado_semaforo === e.estado)
            .reduce((a, i) => a + i.stock_actual, 0);
          return (
            <div
              key={e.estado}
              title={e.nombre + ": " + unidades}
              className={e.color}
              style={{ width: (total ? (unidades / total) * 100 : 0) + "%" }}
            />
          );
        })}
      </div>
      <div className="space-y-4">
        {estados.map((e) => {
          const unidades = inventario
            .filter((i) => i.estado_semaforo === e.estado)
            .reduce((a, i) => a + i.stock_actual, 0);
          return (
            <div key={e.estado} className="flex items-center gap-2 text-sm">
              <span className={"h-2.5 w-2.5 rounded-full " + e.color} />
              <span className="flex-1 text-muted">{e.nombre}</span>
              <strong>{unidades.toLocaleString("es-CL")}</strong>
              <span className="w-10 text-right text-xs text-muted">
                {total ? Math.round((unidades / total) * 100) : 0}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
