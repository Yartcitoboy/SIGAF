"use client";
import Link from "next/link";
import { useState } from "react";
import { DetalleProducto } from "@/componentes/productos/detalle-producto";
import {
  filtrarSucursal,
  resumirStock,
  valoracionVisible,
  diaMovimiento,
} from "@/lib/vistas/presentacion";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { Metrica, clp, sumarValor } from "./metricas";
import { GraficoDistribucionSemaforo } from "@/componentes/graficos/grafico-distribucion-semaforo";
import { GraficoVencimientosMeses } from "@/componentes/graficos/grafico-vencimientos-meses";
export function DashboardAdminView({ datos: base }: { datos: DatosOperacion }) {
  const [sucursal, setSucursal] = useState("");
  const [todos, setTodos] = useState(false);
  const [detalle, setDetalle] = useState<number | null>(null);
  const datos = filtrarSucursal(base, sucursal);
  const stock = resumirStock(
    datos.inventario,
    datos.hoy,
    datos.configuracion.holgura_dias,
  );
  const activos = datos.inventario.filter((i) => i.stock_actual > 0);
  const criticos = activos
    .filter((i) => ["NARANJO", "VENCIDO"].includes(i.estado_semaforo ?? ""))
    .sort((a, b) =>
      (a.lote?.fecha_vencimiento ?? "").localeCompare(
        b.lote?.fecha_vencimiento ?? "",
      ),
    );
  const sinCosto = activos.filter((i) => i.lote?.costo_unitario == null).length;
  const mes = datos.hoy.slice(0, 7);
  const mermas = datos.mermas.filter((m) => m.fecha_baja.startsWith(mes));
  const bajasSinCosto = mermas.filter((m) => m.costo_unitario == null).length;
  const bajasValor = valoracionVisible(
    mermas.map((m) => ({ cantidad: m.cantidad, costo: m.costo_unitario })),
  );
  const riesgoValor = valoracionVisible(
    criticos.map((i) => ({
      cantidad: i.stock_actual,
      costo: i.lote?.costo_unitario,
    })),
  );
  const salidas = datos.movimientos.filter(
    (m) =>
      m.tipo_movimiento === "SALIDA" &&
      m.cumple_fefo != null &&
      diaMovimiento(m.fecha).startsWith(mes),
  );
  const cumplimiento = salidas.length
    ? Math.round(
        (salidas.filter((m) => m.cumple_fefo).length / salidas.length) * 100,
      ) + "%"
    : "Sin registros";
  return (
    <div className="space-y-6">
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Administración general</p>
          <p className="mt-1 text-xs text-muted">
            Alcance global actual. Este filtro cambia la vista, no los permisos.
          </p>
        </div>
        <label className="text-sm">
          Sucursal
          <select
            aria-label="Sucursal del dashboard"
            className="campo mt-1"
            value={sucursal}
            onChange={(e) => {
              setSucursal(e.target.value);
              setTodos(false);
            }}
          >
            <option value="">Todas las sucursales</option>
            {base.sucursales.map((s) => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica
          titulo="Stock físico"
          valor={stock.fisico.toLocaleString("es-CL")}
          detalle="Incluye existencias bloqueadas por fecha"
        />
        <Metrica
          titulo="Apto por fecha"
          valor={stock.aptoPorFecha.toLocaleString("es-CL")}
          detalle="No acredita liberación sanitaria ni disponibilidad comercial"
        />
        <Metrica
          titulo="Bloqueado por fecha"
          valor={stock.bloqueado.toLocaleString("es-CL")}
          detalle="Caducidad y holgura de dispensación"
        />
      </div>
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
            (riesgoValor.sinCosto
              ? `Valoración incompleta: ${riesgoValor.sinCosto} registros sin costo. `
              : "") +
            "Lotes críticos y caducados · umbral " +
            datos.configuracion.dias_critico +
            " días"
          }
        />
        <Metrica
          titulo="Bajas del mes"
          valor={
            bajasValor.valor === null
              ? "Sin costos registrados"
              : clp(bajasValor.valor)
          }
          detalle={
            bajasSinCosto
              ? "Valor parcial: " + bajasSinCosto + " bajas sin costo."
              : mermas.length +
                " bajas registradas. Puede incluir devoluciones; no equivale a pérdida económica."
          }
        />
        <Metrica
          titulo="Cumplimiento FEFO"
          valor={cumplimiento}
          detalle={
            salidas.length +
            " salidas evaluadas · mes actual. Sin evaluación no significa incumplimiento."
          }
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GraficoDistribucionSemaforo inventario={activos} />
        <GraficoVencimientosMeses inventario={activos} hoy={datos.hoy} />
      </div>
      <section className="panel p-0! overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="font-semibold">Decisiones prioritarias</h2>
            <p className="mt-1 text-xs text-muted">
              {criticos.length} existencias prioritarias · ordenadas por
              vencimiento.
            </p>
          </div>
          <Link href="/movimientos" className="boton-secundario">
            {"Gestionar movimientos →"}
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
              {(todos ? criticos : criticos.slice(0, 20)).map((i) => (
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
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-acento">
                      <button
                        type="button"
                        className="boton-secundario"
                        onClick={() => setDetalle(i.id_lote)}
                      >
                        Revisar lote
                      </button>
                      {
                        <>
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
                            {i.estado_semaforo === "VENCIDO"
                              ? "Trasladar para segregación"
                              : "Reubicar"}
                          </Link>
                        </>
                      }
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
        {criticos.length > 20 && (
          <button
            type="button"
            className="boton-secundario m-4"
            onClick={() => setTodos(!todos)}
          >
            {todos
              ? "Mostrar los primeros 20"
              : `Ver las ${criticos.length} existencias prioritarias`}
          </button>
        )}
      </section>
      {detalle !== null && (
        <DetalleProducto
          referencia={{ tipo: "lote", id: detalle }}
          datos={datos}
          cerrar={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
