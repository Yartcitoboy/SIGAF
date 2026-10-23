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
import { useRol } from "@/context/rol-context";
async function cargar() {
  const [usuarios, perfiles, sucursales] = await Promise.all([
    obtenerUsuarios(),
    obtenerPerfiles(),
    obtenerSucursales(),
  ]);
  return { usuarios, perfiles, sucursales };
}
export default function UsuariosPage() {
  const { perfilActual } = useRol();
  const consulta = useConsulta(cargar);
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | undefined>();
  const filas =
    consulta.datos?.usuarios.filter(
      (u) =>
        (!rol || u.perfil?.nombre === rol) &&
        [u.nombre, u.email].some((v) =>
          v.toLowerCase().includes(texto.toLowerCase()),
        ),
    ) ?? [];
  return (
    <TransicionPagina>
      <Header
        titulo="Equipo y permisos"
        subtitulo="Cuentas institucionales, roles y asignación de sucursales."
      />
      {perfilActual.accesoLocal && (
        <p className="mb-4 text-sm text-muted">
          Se consultan los usuarios de Supabase. El acceso temporal no permite
          crear, editar ni cambiar credenciales de cuentas institucionales.
        </p>
      )}
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
          disabled={!consulta.datos || perfilActual.accesoLocal}
          className="boton-primario"
          onClick={() => {
            setUsuario(undefined);
            setAbierto(true);
          }}
        >
          + Nuevo usuario
        </button>
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
                        {u.perfil?.nombre}
                      </span>
                    </td>
                    <td>{u.sucursal?.nombre || "Todas"}</td>
                    <td
                      className={
                        u.activo
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                      }
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </td>
                    <td>
                      <button
                        disabled={perfilActual.accesoLocal}
                        title={
                          perfilActual.accesoLocal
                            ? "Cuenta temporal fija"
                            : undefined
                        }
                        className="font-medium text-acento"
                        onClick={() => {
                          setUsuario(u);
                          setAbierto(true);
                        }}
                      >
                        Editar
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
