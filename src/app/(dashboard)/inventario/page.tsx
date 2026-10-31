"use client";
import { useRol } from "@/context/rol-context";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerPaginaInventario } from "@/lib/servicios/listados";
import { useBusquedaDiferida, usePaginaListado } from "@/lib/hooks/use-listado";
import { Paginacion } from "@/componentes/ui/paginacion";
import { BotonDetalle } from "@/componentes/productos/boton-detalle";
const DetalleProducto = dynamic(() =>
  import("@/componentes/productos/detalle-producto").then(
    (m) => m.DetalleProducto,
  ),
);
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { tipoUbicacion, fechaVisible } from "@/lib/vistas/presentacion";
export default function InventarioPage() {
  const { perfilActual } = useRol();
  const [texto, setTexto] = useState("");
  const [bodega, setBodega] = useState("");
  const [estado, setEstado] = useState<
    "" | "VERDE" | "AMARILLO" | "NARANJO" | "VENCIDO"
  >("");
  const [orden, setOrden] = useState<"vencimiento" | "stock" | "nombre">(
    "vencimiento",
  );
  const [detalle, setDetalle] = useState<number | null>(null);
  const limpiar = () => {
    setTexto("");
    setBodega("");
    setEstado("");
    setOrden("vencimiento");
  };
  const busqueda = useBusquedaDiferida(texto);
  const { pagina, cambiar } = usePaginaListado(
    JSON.stringify([busqueda, bodega, estado, orden]),
  );
  const cargar = useCallback(
    () =>
      obtenerPaginaInventario(
        pagina,
        busqueda,
        bodega,
        estado,
        orden,
        perfilActual.id_usuario,
      ),
    [pagina, busqueda, bodega, estado, orden, perfilActual.id_usuario],
  );
  const consulta = useConsulta(cargar);
  const filas = consulta.datos?.inventario ?? [];
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
          onChange={(e) => setEstado(e.target.value as typeof estado)}
        >
          <option value="">Todos los estados</option>
          {[
            ["VERDE", "Vigente"],
            ["AMARILLO", "Preventivo"],
            ["NARANJO", "Crítico"],
            ["VENCIDO", "Caducado"],
          ].map(([s, nombre]) => (
            <option key={s} value={s}>
              {nombre}
            </option>
          ))}
        </select>
        <select
          aria-label="Orden del inventario"
          className="campo w-auto!"
          value={orden}
          onChange={(e) => setOrden(e.target.value as typeof orden)}
        >
          <option value="vencimiento">Vencimiento más próximo</option>
          <option value="stock">Menor stock primero</option>
          <option value="nombre">Nombre del medicamento</option>
        </select>
      </div>
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.total}
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length}
        filtrado={Boolean(texto || bodega || estado)}
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
                      <BotonDetalle
                        nombre={i.lote?.producto?.nombre ?? "producto"}
                        abrir={() => setDetalle(i.id_lote)}
                      >
                        {i.lote?.producto?.nombre ?? "Producto no disponible"}
                      </BotonDetalle>
                      <p className="text-xs text-muted">
                        {i.lote?.numero_lote} ·{" "}
                        {i.lote?.producto?.codigo_barras}
                      </p>
                    </td>
                    <td>
                      {i.bodega?.nombre}
                      <p className="text-xs text-muted">
                        {i.bodega?.ubicacion} · {tipoUbicacion(i.bodega)}
                      </p>
                    </td>
                    <td className="font-semibold">
                      {i.stock_actual}
                      <p className="mt-1 text-xs font-normal text-muted">
                        {i.lote?.producto?.unidad_medida ||
                          "Unidad sin especificar"}
                      </p>
                      {i.stock_actual === 0 && (
                        <span className="text-xs text-muted">Agotado</span>
                      )}
                    </td>
                    <td>{fechaVisible(i.lote?.fecha_vencimiento)}</td>
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
      {consulta.datos && (
        <Paginacion
          pagina={pagina}
          total={consulta.datos.total}
          cambiar={cambiar}
          cargando={consulta.cargando}
        />
      )}
      {detalle !== null && consulta.datos && (
        <DetalleProducto
          referencia={{ tipo: "lote", id: detalle }}
          cerrar={() => setDetalle(null)}
        />
      )}
    </TransicionPagina>
  );
}
