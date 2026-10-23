"use client";
import Link from "next/link";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { fechaChile } from "@/lib/servicios/fechas";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { Metrica, clp, sumarValor } from "./metricas";
import { GraficoDistribucionSemaforo } from "@/componentes/graficos/grafico-distribucion-semaforo";
import { GraficoVencimientosMeses } from "@/componentes/graficos/grafico-vencimientos-meses";
export function DashboardAdminView({ datos }: { datos: DatosOperacion }) {
  const activos = datos.inventario.filter((i) => i.stock_actual > 0);
  const criticos = activos.filter((i) =>
    ["NARANJO", "VENCIDO"].includes(i.estado_semaforo ?? ""),
  );
  const sinCosto = activos.filter((i) => i.lote?.costo_unitario == null).length;
  const mes = fechaChile().slice(0, 7);
  const mermas = datos.mermas.filter((m) => m.fecha_baja.startsWith(mes));
  const bajasSinCosto = mermas.filter((m) => m.costo_unitario == null).length;
  const salidas = datos.movimientos.filter(
    (m) => m.tipo_movimiento === "SALIDA" && m.cumple_fefo != null,
  );
  const cumplimiento = salidas.length
    ? Math.round(
        (salidas.filter((m) => m.cumple_fefo).length / salidas.length) * 100,
      ) + "%"
    : "Sin registros";
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica
          titulo="Valor del stock"
          valor={
            activos.length > 0 && sinCosto === activos.length
              ? "Sin costos registrados"
              : clp(sumarValor(activos))
          }
          detalle={
            sinCosto
              ? "Valor parcial: " + sinCosto + " registros sin costo."
              : "Valor a costo de adquisición · CLP"
          }
        />
        <Metrica
          titulo="Capital en riesgo"
          valor={
            criticos.length > 0 &&
            criticos.every((i) => i.lote?.costo_unitario == null)
              ? "Sin costos registrados"
              : clp(sumarValor(criticos))
          }
          detalle={
            "Lotes críticos y caducados · umbral " +
            datos.configuracion.dias_critico +
            " días"
          }
        />
        <Metrica
          titulo="Mermas del mes"
          valor={clp(
            mermas.reduce(
              (a, m) => a + m.cantidad * (m.costo_unitario ?? 0),
              0,
            ),
          )}
          detalle={
            bajasSinCosto
              ? "Valor parcial: " + bajasSinCosto + " bajas sin costo."
              : mermas.length + " bajas registradas este mes"
          }
        />
        <Metrica
          titulo="Cumplimiento FEFO"
          valor={cumplimiento}
          detalle={salidas.length + " dispensaciones auditadas"}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GraficoDistribucionSemaforo inventario={activos} />
        <GraficoVencimientosMeses inventario={activos} />
      </div>
      <section className="panel p-0! overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-semibold">Decisiones prioritarias</h2>
            <p className="mt-1 text-xs text-muted">
              Intervenciones sobre stock crítico o caducado.
            </p>
          </div>
          <Link href="/movimientos" className="boton-secundario">
            Gestionar movimientos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Medicamento / lote</th>
                <th>Ubicación</th>
                <th>Stock</th>
                <th>Riesgo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {criticos.slice(0, 20).map((i) => (
                <tr key={i.id_inventario}>
                  <td>
                    <p className="font-medium">{i.lote?.producto?.nombre}</p>
                    <p className="text-xs text-muted">{i.lote?.numero_lote}</p>
                  </td>
                  <td>{i.bodega?.nombre}</td>
                  <td>{i.stock_actual}</td>
                  <td>
                    <SemaforoBadge estado={i.estado_semaforo} />
                  </td>
                  <td>
                    <div className="flex gap-3 text-xs font-semibold text-acento">
                      <Link
                        href={
                          "/movimientos?tipo=MERMA&inventario=" +
                          i.id_inventario
                        }
                      >
                        Baja / devolución
                      </Link>
                      <Link
                        href={
                          "/movimientos?tipo=TRASLADO&inventario=" +
                          i.id_inventario
                        }
                      >
                        Reubicar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!criticos.length && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Sin intervenciones prioritarias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
