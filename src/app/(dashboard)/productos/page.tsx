"use client";
import { useState } from "react";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { ModalCrearProducto } from "@/componentes/modales/modal-crear-producto";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerProductos, obtenerCategorias } from "@/lib/servicios/productos";
import { useRol } from "@/context/rol-context";
import type { Producto } from "@/tipos/database";
import { coincide } from "@/lib/vistas/presentacion";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import {
  BotonDetalle,
  DetalleProducto,
} from "@/componentes/productos/detalle-producto";
async function cargar() {
  const [productos, categorias] = await Promise.all([
    obtenerProductos(),
    obtenerCategorias(),
  ]);
  return { productos, categorias };
}
export default function ProductosPage() {
  const consulta = useConsulta(cargar);
  const { rolActual } = useRol();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [producto, setProducto] = useState<Producto | undefined>();
  const [detalle, setDetalle] = useState<number | null>(null);
  const tieneRegistroIsp = consulta.datos?.productos.some((p) =>
    Object.hasOwn(p, "registro_isp"),
  );
  const limpiar = () => {
    setTexto("");
    setCategoria("");
  };
  const filas =
    consulta.datos?.productos.filter(
      (p) =>
        (!categoria || String(p.id_categoria) === categoria) &&
        coincide(
          texto,
          p.nombre,
          p.codigo_barras,
          p.principio_activo,
          p.descripcion,
          p.registro_isp,
        ),
    ) ?? [];
  return (
    <TransicionPagina>
      <Header
        titulo="Catálogo de medicamentos"
        subtitulo="Productos y categorías consultados directamente desde Supabase."
      />
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar medicamentos"
          placeholder="Nombre, principio activo o código"
          className="campo max-w-md"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select
          aria-label="Categoría"
          className="campo w-auto!"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {consulta.datos?.categorias.map((c) => (
            <option key={c.id_categoria} value={c.id_categoria}>
              {c.nombre}
            </option>
          ))}
        </select>
        {rolActual === "ADMIN" && (
          <button
            disabled={!consulta.datos}
            className="boton-primario"
            onClick={() => {
              setProducto(undefined);
              setAbierto(true);
            }}
          >
            {"+ Nuevo medicamento"}
          </button>
        )}
      </div>
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.productos.length}
          unidad="productos · Supabase"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length}
        filtrado={Boolean(texto || categoria)}
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
                  <th>Medicamento</th>
                  <th>Código</th>
                  <th>Presentación</th>
                  <th>Categoría</th>
                  {tieneRegistroIsp && <th>Registro ISP</th>}
                  {rolActual === "ADMIN" && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {filas.map((p) => (
                  <tr key={p.id_producto}>
                    <td>
                      <BotonDetalle
                        nombre={p.nombre}
                        abrir={() => setDetalle(p.id_producto)}
                      >
                        {p.nombre}
                      </BotonDetalle>
                      <p className="mt-1 text-xs text-muted">
                        {p.principio_activo || p.descripcion}
                      </p>
                    </td>
                    <td className="font-mono text-xs">
                      {p.codigo_barras || "Sin código"}
                    </td>
                    <td>{p.unidad_medida || "Sin presentación registrada"}</td>
                    <td>
                      {
                        consulta.datos!.categorias.find(
                          (c) => c.id_categoria === p.id_categoria,
                        )?.nombre
                      }
                    </td>
                    {tieneRegistroIsp && (
                      <td>{p.registro_isp || "Sin registrar"}</td>
                    )}
                    {rolActual === "ADMIN" && (
                      <td>
                        <button
                          className="boton-secundario"
                          onClick={() => {
                            setProducto(p);
                            setAbierto(true);
                          }}
                        >
                          {"Editar"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {consulta.datos && rolActual === "ADMIN" && (
        <ModalCrearProducto
          abierto={abierto}
          producto={producto}
          alCerrar={() => setAbierto(false)}
          alGuardarExitoso={consulta.recargar}
          categorias={consulta.datos.categorias}
        />
      )}
      {detalle !== null && consulta.datos && (
        <DetalleProducto
          key={detalle}
          referencia={{ tipo: "producto", id: detalle }}
          productoInicial={consulta.datos.productos.find(
            (p) => p.id_producto === detalle,
          )}
          categorias={consulta.datos.categorias}
          cerrar={() => setDetalle(null)}
        />
      )}
    </TransicionPagina>
  );
}
