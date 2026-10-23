"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Box,
  ChevronRight,
  MapPin,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { PanelLateral } from "@/componentes/ui/panel-lateral";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { useConsulta } from "@/lib/hooks/use-consulta";
import {
  obtenerOperacion,
  type DatosOperacion,
} from "@/lib/servicios/operacion";
import { obtenerCategorias } from "@/lib/servicios/productos";
import {
  prepararDetalleProducto,
  type ReferenciaDetalle,
} from "@/lib/vistas/detalle-producto";
import { useRol } from "@/context/rol-context";
import type { Categoria, Producto } from "@/tipos/database";

export function BotonDetalle({
  nombre,
  abrir,
  children,
}: {
  nombre: string;
  abrir: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`Ver detalle de ${nombre}`}
      aria-haspopup="dialog"
      onClick={abrir}
      className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-left font-medium transition hover:text-acento"
    >
      <span>{children}</span>
      <ChevronRight
        aria-hidden="true"
        size={16}
        className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-acento"
      />
    </button>
  );
}
function Dato({
  nombre,
  children,
}: {
  nombre: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-separador py-4 text-sm">
      <dt className="shrink-0 text-muted">{nombre}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{children}</dd>
    </div>
  );
}
export function DetalleProducto({
  referencia,
  cerrar,
  datos,
  categorias,
  productoInicial,
  alAbrirRecepcion,
  alAbrirMovimiento,
}: {
  referencia: ReferenciaDetalle;
  cerrar: () => void;
  datos?: DatosOperacion;
  categorias?: Categoria[];
  productoInicial?: Producto;
  alAbrirRecepcion?: (idProducto: number) => void;
  alAbrirMovimiento?: (
    tipo: "TRASLADO" | "MERMA",
    idInventario: number,
  ) => void;
}) {
  const { rolActual, soloLectura } = useRol();
  const cargar = useCallback(async () => {
    const [operacion, listaCategorias] = await Promise.all([
      datos ?? obtenerOperacion(),
      categorias ?? obtenerCategorias(),
    ]);
    return { operacion, categorias: listaCategorias };
  }, [datos, categorias]);
  const consulta = useConsulta(cargar);
  const [acciones, setAcciones] = useState(false);
  const detalle = consulta.datos
    ? prepararDetalleProducto(
        consulta.datos.operacion,
        consulta.datos.categorias,
        referencia,
      )
    : null;
  const producto = detalle?.producto ?? productoInicial;
  const numero = (n: number) => n.toLocaleString("es-CL");
  const idInventario = detalle?.inventarioOperacion?.id_inventario;
  return (
    <PanelLateral titulo="Detalle del producto" cerrar={cerrar}>
      {producto && (
        <section className="mb-6 text-center">
          <div className="mx-auto mb-5 grid h-22 w-22 place-items-center rounded-3xl bg-acento-suave text-acento">
            <Box size={37} strokeWidth={1.4} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {producto.nombre}
          </h3>
          <p className="mt-2 break-all font-mono text-xs text-muted">
            {producto.codigo_barras ||
              `Sin código · ID ${producto.id_producto}`}
          </p>
          {producto.principio_activo && (
            <p className="mt-2 text-sm text-muted">
              {producto.principio_activo}
            </p>
          )}
        </section>
      )}
      <EstadoDatos {...consulta} />
      {consulta.datos && !consulta.error && !detalle && (
        <p role="status" className="rounded-xl bg-sutil p-4 text-sm text-muted">
          Este registro ya no está disponible o no pertenece a tu sucursal.
        </p>
      )}
      {detalle && (
        <>
          {(detalle.lote || detalle.movimiento) && (
            <div className="mb-4 rounded-xl border border-acento-borde/40 bg-acento-suave p-4 text-sm">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-acento">
                {detalle.movimiento
                  ? `Movimiento #${detalle.movimiento.id_movimiento}`
                  : "Lote seleccionado"}
              </p>
              <p className="font-semibold">{detalle.lote?.numero_lote}</p>
              {detalle.movimiento && (
                <p className="mt-2 text-xs text-muted">
                  {detalle.movimiento.tipo_movimiento} ·{" "}
                  {numero(detalle.movimiento.cantidad)} un. ·{" "}
                  {detalle.movimiento.fecha.replace("T", " ").slice(0, 16)}
                </p>
              )}
            </div>
          )}
          <dl>
            <Dato nombre="Estado">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${detalle.stockActual === 0 || detalle.stockApto === 0 ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-acento-suave text-acento"}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {detalle.estado}
              </span>
            </Dato>
            <Dato nombre="Stock actual">
              {numero(detalle.stockActual)} unidades
            </Dato>
            <Dato nombre="Disponible en sala">
              {detalle.salasRegistradas
                ? `${numero(detalle.stockSala)} unidades`
                : "Sin clasificación en la base"}
            </Dato>
            {detalle.stockBloqueado > 0 && (
              <Dato nombre="Bloqueado por fecha">
                {numero(detalle.stockBloqueado)} unidades
              </Dato>
            )}
            <Dato nombre="Categoría">
              {detalle.categoria?.nombre || "Sin categoría disponible"}
            </Dato>
            <Dato nombre="Presentación">
              {detalle.producto.unidad_medida || "Sin registrar"}
            </Dato>
            {Object.hasOwn(detalle.producto, "registro_isp") && (
              <Dato nombre="Registro ISP">
                {detalle.producto.registro_isp || "Sin registrar"}
              </Dato>
            )}
            {detalle.producto.vida_util_meses != null && (
              <Dato nombre="Vida útil">
                {detalle.producto.vida_util_meses} meses
              </Dato>
            )}
            {detalle.lote && (
              <>
                <Dato nombre="Vencimiento del lote">
                  {detalle.lote.fecha_vencimiento}
                </Dato>
                <Dato nombre="Fecha de ingreso">
                  {detalle.lote.fecha_ingreso}
                </Dato>
              </>
            )}
            {detalle.movimiento?.motivo && (
              <Dato nombre="Motivo">{detalle.movimiento.motivo}</Dato>
            )}
            {detalle.movimiento && (
              <Dato nombre="Responsable">
                <span title={detalle.movimiento.id_usuario}>
                  {detalle.movimiento.id_usuario}
                </span>
              </Dato>
            )}
            {detalle.destino && (
              <Dato nombre="Destino">{detalle.destino.nombre}</Dato>
            )}
          </dl>
          {detalle.producto.descripcion && (
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {detalle.producto.descripcion}
            </p>
          )}
          <section className="mt-7">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Ubicaciones
            </h4>
            <div className="space-y-2">
              {detalle.ubicaciones.map((u, i) => (
                <div
                  key={u.bodega?.id_bodega ?? i}
                  className="flex items-start justify-between gap-4 rounded-xl bg-sutil p-3 text-sm"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-acento" />
                    <div>
                      <p className="font-medium">
                        {u.bodega?.nombre || "Ubicación no disponible"}
                      </p>
                      {u.bodega?.ubicacion && (
                        <p className="mt-1 text-xs text-muted">
                          {u.bodega.ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold">
                    {numero(u.stock)} un.
                  </span>
                </div>
              ))}
            </div>
            {!detalle.ubicaciones.length && (
              <p className="text-sm text-muted">
                Aún no se han recibido existencias de este producto.
              </p>
            )}
          </section>
          <section className="mt-7">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Lotes del producto · {detalle.lotes.length}
            </h4>
            <div className="space-y-3">
              {detalle.lotes.map((l) => (
                <div
                  key={l.id_lote}
                  className={`rounded-xl border p-3 ${l.id_lote === detalle.lote?.id_lote ? "border-acento-borde bg-acento-suave/50" : "border-separador"}`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold">
                      {l.numero_lote}
                    </p>
                    <SemaforoBadge
                      estado={l.semaforo.estado}
                      diasRestantes={l.semaforo.diasRestantes}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    Vence {l.fecha_vencimiento} · {numero(l.stock)} un.
                  </p>
                </div>
              ))}
            </div>
            {!detalle.lotes.length && (
              <p className="text-sm text-muted">Sin lotes registrados.</p>
            )}
          </section>
          {detalle.movimientos.length > 0 && (
            <section className="mt-7">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Actividad reciente del producto
              </h4>
              <div className="divide-y divide-separador">
                {detalle.movimientos.map((m) => (
                  <div
                    key={m.id_movimiento}
                    className="flex items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold">{m.tipo_movimiento}</p>
                      <p className="mt-1 text-muted">
                        {m.fecha.replace("T", " ").slice(0, 16)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {numero(m.cantidad)} un.
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {rolActual !== "AUXILIAR" &&
            !soloLectura &&
            !consulta.datos?.operacion.configuracion.esquema_original && (
              <div className="mt-8 border-t border-separador pt-5">
                <button
                  type="button"
                  onClick={() => setAcciones(!acciones)}
                  aria-expanded={acciones}
                  className="boton-primario w-full"
                >
                  <Plus size={18} />
                  Registrar movimiento
                </button>
                {acciones && (
                  <div className="mt-3 grid gap-2">
                    <Link
                      className="boton-secundario justify-center"
                      href={`/lotes?recepcion=1&producto=${detalle.producto.id_producto}`}
                      onClick={(e) => {
                        if (alAbrirRecepcion) {
                          e.preventDefault();
                          alAbrirRecepcion(detalle.producto.id_producto);
                        } else cerrar();
                      }}
                    >
                      <ArrowDownToLine size={16} />
                      Entrada de lote
                    </Link>
                    {(["TRASLADO", "MERMA"] as const).map((tipo) =>
                      idInventario ? (
                        <Link
                          key={tipo}
                          className="boton-secundario justify-center"
                          href={`/movimientos?tipo=${tipo}&inventario=${idInventario}`}
                          onClick={(e) => {
                            if (alAbrirMovimiento) {
                              e.preventDefault();
                              alAbrirMovimiento(tipo, idInventario);
                            } else cerrar();
                          }}
                        >
                          {tipo === "TRASLADO" ? (
                            <ArrowLeftRight size={16} />
                          ) : (
                            <ShieldAlert size={16} />
                          )}
                          {tipo === "TRASLADO"
                            ? "Traslado de existencias"
                            : "Merma / devolución"}
                        </Link>
                      ) : (
                        <button
                          key={tipo}
                          type="button"
                          disabled
                          className="boton-secundario justify-center"
                        >
                          {tipo === "TRASLADO"
                            ? "Traslado de existencias"
                            : "Merma / devolución"}
                        </button>
                      ),
                    )}
                    {!idInventario && (
                      <p className="text-xs text-muted">
                        Sin existencias en el contexto seleccionado. Puedes
                        registrar una entrada.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          <p className="mt-5 text-[11px] leading-relaxed text-muted">
            Datos de Supabase.{" "}
            {soloLectura
              ? "Acceso temporal de solo lectura; no modifica registros."
              : "Consulta limitada por los permisos de tu cuenta."}
          </p>
        </>
      )}
    </PanelLateral>
  );
}
