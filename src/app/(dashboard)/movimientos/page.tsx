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
  const { soloLectura } = useRol();
  const bloquearEscritura =
    soloLectura || Boolean(consulta.datos?.configuracion.esquema_original);
  const [tipo, setTipo] = useState<"MERMA" | "TRASLADO" | null>(
    inicial === "MERMA" || inicial === "TRASLADO" ? inicial : null,
  );
  const [origen, setOrigen] = useState(parametros.get("inventario") || "");
  const [ocupado, setOcupado] = useState(false);
  const [detalle, setDetalle] = useState<number | null>(null);
  const clave = useRef<string | null>(null);
  function abrir(t: "MERMA" | "TRASLADO") {
    setTipo(t);
    setOrigen("");
    clave.current = null;
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tipo || ocupado) return;
    const f = new FormData(e.currentTarget);
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
          disabled={!consulta.datos || bloquearEscritura}
          onClick={() => abrir("TRASLADO")}
        >
          Registrar traslado
        </button>
        <button
          className="boton-secundario"
          disabled={!consulta.datos || bloquearEscritura}
          onClick={() => abrir("MERMA")}
        >
          Registrar merma / devolución
        </button>
      </div>
      <EstadoDatos
        {...consulta}
        vacio={consulta.datos?.movimientos.length === 0}
      />
      {consulta.datos &&
        !consulta.cargando &&
        !consulta.error &&
        consulta.datos.movimientos.length > 0 && (
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
                {consulta.datos.movimientos.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td className="whitespace-nowrap">
                      {m.fecha.replace("T", " ").slice(0, 16)}
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
                    <td className="font-semibold">{m.cantidad}</td>
                    <td>
                      {m.motivo || "—"}
                      <p
                        className="font-mono text-[10px] text-muted"
                        title={m.id_usuario}
                      >
                        {m.id_usuario.slice(0, 8)}
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
            clave.current = null;
          }}
        />
      )}
      {tipo && consulta.datos && !bloquearEscritura && (
        <Dialogo
          titulo={
            tipo === "MERMA"
              ? "Baja a merma / devolución"
              : "Traslado de existencias"
          }
          cerrar={() => setTipo(null)}
          ocupado={ocupado}
        >
          <form onSubmit={guardar} className="space-y-4">
            <label className="block text-sm">
              Lote y ubicación de origen
              <select
                className="campo mt-1"
                required
                value={origen}
                disabled={ocupado}
                onChange={(e) => {
                  setOrigen(e.target.value);
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
                  disabled={ocupado}
                  required
                  className="campo mt-1"
                  defaultValue=""
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
                  disabled={ocupado}
                  className="campo mt-1"
                  required
                >
                  <option value="VENCIMIENTO">Vencimiento</option>
                  <option value="DETERIORO">Deterioro</option>
                  <option value="DEVOLUCION">
                    Devolución a proveedor / laboratorio
                  </option>
                </select>
              ) : (
                <input
                  name="motivo"
                  required
                  disabled={ocupado}
                  maxLength={300}
                  className="campo mt-1"
                />
              )}
            </label>
            <button disabled={ocupado} className="boton-primario">
              {ocupado ? "Registrando…" : "Confirmar movimiento"}
            </button>
          </form>
        </Dialogo>
      )}
    </TransicionPagina>
  );
}
