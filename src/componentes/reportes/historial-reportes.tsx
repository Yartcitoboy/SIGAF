"use client";
import { useState } from "react";
import { obtenerHistorialReportes } from "@/lib/servicios/reportes";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { coincide, fechaHoraVisible } from "@/lib/vistas/presentacion";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { EstadoDatos } from "@/componentes/ui/estado-datos";

export function HistorialReportes() {
  const consulta = useConsulta(obtenerHistorialReportes);
  const [texto, setTexto] = useState("");
  const filas =
    consulta.datos?.filter((r) =>
      coincide(texto, r.tipo, r.formato, r.responsable, r.id_usuario),
    ) ?? [];
  return (
    <section
      className="panel mt-6 min-w-0"
      aria-labelledby="historial-emisiones"
    >
      <h2 id="historial-emisiones" className="font-semibold">
        Historial de emisiones registradas en Supabase
      </h2>
      <p className="my-3 text-xs text-muted">
        Se muestran las emisiones registradas en Supabase para tu cuenta. El
        historial no guarda los filtros ni los archivos originales y no se
        filtra por la farmacia seleccionada arriba.
      </p>
      <input
        aria-label="Buscar emisiones"
        placeholder="Tipo, formato o responsable"
        className="campo max-w-lg"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.length}
          unidad="emisiones"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={() => setTexto("")}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length}
        filtrado={Boolean(texto)}
        limpiar={() => setTexto("")}
      />
      {!consulta.error && !consulta.cargando && filas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col">Emisión</th>
                <th scope="col">Fecha</th>
                <th scope="col">Informe</th>
                <th scope="col">Formato registrado</th>
                <th scope="col">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id_reporte}>
                  <td>#{r.id_reporte}</td>
                  <td>{fechaHoraVisible(r.fecha_generacion)}</td>
                  <td>
                    {r.tipo === "ROTACION" ? "Libro de movimientos" : r.tipo}
                  </td>
                  <td>{r.formato}</td>
                  <td title={r.id_usuario}>{r.responsable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
