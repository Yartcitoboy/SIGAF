"use client";
import { useState } from "react";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";
export default function InventarioPage() {
  const consulta = useConsulta(obtenerOperacion);
  const [texto, setTexto] = useState("");
  const [bodega, setBodega] = useState("");
  const [estado, setEstado] = useState("");
  const filas =
    consulta.datos?.inventario.filter(
      (i) =>
        (!bodega || String(i.id_bodega) === bodega) &&
        (!estado || i.estado_semaforo === estado) &&
        [
          i.lote?.producto?.nombre,
          i.lote?.producto?.codigo_barras,
          i.lote?.producto?.principio_activo,
          i.lote?.numero_lote,
        ].some((v) => v?.toLowerCase().includes(texto.toLowerCase())),
    ) ?? [];
  return (
    <TransicionPagina>
      <Header
        titulo="Inventario"
        subtitulo="Existencias por lote y ubicación. Consulta de stock vigente y caducado."
      />
      <div className="panel flex flex-wrap gap-3">
        <input
          className="campo flex-1 basis-60"
          aria-label="Buscar en inventario"
          placeholder="Nombre, principio activo, código o lote"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select
          aria-label="Bodega"
          className="campo w-auto!"
          value={bodega}
          onChange={(e) => setBodega(e.target.value)}
        >
          <option value="">Todas las bodegas</option>
          {consulta.datos?.bodegas.map((b) => (
            <option key={b.id_bodega} value={b.id_bodega}>
              {b.nombre}
            </option>
          ))}
        </select>
        <select
          aria-label="Riesgo"
          className="campo w-auto!"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {["VERDE", "AMARILLO", "NARANJO", "VENCIDO"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <EstadoDatos {...consulta} vacio={!filas.length} />
      {consulta.datos &&
        !consulta.cargando &&
        !consulta.error &&
        filas.length > 0 && (
          <div className="panel overflow-x-auto p-0!">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Medicamento / lote</th>
                  <th>Ubicación</th>
                  <th>Stock físico</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((i) => (
                  <tr key={i.id_inventario}>
                    <td>
                      <p className="font-medium">{i.lote?.producto?.nombre}</p>
                      <p className="text-xs text-muted">
                        {i.lote?.numero_lote} ·{" "}
                        {i.lote?.producto?.codigo_barras}
                      </p>
                    </td>
                    <td>
                      {i.bodega?.nombre}
                      <p className="text-xs text-muted">
                        {i.bodega?.ubicacion} ·{" "}
                        {i.bodega?.es_sala_ventas ? "Sala de ventas" : "Bodega"}
                      </p>
                    </td>
                    <td className="font-semibold">{i.stock_actual}</td>
                    <td>{i.lote?.fecha_vencimiento}</td>
                    <td>
                      <SemaforoBadge
                        estado={i.estado_semaforo}
                        diasRestantes={i.lote?.dias_restantes}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </TransicionPagina>
  );
}
