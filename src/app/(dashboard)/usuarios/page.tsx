"use client";
import { useState } from "react";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { ModalCrearUsuario } from "@/componentes/modales/modal-crear-usuario";
import { useConsulta } from "@/lib/hooks/use-consulta";
import {
  obtenerUsuarios,
  obtenerPerfiles,
  obtenerSucursales,
} from "@/lib/servicios/usuarios";
import type { Usuario } from "@/tipos/database";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { coincide } from "@/lib/vistas/presentacion";
async function cargar() {
  const [usuarios, perfiles, sucursales] = await Promise.all([
    obtenerUsuarios(),
    obtenerPerfiles(),
    obtenerSucursales(),
  ]);
  return { usuarios, perfiles, sucursales };
}
export default function UsuariosPage() {
  const consulta = useConsulta(cargar);
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | undefined>();
  const limpiar = () => {
    setTexto("");
    setRol("");
  };
  const filas =
    consulta.datos?.usuarios.filter(
      (u) =>
        (!rol || u.perfil?.nombre === rol) &&
        coincide(texto, u.nombre, u.email),
    ) ?? [];
  return (
    <TransicionPagina>
      <Header
        titulo="Equipo y permisos"
        subtitulo="Cuentas institucionales, roles y asignación de sucursales."
      />
      <p className="mb-4 text-sm text-muted">
        ADMIN tiene alcance general sobre las sucursales. BODEGUERO y AUXILIAR
        operan en su sucursal asignada. Un gerente de sucursal es una propuesta
        pendiente; no está habilitado como permiso.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar usuarios"
          placeholder="Buscar nombre o correo"
          className="campo max-w-md"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select
          aria-label="Filtrar rol"
          className="campo w-auto!"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {consulta.datos?.perfiles.map((p) => (
            <option key={p.id_perfil}>{p.nombre}</option>
          ))}
        </select>
        <button
          disabled={!consulta.datos}
          className="boton-primario"
          onClick={() => {
            setUsuario(undefined);
            setAbierto(true);
          }}
        >
          {"+ Nuevo usuario"}
        </button>
      </div>
      {consulta.datos && (
        <ResumenConsulta
          cantidad={filas.length}
          total={consulta.datos.usuarios.length}
          unidad="registros del equipo"
          actualizado={consulta.actualizado}
          recargar={consulta.recargar}
          cargando={consulta.cargando}
          limpiar={limpiar}
        />
      )}
      <EstadoDatos
        {...consulta}
        vacio={!filas.length}
        filtrado={Boolean(texto || rol)}
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
                  <th>Colaborador</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Sucursal</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((u) => (
                  <tr key={u.id_usuario}>
                    <td className="font-medium">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="rounded-lg bg-acento-suave px-2 py-1 text-xs text-acento">
                        {u.perfil?.nombre === "ADMIN"
                          ? "Administrador general"
                          : u.perfil?.nombre}
                      </span>
                    </td>
                    <td>
                      {u.perfil?.nombre === "ADMIN"
                        ? "Todas las sucursales · alcance administrativo"
                        : u.sucursal?.nombre || "Sin sucursal asignada"}
                    </td>
                    <td
                      className={
                        u.auth_vinculado && u.activo
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                      }
                    >
                      {!u.auth_vinculado
                        ? "Histórico · sin acceso"
                        : u.activo
                          ? "Activo"
                          : "Inactivo"}
                    </td>
                    <td>
                      <button
                        disabled={!u.auth_vinculado}
                        title={
                          !u.auth_vinculado
                            ? "Autor histórico sin cuenta Auth. Se conserva su trazabilidad."
                            : undefined
                        }
                        className="boton-secundario"
                        onClick={() => {
                          setUsuario(u);
                          setAbierto(true);
                        }}
                      >
                        {"Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {consulta.datos && (
        <ModalCrearUsuario
          abierto={abierto}
          usuario={usuario}
          alCerrar={() => setAbierto(false)}
          alGuardarExitoso={consulta.recargar}
          perfiles={consulta.datos.perfiles}
          sucursales={consulta.datos.sucursales}
        />
      )}
    </TransicionPagina>
  );
}
