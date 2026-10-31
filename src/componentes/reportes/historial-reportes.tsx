"use client";
import { usePaginaListado } from "@/lib/hooks/use-listado";
import { Paginacion } from "@/componentes/ui/paginacion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { obtenerHistorialReportes } from "@/lib/servicios/reportes";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { fechaHoraVisible } from "@/lib/vistas/presentacion";
import {
  filtrarEmisiones,
  periodoReporte,
  leerArchivoReporte,
} from "@/lib/vistas/archivo-reporte";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { type EmisionReporte } from "./detalle-reporte-modal";
const DetalleReporteModal = dynamic(() =>
  import("./detalle-reporte-modal").then((m) => m.DetalleReporteModal),
);
const vacio = { texto: "", tipo: "", formato: "", desde: "", hasta: "" };
export function HistorialReportes({
  revision = 0,
  hoy,
}: {
  revision?: number;
  hoy?: string;
}) {
  const consulta = useConsulta(obtenerHistorialReportes);
  const [filtro, setFiltro] = useState(vacio),
    [seleccion, setSeleccion] = useState<EmisionReporte | null>(null);
  const { pagina, cambiar } = usePaginaListado(JSON.stringify(filtro));
  const { recargar } = consulta;
  useEffect(() => {
    if (revision) void recargar();
  }, [revision, recargar]);
  const filas = filtrarEmisiones(consulta.datos ?? [], filtro);
  const invalido = Boolean(
    filtro.desde && filtro.hasta && filtro.desde > filtro.hasta,
  );
  const limpiar = () => setFiltro(vacio);
  return (
    <section
      className="panel mt-6 min-w-0"
      aria-labelledby="historial-emisiones"
    >
      <h2 id="historial-emisiones" className="font-semibold">
        Historial de emisiones
      </h2>
      <p className="my-3 text-xs text-muted">
        Emisiones autorizadas en Supabase. Las fechas corresponden a la emisión
        y son independientes de los filtros de arriba. Una emisión registrada no
        confirma que el archivo se haya guardado en el dispositivo.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm">
          Buscar
          <input
            aria-label="Buscar emisiones"
            placeholder="Número, tipo o responsable"
            className="campo mt-1"
            value={filtro.texto}
            onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Tipo de informe
          <select
            aria-label="Tipo del historial"
            className="campo mt-1"
            value={filtro.tipo}
            onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="INVENTARIO">Inventario</option>
            <option value="MERMAS">Mermas</option>
            <option value="ROTACION">Rotación / movimientos</option>
          </select>
        </label>
        <label className="text-sm">
          Formato
          <select
            aria-label="Formato del historial"
            className="campo mt-1"
            value={filtro.formato}
            onChange={(e) => setFiltro({ ...filtro, formato: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="PDF">PDF</option>
            <option value="XLS">XLS / Excel (.xlsx)</option>
          </select>
        </label>
        <label className="text-sm">
          Emisión desde
          <input
            type="date"
            aria-label="Emisión desde"
            aria-invalid={invalido}
            className="campo mt-1"
            value={filtro.desde}
            onChange={(e) => setFiltro({ ...filtro, desde: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Emisión hasta
          <input
            type="date"
            aria-label="Emisión hasta"
            aria-invalid={invalido}
            min={filtro.desde || undefined}
            className="campo mt-1"
            value={filtro.hasta}
            onChange={(e) => setFiltro({ ...filtro, hasta: e.target.value })}
          />
        </label>
      </div>
      <div className="my-3 flex flex-wrap gap-2">
        {(
          [
            ["mes", "Mes actual"],
            ["trimestre", "Último trimestre"],
            ["todo", "Ver todo"],
          ] as const
        ).map(([p, n]) => (
          <button
            type="button"
            className="boton-secundario"
            key={p}
            disabled={p !== "todo" && !hoy}
            onClick={() =>
              setFiltro({ ...filtro, ...periodoReporte(hoy ?? "", p) })
            }
          >
            {n}
          </button>
        ))}
      </div>
      {invalido && (
        <p role="alert" className="my-3 text-sm text-red-700 dark:text-red-300">
          La fecha inicial no puede superar la final.
        </p>
      )}
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.length}
          unidad="emisiones"
          actualizado={consulta.actualizado}
          recargar={recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      {!invalido && (
        <EstadoDatos
          {...consulta}
          vacio={!filas.length}
          filtrado={Object.values(filtro).some(Boolean)}
          limpiar={limpiar}
        />
      )}
      {!invalido &&
        !consulta.error &&
        !consulta.cargando &&
        filas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Emisión</th>
                  <th>Fecha</th>
                  <th>Informe</th>
                  <th>Formato</th>
                  <th>Responsable</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filas.slice((pagina - 1) * 25, pagina * 25).map((r) => {
                  const archivo = leerArchivoReporte(r.contenido);
                  return (
                    <tr
                      key={r.id_reporte}
                      className="cursor-pointer transition hover:bg-sutil"
                      onClick={() => setSeleccion(r)}
                    >
                      <td>#{r.id_reporte}</td>
                      <td>
                        {fechaHoraVisible(
                          archivo?.emitido ??
                            r.archivo_emitido ??
                            r.fecha_generacion,
                        )}
                      </td>
                      <td>
                        {archivo?.tablas.length === 3 ||
                        r.archivo_nombre?.startsWith("SIGAF-completo-")
                          ? "Completo"
                          : r.tipo === "ROTACION"
                            ? "Rotación / movimientos"
                            : r.tipo}
                      </td>
                      <td>{r.formato}</td>
                      <td>{r.responsable}</td>
                      <td>
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          className="boton-secundario"
                          aria-label={`Ver informe #${r.id_reporte}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSeleccion(r);
                          }}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      <Paginacion
        pagina={pagina}
        total={filas.length}
        cambiar={cambiar}
        cargando={consulta.cargando}
      />
      {seleccion && (
        <DetalleReporteModal
          reporte={seleccion}
          cerrar={() => setSeleccion(null)}
        />
      )}
    </section>
  );
}
