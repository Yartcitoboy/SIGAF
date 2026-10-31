"use client";
import { usePaginaListado } from "@/lib/hooks/use-listado";
import { Paginacion } from "@/componentes/ui/paginacion";
import dynamic from "next/dynamic";
import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
const ModalCrearLote = dynamic(() =>
  import("@/componentes/modales/modal-crear-lote").then(
    (m) => m.ModalCrearLote,
  ),
);
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";
import { calcularSemaforoLote } from "@/lib/servicios/semaforo";
import { EtiquetaLote } from "@/componentes/productos/etiqueta-lote";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { coincide, fechaVisible } from "@/lib/vistas/presentacion";
import { BotonDetalle } from "@/componentes/productos/boton-detalle";
const DetalleProducto = dynamic(() =>
  import("@/componentes/productos/detalle-producto").then(
    (m) => m.DetalleProducto,
  ),
);
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
  const [abierto, setAbierto] = useState(parametros.has("recepcion"));
  const [detalle, setDetalle] = useState<number | null>(null);
  const [etiqueta, setEtiqueta] = useState<number | null>(null);
  const [productoInicial, setProductoInicial] = useState(
    Number(parametros.get("producto")) || undefined,
  );
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [stock, setStock] = useState("");
  const { pagina, cambiar } = usePaginaListado(
    JSON.stringify([texto, estado, stock]),
  );
  const limpiar = () => {
    setTexto("");
    setEstado("");
    setStock("");
  };
  const datos = consulta.datos;
  const porLote = useMemo(() => {
    const mapa = new Map<number, import("@/tipos/database").Inventario[]>();
    for (const i of datos?.inventario ?? []) {
      const lista = mapa.get(i.id_lote) ?? [];
      lista.push(i);
      mapa.set(i.id_lote, lista);
    }
    return mapa;
  }, [datos]);
  const porProducto = useMemo(
    () => new Map((datos?.productos ?? []).map((p) => [p.id_producto, p])),
    [datos],
  );
  const lotes =
    consulta.datos?.lotes
      .filter((l) => {
        const cantidad = (porLote.get(l.id_lote) ?? []).reduce(
          (s, i) => s + i.stock_actual,
          0,
        );
        return (
          coincide(
            texto,
            l.numero_lote,
            porProducto.get(l.id_producto)?.nombre,
          ) &&
          (!estado ||
            calcularSemaforoLote(
              l.fecha_vencimiento,
              consulta.datos!.configuracion,
              consulta.datos!.hoy,
            ).estado === estado) &&
          (!stock || (stock === "agotado" ? cantidad === 0 : cantidad > 0))
        );
      })
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
        <select
          aria-label="Estado del lote"
          className="campo w-auto!"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="VENCIDO">Caducado</option>
          <option value="NARANJO">Crítico</option>
          <option value="AMARILLO">Preventivo</option>
          <option value="VERDE">Vigente</option>
        </select>
        <select
          aria-label="Existencias del lote"
          className="campo w-auto!"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        >
          <option value="">Todos los lotes</option>
          <option value="con-stock">Con stock físico</option>
          <option value="agotado">Agotados</option>
        </select>
        <button
          disabled={!consulta.datos}
          title={undefined}
          className="boton-primario"
          onClick={() => {
            setProductoInicial(undefined);
            setAbierto(true);
          }}
        >
          {"+ Recepción de lote"}
        </button>
      </div>
      {consulta.datos && (
        <ResumenConsulta
          cantidad={lotes.length}
          total={consulta.datos.lotes.length}
          unidad="lotes"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!lotes.length}
        filtrado={Boolean(texto || estado || stock)}
        limpiar={limpiar}
      />
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
                  <th>Etiqueta</th>
                </tr>
              </thead>
              <tbody>
                {lotes.slice((pagina - 1) * 25, pagina * 25).map((l) => {
                  const stocks = porLote.get(l.id_lote) ?? [];
                  const semaforo = calcularSemaforoLote(
                    l.fecha_vencimiento,
                    consulta.datos!.configuracion,
                    consulta.datos!.hoy,
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
                      <td>{porProducto.get(l.id_producto)?.nombre}</td>
                      <td>{fechaVisible(l.fecha_vencimiento)}</td>
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
                      <td>
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => setEtiqueta(l.id_lote)}
                        >
                          Ver etiqueta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      {consulta.datos && abierto && (
        <ModalCrearLote
          abierto={abierto}
          alCerrar={() => setAbierto(false)}
          alGuardarExitoso={consulta.recargar}
          productos={consulta.datos.productos}
          bodegas={consulta.datos.bodegas}
          configuracion={consulta.datos.configuracion}
          hoy={consulta.datos.hoy}
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
      {etiqueta !== null && consulta.datos && (
        <EtiquetaLote
          datos={consulta.datos}
          id={etiqueta}
          cerrar={() => setEtiqueta(null)}
        />
      )}
      <Paginacion
        pagina={pagina}
        total={lotes.length}
        cambiar={cambiar}
        cargando={consulta.cargando}
      />
    </TransicionPagina>
  );
}
