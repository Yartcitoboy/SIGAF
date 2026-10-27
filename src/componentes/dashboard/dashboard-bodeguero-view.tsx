"use client";
import Link from "next/link";
import { useState } from "react";
import { DetalleProducto } from "@/componentes/productos/detalle-producto";
import { resumirStock, diaMovimiento } from "@/lib/vistas/presentacion";
import { MapPin } from "lucide-react";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { Metrica } from "./metricas";
export function DashboardBodegueroView({ datos }: { datos: DatosOperacion }) {
  const [detalle, setDetalle] = useState<number | null>(null);
  const stock = resumirStock(
    datos.inventario,
    datos.hoy,
    datos.configuracion.holgura_dias,
  );
  const pendientes = datos.inventario
    .filter(
      (i) =>
        i.stock_actual > 0 &&
        ["VENCIDO", "NARANJO"].includes(i.estado_semaforo ?? ""),
    )
    .sort((a, b) =>
      (a.bodega?.ubicacion ?? "").localeCompare(b.bodega?.ubicacion ?? ""),
    );
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica
          titulo="Lotes pendientes de retiro"
          valor={String(
            new Set(
              pendientes
                .filter((i) => i.estado_semaforo === "VENCIDO")
                .map((i) => i.id_lote),
            ).size,
          )}
        />
        <Metrica
          titulo="Stock físico bajo custodia"
          valor={
            datos.inventario
              .reduce((a, i) => a + i.stock_actual, 0)
              .toLocaleString("es-CL") + " un."
          }
          detalle={`${stock.aptoPorFecha} aptas por fecha · ${stock.bloqueado} bloqueadas. Revisar presentación antes de operar.`}
        />
        <Metrica
          titulo="Recepciones de hoy"
          valor={String(
            datos.movimientos.filter(
              (m) =>
                m.tipo_movimiento === "ENTRADA" &&
                diaMovimiento(m.fecha) === datos.hoy,
            ).length,
          )}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="boton-primario" href={"/lotes?recepcion=1"}>
          {"Recepción de lote"}
        </Link>
        <Link className="boton-secundario" href={"/movimientos?tipo=MERMA"}>
          {"Baja a merma"}
        </Link>
      </div>
      <section className="panel">
        <h2 className="font-semibold">Hoja de ruta física</h2>
        <p className="mt-1 text-xs text-muted">
          Retiro y revisión por ubicación de pasillo / repisa.
        </p>
        <div className="mt-5 divide-y divide-separador">
          {pendientes.map((i) => (
            <article
              key={i.id_inventario}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="flex gap-3">
                <MapPin className="mt-1 shrink-0 text-acento" size={20} />
                <div>
                  <p className="text-xs font-semibold text-acento">
                    {i.bodega?.ubicacion || "Sin referencia física"} ·{" "}
                    {i.bodega?.nombre}
                  </p>
                  <h3 className="mt-1 font-medium">
                    {i.lote?.producto?.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {i.lote?.numero_lote} · Vence {i.lote?.fecha_vencimiento} ·{" "}
                    {i.stock_actual} un.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SemaforoBadge estado={i.estado_semaforo} />
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setDetalle(i.id_lote)}
                >
                  Revisar lote
                </button>
              </div>
            </article>
          ))}
          {!pendientes.length && (
            <p className="py-8 text-sm text-muted">
              No hay ubicaciones pendientes de intervención.
            </p>
          )}
        </div>
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
