"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { ModalCrearLote } from "@/componentes/modales/modal-crear-lote";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";
import { calcularSemaforoLote } from "@/lib/servicios/semaforo";
import { useRol } from "@/context/rol-context";
import {
  BotonDetalle,
  DetalleProducto,
} from "@/componentes/productos/detalle-producto";
export default function LotesPage() {
  return (
    <Suspense fallback={<EstadoDatos cargando error={null} />}>
      <ContenidoLotes />
    </Suspense>
  );
}
function ContenidoLotes() {
  const parametros = useSearchParams();
  const consulta = useConsulta(obtenerOperacion);
  const { soloLectura } = useRol();
  const bloquearEscritura =
    soloLectura || Boolean(consulta.datos?.configuracion.esquema_original);
  const [abierto, setAbierto] = useState(parametros.has("recepcion"));
  const [detalle, setDetalle] = useState<number | null>(null);
  const [productoInicial, setProductoInicial] = useState(
    Number(parametros.get("producto")) || undefined,
  );
  const [texto, setTexto] = useState("");
  const lotes =
    consulta.datos?.lotes
      .filter((l) =>
        [
          l.numero_lote,
          consulta.datos?.productos.find((p) => p.id_producto === l.id_producto)
            ?.nombre,
        ].some((v) => v?.toLowerCase().includes(texto.toLowerCase())),
      )
      .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)) ??
    [];
  return (
    <TransicionPagina>
      <Header
        titulo="Lotes y recepción"
        subtitulo="Trazabilidad desde la recepción hasta la dispensación. Ordenados por vencimiento."
      />
      <div className="flex flex-wrap gap-3">
        <input
          className="campo max-w-lg"
          placeholder="Buscar lote o medicamento"
          aria-label="Buscar lotes"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          disabled={!consulta.datos || bloquearEscritura}
          title={
            bloquearEscritura
              ? "Consulta del esquema existente, sin escrituras de stock"
              : undefined
          }
          className="boton-primario"
          onClick={() => {
            setProductoInicial(undefined);
            setAbierto(true);
          }}
        >
          + Recepción de lote
        </button>
      </div>
      <EstadoDatos {...consulta} vacio={!lotes.length} />
      {consulta.datos &&
        !consulta.cargando &&
        !consulta.error &&
        lotes.length > 0 && (
          <div className="panel overflow-x-auto p-0!">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Medicamento</th>
                  <th>Vencimiento</th>
                  <th>Stock / ubicaciones</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => {
                  const stocks = consulta.datos!.inventario.filter(
                    (i) => i.id_lote === l.id_lote,
                  );
                  const semaforo = calcularSemaforoLote(
                    l.fecha_vencimiento,
                    consulta.datos!.configuracion,
                  );
                  return (
                    <tr key={l.id_lote}>
                      <td className="font-mono font-semibold">
                        <BotonDetalle
                          nombre={`lote ${l.numero_lote}`}
                          abrir={() => setDetalle(l.id_lote)}
                        >
                          {l.numero_lote}
                        </BotonDetalle>
                      </td>
                      <td>
                        {
                          consulta.datos!.productos.find(
                            (p) => p.id_producto === l.id_producto,
                          )?.nombre
                        }
                      </td>
                      <td>{l.fecha_vencimiento}</td>
                      <td>
                        {stocks.reduce((a, i) => a + i.stock_actual, 0)} un.
                        <p className="text-xs text-muted">
                          {stocks.map((i) => i.bodega?.nombre).join(", ") ||
                            "Sin ubicación"}
                        </p>
                      </td>
                      <td>
                        <SemaforoBadge
                          estado={semaforo.estado}
                          diasRestantes={semaforo.diasRestantes}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      {consulta.datos && !bloquearEscritura && (
        <ModalCrearLote
          abierto={abierto}
          alCerrar={() => setAbierto(false)}
          alGuardarExitoso={consulta.recargar}
          productos={consulta.datos.productos}
          bodegas={consulta.datos.bodegas}
          configuracion={consulta.datos.configuracion}
          productoInicial={productoInicial}
        />
      )}
      {detalle !== null && consulta.datos && (
        <DetalleProducto
          key={detalle}
          referencia={{ tipo: "lote", id: detalle }}
          datos={consulta.datos}
          cerrar={() => setDetalle(null)}
          alAbrirRecepcion={(id) => {
            setDetalle(null);
            setProductoInicial(id);
            setAbierto(true);
          }}
        />
      )}
    </TransicionPagina>
  );
}
