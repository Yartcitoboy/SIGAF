"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialogo } from "@/componentes/ui/dialogo";
import {
  crearUsuario,
  editarUsuario,
  restablecerPassword,
} from "@/lib/servicios/usuarios";
import type { Perfil, Sucursal, Usuario } from "@/tipos/database";
interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  perfiles: Perfil[];
  sucursales: Sucursal[];
  usuario?: Usuario;
}
export function ModalCrearUsuario(props: Props) {
  return props.abierto ? (
    <Formulario key={props.usuario?.id_usuario || "nuevo"} {...props} />
  ) : null;
}
function Formulario({
  alCerrar,
  alGuardarExitoso,
  perfiles,
  sucursales,
  usuario,
}: Props) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [perfilId, setPerfilId] = useState(String(usuario?.id_perfil || ""));
  const esAdmin =
    perfiles.find((p) => String(p.id_perfil) === perfilId)?.nombre === "ADMIN";
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    if (
      !reset &&
      (!String(f.get("nombre") || "").trim() ||
        !perfilId ||
        (!esAdmin && !f.get("sucursal")))
    ) {
      setError("Indica nombre, rol y una sucursal para el personal operativo.");
      return;
    }
    setOcupado(true);
    try {
      if (reset && usuario) {
        await restablecerPassword(
          usuario.id_usuario,
          String(f.get("password")),
        );
        toast.success("Contraseña restablecida");
        setReset(false);
        return;
      }
      const datos = {
        nombre: String(f.get("nombre")),
        email: String(f.get("email")),
        id_perfil: Number(f.get("perfil")),
        id_sucursal: f.get("sucursal") ? Number(f.get("sucursal")) : null,
        activo: f.get("activo") === "on",
        ...(!usuario ? { password: String(f.get("password")) } : {}),
      };
      if (usuario) await editarUsuario(usuario.id_usuario, datos);
      else await crearUsuario(datos);
      toast.success(
        usuario ? "Cuenta actualizada" : "Cuenta creada en Supabase Auth",
      );
      alGuardarExitoso();
      alCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <Dialogo
      titulo={
        reset
          ? "Restablecer contraseña"
          : usuario
            ? "Editar usuario"
            : "Nuevo usuario"
      }
      cerrar={alCerrar}
      ocupado={ocupado}
    >
      <form onSubmit={guardar}>
        <fieldset disabled={ocupado} className="min-w-0 space-y-4">
          {!reset && (
            <>
              <label className="block text-sm">
                Nombre completo
                <input
                  name="nombre"
                  required
                  minLength={2}
                  maxLength={120}
                  defaultValue={usuario?.nombre}
                  className="campo mt-1"
                />
              </label>
              <label className="block text-sm">
                Correo
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={usuario?.email}
                  className="campo mt-1"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  Rol
                  <select
                    name="perfil"
                    aria-label="Rol de la cuenta"
                    required
                    value={perfilId}
                    onChange={(e) => setPerfilId(e.target.value)}
                    className="campo mt-1"
                  >
                    <option value="">Seleccionar rol</option>
                    {perfiles.map((p) => (
                      <option key={p.id_perfil} value={p.id_perfil}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Sucursal
                  <select
                    name="sucursal"
                    aria-label="Sucursal de la cuenta"
                    required={!esAdmin}
                    defaultValue={usuario?.id_sucursal || ""}
                    className="campo mt-1"
                  >
                    <option value="">
                      {esAdmin
                        ? "Todas las sucursales"
                        : "Selecciona una sucursal"}
                    </option>
                    {sucursales.map((s) => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-xs text-muted">
                {esAdmin
                  ? "Alcance general actual: seleccionar una sucursal de referencia no limita los permisos de ADMIN."
                  : "Acceso operativo de la sucursal seleccionada. No otorga administración de otras sucursales."}{" "}
                Los permisos reales los verifica el backend; esta vista no crea
                roles nuevos.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="activo"
                  defaultChecked={usuario?.activo ?? true}
                />
                Cuenta activa
              </label>
            </>
          )}
          {(!usuario || reset) && (
            <label className="block text-sm">
              {reset ? "Nueva contraseña" : "Contraseña inicial"}
              <input
                name="password"
                type="password"
                minLength={12}
                maxLength={128}
                required
                autoComplete="new-password"
                className="campo mt-1"
              />
              <span className="text-xs text-muted">Mínimo 12 caracteres.</span>
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button disabled={ocupado} className="boton-primario">
              {ocupado
                ? "Guardando…"
                : reset
                  ? "Restablecer contraseña"
                  : "Guardar cuenta"}
            </button>
            {usuario && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  setReset(!reset);
                  setError(null);
                }}
                className="boton-secundario"
              >
                {reset ? "Volver a edición" : "Cambiar contraseña"}
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </Dialogo>
  );
}
