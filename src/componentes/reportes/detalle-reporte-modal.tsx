"use client";
import { useState, useCallback } from "react";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { PanelLateral } from "@/componentes/ui/panel-lateral";
import {
  crearPDF,
  crearLibroExcel,
  obtenerHistorialReportes,
  obtenerReporteArchivado,
} from "@/lib/servicios/reportes";
import {
  leerArchivoReporte,
  resumenTablaReporte,
} from "@/lib/vistas/archivo-reporte";
import { fechaHoraVisible } from "@/lib/vistas/presentacion";
export type EmisionReporte = Awaited<
  ReturnType<typeof obtenerHistorialReportes>
>[number];
export function DetalleReporteModal({
  reporte,
  cerrar,
}: {
  reporte: EmisionReporte;
  cerrar: () => void;
}) {
  const cargar = useCallback(
    () => obtenerReporteArchivado(reporte.id_reporte),
    [reporte.id_reporte],
  );
  const consulta = useConsulta(cargar, { intervaloMs: 0 });
  if (!consulta.datos || consulta.error)
    return (
      <PanelLateral
        titulo={`Informe #${reporte.id_reporte}`}
        cerrar={cerrar}
        etiquetaCerrar="Cerrar detalle del informe"
      >
        <EstadoDatos {...consulta} />
      </PanelLateral>
    );
  return (
    <DetalleReporteArchivado
      reporte={{
        ...consulta.datos,
        responsable: consulta.datos.archivo_autor ?? reporte.responsable,
      }}
      cerrar={cerrar}
    />
  );
}
function DetalleReporteArchivado({
  reporte,
  cerrar,
}: {
  reporte: EmisionReporte;
  cerrar: () => void;
}) {
  const archivo = leerArchivoReporte(reporte.contenido);
  const [ocupado, setOcupado] = useState(false),
    [error, setError] = useState("");
  async function descargar() {
    setOcupado(true);
    setError("");
    try {
      const actual = await obtenerReporteArchivado(reporte.id_reporte);
      const copia = leerArchivoReporte(actual?.contenido);
      if (!copia)
        throw new Error(
          "No hay contenido archivado disponible para esta emisión.",
        );
      if (actual?.formato === "PDF") {
        const doc = await crearPDF(
          copia.tablas[0],
          copia.farmacia,
          copia.ubicacion,
          copia.filtros,
          new Date(copia.emitido),
        );
        doc.save(copia.nombre + "-copia.pdf");
      } else if (actual?.formato === "XLS") {
        const libro = await crearLibroExcel(
          copia.tablas,
          {
            farmacia: copia.farmacia.razon_social,
            rut: copia.farmacia.rut,
            filtros: copia.filtros,
            direccion: copia.farmacia.direccion,
            director_tecnico: copia.farmacia.director_tecnico,
          },
          copia.emitido,
        );
        const xlsx = await import("xlsx");
        xlsx.writeFile(libro, copia.nombre + "-copia.xlsx");
      } else throw new Error("Formato de emisión no compatible.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo descargar la copia.",
      );
    } finally {
      setOcupado(false);
    }
  }
  return (
    <PanelLateral
      titulo={`Vista previa del informe #${reporte.id_reporte}`}
      cerrar={cerrar}
      etiquetaCerrar="Cerrar detalle del informe"
    >
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-muted">Generado por</dt>
          <dd>{archivo?.autor ?? reporte.responsable}</dd>
        </div>
        <div>
          <dt className="text-muted">Emisión</dt>
          <dd>
            {archivo
              ? new Intl.DateTimeFormat("es-CL", {
                  dateStyle: "full",
                  timeStyle: "long",
                  timeZone: "America/Santiago",
                }).format(new Date(archivo.emitido))
              : fechaHoraVisible(reporte.fecha_generacion)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Tipo / formato</dt>
          <dd>
            {archivo?.tablas.length === 3 ? "Informe completo" : reporte.tipo} ·{" "}
            {reporte.formato === "XLS" ? "Excel (.xlsx)" : reporte.formato}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Farmacia</dt>
          <dd>
            {archivo?.farmacia.razon_social ?? "No registrada en esta emisión"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Alcance y filtros originales</dt>
          <dd>
            {archivo?.filtros ?? "No conservados en el historial antiguo"}
          </dd>
        </div>
      </dl>
      {archivo ? (
        <div className="mt-6 space-y-6">
          {archivo.tablas.map((t, i) => {
            const s = resumenTablaReporte(t);
            return (
              <section key={i} className="space-y-3">
                <h3 className="font-semibold">{t.titulo}</h3>
                <p className="text-sm">
                  {s.registros} registros · {s.unidades.toLocaleString("es-CL")}{" "}
                  unidades{" "}
                  {t.columnas.includes("Operación")
                    ? "movilizadas (no equivalen al stock)"
                    : ""}
                </p>
                <p className="text-sm">
                  Valoración:{" "}
                  {s.valor === null
                    ? "No disponible para este informe"
                    : s.valor.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                  {s.sinCosto > 0 && s.valor !== null
                    ? ` · parcial: ${s.sinCosto} registros sin costo`
                    : ""}
                </p>
                <div className="overflow-x-auto">
                  <table className="tabla">
                    <thead>
                      <tr>
                        {t.columnas.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.filas.slice(0, 5).map((f, n) => (
                        <tr key={n}>
                          {f.map((c, j) => (
                            <td key={j}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted">
                  Primeros 5 registros; la copia incluye todos.
                </p>
              </section>
            );
          })}
          <p className="text-xs text-muted">
            Se regenera el documento con los datos y el membrete archivados.
            Incluye un espacio para firma manual, no una firma electrónica. No
            se consulta el inventario actual ni se crea otra emisión.
          </p>
        </div>
      ) : (
        <p role="status" className="my-6 rounded-xl bg-sutil p-4 text-sm">
          Esta emisión no conserva contenido archivado válido. No es posible
          recuperar sus totales ni reconstruir una copia fiel.
        </p>
      )}
      {error && (
        <p role="alert" className="my-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <button
        type="button"
        className="boton-primario mt-6 w-full justify-center"
        disabled={
          !archivo || ocupado || !["PDF", "XLS"].includes(reporte.formato ?? "")
        }
        onClick={() => void descargar()}
      >
        {ocupado ? "Preparando copia…" : "Volver a descargar copia"}
      </button>
    </PanelLateral>
  );
}
