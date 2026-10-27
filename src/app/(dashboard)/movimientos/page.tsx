"use client";
import { Suspense, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { Dialogo } from "@/componentes/ui/dialogo";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion, operarStock } from "@/lib/servicios/operacion";
import { useRol } from "@/context/rol-context";
import { obtenerResponsables } from "@/lib/servicios/usuarios";
import { nombreResponsable } from "@/lib/vistas/responsables";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import {
  coincide,
  diaMovimiento,
  fechaHoraVisible,
} from "@/lib/vistas/presentacion";
import {
  BotonDetalle,
  DetalleProducto,
} from "@/componentes/productos/detalle-producto";
export default function MovimientosPage() {
  return (
    <Suspense fallback={<EstadoDatos cargando error={null} />}>
      <ContenidoMovimientos />
    </Suspense>
  );
}
function ContenidoMovimientos() {
  const parametros = useSearchParams();
  const inicial = parametros.get("tipo");
  const consulta = useConsulta(obtenerOperacion);
  const { perfilActual } = useRol();
  const directorio = useConsulta(obtenerResponsables);
  const [tipo, setTipo] = useState<"MERMA" | "TRASLADO" | null>(
    inicial === "MERMA" || inicial === "TRASLADO" ? inicial : null,
  );
  const [origen, setOrigen] = useState(parametros.get("inventario") || "");
  const [ocupado, setOcupado] = useState(false);
  const [detalle, setDetalle] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [destino, setDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const limpiar = () => {
    setTexto("");
    setFiltroTipo("");
    setDesde("");
    setHasta("");
    setUbicacion("");
  };
  const rangoInvalido = Boolean(desde && hasta && desde > hasta);
  const filas =
    consulta.datos?.movimientos
      .filter(
        (m) =>
          !rangoInvalido &&
          (!filtroTipo || m.tipo_movimiento === filtroTipo) &&
          (!desde || diaMovimiento(m.fecha) >= desde) &&
          (!hasta || diaMovimiento(m.fecha) <= hasta) &&
          (!ubicacion ||
            String(m.inventario?.id_bodega) === ubicacion ||
            String(m.id_bodega_destino) === ubicacion) &&
          coincide(
            texto,
            m.inventario?.lote?.producto?.nombre,
            m.inventario?.lote?.numero_lote,
            m.id_usuario,
            nombreResponsable(
              m.id_usuario,
              directorio.datos ?? [],
              perfilActual,
            ),
            m.motivo,
          ),
      )
      .sort(
        (a, b) =>
          b.fecha.localeCompare(a.fecha) || b.id_movimiento - a.id_movimiento,
      ) ?? [];
  const clave = useRef<string | null>(null);
  function abrir(t: "MERMA" | "TRASLADO") {
    setTipo(t);
    setOrigen("");
    setCantidad(0);
    setDestino("");
    setMotivo("");
    clave.current = null;
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tipo || ocupado) return;
    const f = new FormData(e.currentTarget);
    if (
      !seleccionado ||
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > seleccionado.stock_actual
    ) {
      toast.error("Revisa el origen y la cantidad disponible.");
      return;
    }
    if (
      tipo === "TRASLADO" &&
      (!destino || Number(destino) === seleccionado.id_bodega)
    ) {
      toast.error("Selecciona un destino diferente del origen.");
      return;
    }
    if (!String(f.get("motivo") || "").trim()) {
      toast.error("Selecciona o escribe un motivo.");
      return;
    }
    setOcupado(true);
    clave.current ??= crypto.randomUUID();
    try {
      await operarStock({
        inventario: Number(origen),
        cantidad: Number(f.get("cantidad")),
        tipo,
        motivo: String(f.get("motivo")),
        destino: tipo === "TRASLADO" ? Number(f.get("destino")) : undefined,
        operacion: clave.current,
      });
      toast.success(
        tipo === "MERMA"
          ? "Merma registrada y stock descontado"
          : "Traslado registrado",
      );
      clave.current = null;
      setTipo(null);
      await consulta.recargar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo registrar el movimiento.",
      );
    } finally {
      setOcupado(false);
    }
  }
  const seleccionado = consulta.datos?.inventario.find(
    (i) => i.id_inventario === Number(origen),
  );
  return (
    <TransicionPagina>
      <Header
        titulo="Movimientos y mermas"
        subtitulo="Libro de control con trazabilidad de usuario, fecha y motivo."
      />
      <div className="flex flex-wrap gap-3">
        <button
          className="boton-primario"
          disabled={!consulta.datos}
          onClick={() => abrir("TRASLADO")}
        >
          {"Registrar traslado"}
        </button>
        <button
          className="boton-secundario"
          disabled={!consulta.datos}
          onClick={() => abrir("MERMA")}
        >
          {"Registrar merma / devolución"}
        </button>
      </div>
      <div className="panel mt-4 flex flex-wrap items-end gap-3">
        <label className="flex-1 text-sm">
          Buscar
          <input
            className="campo mt-1"
            placeholder="Medicamento, lote, motivo o ID responsable"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Operación
          <select
            className="campo mt-1"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todas</option>
            {["ENTRADA", "SALIDA", "TRASLADO", "MERMA", "AJUSTE"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Ubicación
          <select
            className="campo mt-1"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          >
            <option value="">Todas · origen o destino</option>
            {consulta.datos?.bodegas.map((b) => (
              <option key={b.id_bodega} value={b.id_bodega}>
                {b.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Desde
          <input
            type="date"
            className="campo mt-1"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Hasta
          <input
            type="date"
            className="campo mt-1"
            min={desde || undefined}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
      </div>
      {rangoInvalido && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          La fecha inicial no puede superar la final.
        </p>
      )}
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.movimientos.length}
          unidad="movimientos"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length && !rangoInvalido}
        filtrado={Boolean(texto || filtroTipo || desde || hasta || ubicacion)}
        limpiar={limpiar}
      />
      {consulta.datos &&
        !consulta.cargando &&
        !consulta.error &&
        filas.length > 0 && (
          <div className="panel overflow-x-auto p-0!">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operación</th>
                  <th>Medicamento / lote</th>
                  <th>Ubicación / destino</th>
                  <th>Cantidad</th>
                  <th>Motivo / usuario</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td className="whitespace-nowrap">
                      {fechaHoraVisible(m.fecha)}
                    </td>
                    <td>
                      <span className="rounded-lg bg-elevado px-2 py-1 text-xs">
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td>
                      {m.inventario?.lote?.producto ? (
                        <BotonDetalle
                          nombre={m.inventario.lote.producto.nombre}
                          abrir={() => setDetalle(m.id_movimiento)}
                        >
                          {m.inventario.lote.producto.nombre}
                        </BotonDetalle>
                      ) : (
                        "Producto no disponible"
                      )}
                      <p className="text-xs text-muted">
                        {m.inventario?.lote?.numero_lote}
                      </p>
                    </td>
                    <td>
                      {m.inventario?.bodega?.nombre}
                      {m.id_bodega_destino && (
                        <p className="text-xs text-acento">
                          →{" "}
                          {
                            consulta.datos!.bodegas.find(
                              (b) => b.id_bodega === m.id_bodega_destino,
                            )?.nombre
                          }
                        </p>
                      )}
                    </td>
                    <td className="font-semibold">
                      {m.cantidad}
                      <p className="mt-1 text-xs font-normal text-muted">
                        {m.inventario?.lote?.producto?.unidad_medida ||
                          "Unidad sin especificar"}
                      </p>
                    </td>
                    <td>
                      {m.motivo || "Sin motivo consignado en el movimiento"}
                      <p
                        className="mt-1 text-xs text-muted"
                        title={m.id_usuario}
                      >
                        {nombreResponsable(
                          m.id_usuario,
                          directorio.datos ?? [],
                          perfilActual,
                        )}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {detalle !== null && consulta.datos && (
        <DetalleProducto
          key={detalle}
          referencia={{ tipo: "movimiento", id: detalle }}
          datos={consulta.datos}
          cerrar={() => setDetalle(null)}
          alAbrirMovimiento={(t, id) => {
            setDetalle(null);
            setTipo(t);
            setOrigen(String(id));
            setCantidad(0);
            setDestino("");
            setMotivo("");
            clave.current = null;
          }}
        />
      )}
      {tipo && consulta.datos && (
        <Dialogo
          titulo={
            tipo === "MERMA"
              ? "Baja a merma / devolución"
              : "Traslado de existencias"
          }
          cerrar={() => setTipo(null)}
          ocupado={ocupado}
        >
          <form
            onSubmit={guardar}

            className="space-y-4"
          >
            <label className="block text-sm">
              Lote y ubicación de origen
              <select
                className="campo mt-1"
                required
                value={origen}
                aria-label="Lote y ubicación de origen"
                disabled={ocupado}
                onChange={(e) => {
                  setOrigen(e.target.value);
                  setCantidad(0);
                  setDestino("");
                  setMotivo("");
                  clave.current = null;
                }}
              >
                <option value="">Selecciona existencias</option>
                {consulta.datos.inventario
                  .filter((i) => i.stock_actual > 0)
                  .map((i) => (
                    <option key={i.id_inventario} value={i.id_inventario}>
                      {i.lote?.producto?.nombre} · {i.lote?.numero_lote} ·{" "}
                      {i.bodega?.nombre} · {i.stock_actual} un.
                    </option>
                  ))}
              </select>
            </label>
            <label className="block text-sm">
              Cantidad
              <input
                name="cantidad"
                value={cantidad || ""}
                onChange={(e) => setCantidad(Number(e.target.value))}
                disabled={ocupado}
                required
                min="1"
                max={seleccionado?.stock_actual}
                step="1"
                type="number"
                className="campo mt-1"
              />
            </label>
            {tipo === "TRASLADO" && (
              <label className="block text-sm">
                Destino
                <select
                  name="destino"
                  aria-label="Destino del traslado"
                  disabled={ocupado}
                  required
                  className="campo mt-1"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                >
                  <option value="">Selecciona bodega / estante</option>
                  {consulta.datos.bodegas
                    .filter((b) => b.id_bodega !== seleccionado?.id_bodega)
                    .map((b) => (
                      <option key={b.id_bodega} value={b.id_bodega}>
                        {b.nombre} · {b.ubicacion}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="block text-sm">
              Motivo obligatorio
              {tipo === "MERMA" ? (
                <select
                  name="motivo"
                  aria-label="Motivo de la baja"
                  disabled={ocupado}
                  className="campo mt-1"
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona la causa expresamente
                  </option>
                  <option value="VENCIMIENTO">Vencimiento</option>
                  <option value="DETERIORO">Deterioro</option>
                  <option value="DEVOLUCION">
                    Devolución a proveedor / laboratorio
                  </option>
                </select>
              ) : (
                <input
                  name="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                  disabled={ocupado}
                  maxLength={150}
                  className="campo mt-1"
                />
              )}
            </label>
            {seleccionado && (
              <div className="rounded-xl bg-sutil p-4 text-sm">
                <p className="font-semibold">Resumen antes de confirmar</p>
                <p className="mt-2">
                  {seleccionado.lote?.producto?.nombre} ·{" "}
                  {seleccionado.lote?.numero_lote}
                </p>
                <p className="mt-1">
                  Origen: {seleccionado.bodega?.nombre} · Stock físico{" "}
                  {seleccionado.stock_actual}
                </p>
                <p className="mt-1">
                  Presentación:{" "}
                  {seleccionado.lote?.producto?.unidad_medida ||
                    "Sin especificar"}
                </p>
                <p className="mt-1">
                  Saldo previsto en origen:{" "}
                  {cantidad > 0 && cantidad <= seleccionado.stock_actual
                    ? seleccionado.stock_actual - cantidad
                    : "Revisa la cantidad"}
                </p>
                {tipo === "TRASLADO" && (
                  <p className="mt-1">
                    Destino:{" "}
                    {consulta.datos.bodegas.find(
                      (b) => String(b.id_bodega) === destino,
                    )?.nombre || "Pendiente"}
                  </p>
                )}
                {tipo === "MERMA" && (
                  <p className="mt-2 text-xs text-muted">
                    La devolución no equivale necesariamente a una pérdida
                    económica. Este formulario no acredita retiro físico ni
                    destrucción.
                  </p>
                )}
              </div>
            )}
            <button disabled={ocupado} className="boton-primario">
              {ocupado ? "Registrando…" : "Confirmar movimiento"}
            </button>
          </form>
        </Dialogo>
      )}
    </TransicionPagina>
  );
}
