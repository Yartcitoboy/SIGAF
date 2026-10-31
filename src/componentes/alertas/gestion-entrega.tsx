"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useConsulta } from "@/lib/hooks/use-consulta";
import {
  obtenerEstadoEntrega,
  solicitarEntrega,
  estadoCorreoVisible,
} from "@/lib/servicios/entrega-alertas";
import { fechaHoraVisible } from "@/lib/vistas/presentacion";
export function GestionEntregaAlertas({
  soloPersonal = false,
}: {
  soloPersonal?: boolean;
}) {
  const consulta = useConsulta(obtenerEstadoEntrega, {
      conservarDatosEnError: true,
    }),
    [ocupado, setOcupado] = useState(false),
    [error, setError] = useState<string | null>(null),
    [errorEnGoogle, setErrorEnGoogle] = useState(false),
    [configuracionGuardada, setConfiguracionGuardada] = useState(false),
    [urlGoogle, setUrlGoogle] = useState<string | null>(null);
  const d = consulta.datos;
  async function accion(
    datos: { accion: string; [clave: string]: unknown },
    mensaje?: string,
  ) {
    setOcupado(true);
    setError(null);
    setErrorEnGoogle(
      datos.accion === "configurar" || datos.accion === "conectar",
    );
    try {
      const r = await solicitarEntrega(datos);
      if (r.url) setUrlGoogle(r.url);
      if (mensaje) toast.success(mensaje);
      await consulta.recargar();
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo completar la operación.",
      );
      return false;
    } finally {
      setOcupado(false);
    }
  }
  function confirmar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void accion(
      {
        accion: "confirmar_codigo",
        codigo: String(new FormData(e.currentTarget).get("codigo")),
      },
      "Correo confirmado para los próximos resúmenes.",
    );
  }
  async function configurar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    setUrlGoogle(null);
    setConfiguracionGuardada(false);
    const guardado = await accion(
      {
        accion: "configurar",
        cliente: String(f.get("cliente")).trim(),
        secreto: String(f.get("secreto")).trim(),
        activo: f.get("activo") === "on",
      },
      "Configuración guardada. Conecta la cuenta en Google.",
    );
    const secreto = form.elements.namedItem(
      "secreto",
    ) as HTMLInputElement | null;
    if (guardado) {
      if (secreto) secreto.value = "";
      setConfiguracionGuardada(true);
    }
  }
  if (consulta.error && !d)
    return (
      <section className="panel mb-5">
        <p role="alert">{consulta.error}</p>
        <button
          className="boton-secundario mt-3"
          onClick={() => void consulta.recargar()}
        >
          Volver a consultar
        </button>
      </section>
    );
  if (!d)
    return (
      <p role="status" className="my-4 text-sm text-muted">
        Consultando correo de alertas…
      </p>
    );
  return (
    <section
      className="mb-6 space-y-4"
      aria-label="Entrega de alertas por correo"
    >
      {consulta.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 p-3 text-sm text-red-700 dark:text-red-300"
        >
          No se pudo actualizar el estado: {consulta.error}. Los datos visibles
          son de la última consulta. Tu formulario se conserva.
          <button
            type="button"
            className="boton-secundario ml-3"
            disabled={ocupado || consulta.cargando}
            onClick={() => void consulta.recargar()}
          >
            Actualizar estado
          </button>
        </p>
      )}
      {error && !errorEnGoogle && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}
      <div className="panel space-y-3">
        <h2 className="font-semibold">Tu correo de alertas</h2>
        <p className="break-all text-sm">{d.email}</p>
        {!d.correo_admitido ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            Esta dirección es de prueba o tiene un formato inválido. Pide a
            Admin que la cambie por tu Gmail existente o tu correo institucional
            real. Tus avisos dentro de SIGAF siguen disponibles.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {d.confirmado
                ? "Buzón confirmado. Recibirás el próximo resumen si hay productos con alerta en tu alcance."
                : "Confirma que puedes recibir correo en este buzón antes de recibir datos de inventario."}
            </p>
            {!d.confirmado && (
              <>
                <button
                  type="button"
                  disabled={ocupado || !d.gmail_conectado || !d.correo_activo}
                  className="boton-secundario"
                  onClick={() =>
                    void accion(
                      { accion: "solicitar_codigo" },
                      "Código enviado. Revisa tu Gmail y la carpeta Spam.",
                    )
                  }
                >
                  {ocupado ? "Procesando…" : "Enviar código a mi correo"}
                </button>
                <form
                  onSubmit={confirmar}
                  className="flex flex-wrap items-end gap-3"
                >
                  <label className="text-sm">
                    Código recibido
                    <input
                      name="codigo"
                      aria-label="Código de confirmación del correo"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      minLength={6}
                      maxLength={6}
                      required
                      className="campo mt-1 max-w-44"
                      placeholder="6 dígitos"
                    />
                  </label>
                  <button disabled={ocupado} className="boton-primario">
                    Confirmar mi correo
                  </button>
                </form>
                <p className="text-xs text-muted">
                  El código vence en 15 minutos. Solo confirma tu buzón; no
                  cambia tu contraseña.
                </p>
              </>
            )}
          </>
        )}
        {(!d.gmail_conectado || !d.correo_activo) && (
          <p className="rounded-lg bg-sutil p-3 text-sm">
            El envío está pendiente de que Admin conecte y active Gmail. Las
            notificaciones de SIGAF funcionan por separado.
          </p>
        )}
        <p className="text-xs text-muted">
          Corte diario: 00:00, hora de Chile. Vencidos, vencen hoy, críticos y
          próximos a vencer, con stock. Primer corte programado:{" "}
          {d.fecha_inicio}. No se envía un correo vacío.
        </p>
        {d.ultimo_resumen && (
          <p className="text-xs">
            Último resumen {d.ultimo_resumen.fecha}:{" "}
            {estadoCorreoVisible(d.ultimo_resumen.estado)}
            {d.ultimo_resumen.error ? " · " + d.ultimo_resumen.error : ""}
          </p>
        )}
      </div>
      {!soloPersonal && d.administracion && (
        <details className="panel" open={!d.gmail_conectado}>
          <summary className="cursor-pointer font-semibold">
            Gmail y envío diario · Administración
          </summary>
          <div className="mt-4 space-y-5">
            <p className="text-sm">
              {d.administracion.cron_activo
                ? "Programación en Supabase activa."
                : "La programación todavía no está disponible."}{" "}
              {d.gmail_conectado
                ? "Gmail vinculado: " + d.administracion.remitente
                : "Falta vincular el Gmail remitente."}
            </p>
            {d.administracion.error && (
              <p
                role="alert"
                className="text-sm text-red-700 dark:text-red-300"
              >
                {d.administracion.error}
              </p>
            )}
            <p className="text-sm text-muted">
              Usa un cliente OAuth de tipo Aplicación web en tu proyecto de
              Google Cloud con Gmail API habilitada. SIGAF solicita permiso para
              enviar y conocer el correo remitente; no solicita leer el buzón.
            </p>
            <p className="break-all rounded-lg bg-sutil p-3 text-xs">
              URI de redirección autorizada:
              <br />
              {process.env.NEXT_PUBLIC_SUPABASE_URL}
              /functions/v1/sigaf-alertas?oauth=callback
            </p>
            <form
              onSubmit={configurar}
              className="space-y-3"
              aria-label="Configuración de Google"
              aria-describedby={
                error && errorEnGoogle
                  ? "error-configuracion-google"
                  : undefined
              }
              onChange={() => setConfiguracionGuardada(false)}
            >
              <label className="block text-sm">
                ID del cliente de Google
                <input
                  name="cliente"
                  required
                  defaultValue={d.administracion.cliente ?? ""}
                  placeholder="…apps.googleusercontent.com"
                  className="campo mt-1"
                  autoComplete="off"
                />
              </label>
              <label className="block text-sm">
                Secreto del cliente de Google
                <input
                  name="secreto"
                  type="password"
                  required={!d.proveedor_configurado}
                  maxLength={500}
                  className="campo mt-1"
                  autoComplete="off"
                  placeholder={
                    d.proveedor_configurado
                      ? "Guardado. Deja vacío para conservarlo"
                      : "Se guarda de forma segura en Supabase"
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="activo"
                  type="checkbox"
                  defaultChecked={d.correo_activo}
                />
                Mantener activos los envíos de la cuenta vinculada
              </label>
              <p className="text-xs text-muted">
                Cambiar el ID del cliente requiere volver a autorizar Gmail. La
                conexión con Google activa el envío a destinatarios confirmados.
              </p>
              <button disabled={ocupado} className="boton-primario">
                {ocupado ? "Procesando…" : "Guardar configuración de Google"}
              </button>
              {error && errorEnGoogle && (
                <p
                  id="error-configuracion-google"
                  role="alert"
                  className="rounded-lg border border-red-200 p-3 text-sm text-red-700 dark:text-red-300"
                >
                  {error}. Si no se guardó, los datos del formulario se
                  conservan para reintentarlo.
                </p>
              )}
              {configuracionGuardada && (
                <p role="status" className="text-sm text-muted">
                  Configuración guardada.{" "}
                  {d.proveedor_configurado
                    ? "Ya puedes conectar o renovar Gmail."
                    : "Actualiza el estado para comprobar la conexión disponible."}
                </p>
              )}
            </form>
            <button
              type="button"
              disabled={ocupado || !d.proveedor_configurado}
              onClick={() => void accion({ accion: "conectar" })}
              className="boton-secundario"
            >
              Conectar o renovar Gmail
            </button>
            {urlGoogle && (
              <a
                href={urlGoogle}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-primario ml-3"
              >
                Continuar en Google
              </a>
            )}
            <p className="text-xs text-muted">
              En Google, autoriza la cuenta que enviará los correos. Al
              terminar, vuelve aquí. La configuración se actualiza
              automáticamente.
            </p>
            <h3 className="font-semibold">Destinatarios del equipo</h3>
            <div className="overflow-x-auto">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Persona / rol</th>
                    <th>Correo</th>
                    <th>Recepción</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {d.administracion.destinatarios.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>
                        {u.nombre}
                        <br />
                        <span className="text-xs text-muted">{u.rol}</span>
                      </td>
                      <td className="break-all">{u.email}</td>
                      <td>
                        {!u.correo_admitido
                          ? "Reemplazar dirección de prueba"
                          : u.confirmado
                            ? "Buzón confirmado"
                            : "Confirmación pendiente"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="boton-secundario"
                          disabled={
                            ocupado ||
                            !u.correo_admitido ||
                            u.confirmado ||
                            !d.gmail_conectado ||
                            !d.correo_activo
                          }
                          onClick={() =>
                            void accion(
                              {
                                accion: "solicitar_codigo",
                                id_usuario: u.id_usuario,
                              },
                              "Código enviado. La persona debe confirmarlo en su sesión de SIGAF.",
                            )
                          }
                        >
                          Enviar código
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {d.administracion.ultima_ejecucion && (
              <p className="text-xs text-muted">
                Último corte:{" "}
                {fechaHoraVisible(d.administracion.ultima_ejecucion)}
              </p>
            )}
            {d.administracion.envios_recientes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Destinatario</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.administracion.envios_recientes.map((e, i) => (
                      <tr key={e.fecha_resumen + e.destinatario + i}>
                        <td>{e.fecha_resumen}</td>
                        <td>{e.destinatario}</td>
                        <td>
                          {estadoCorreoVisible(e.estado)}
                          {e.error && (
                            <p className="text-xs text-muted">{e.error}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted">
              “Aceptado por Gmail” no confirma llegada a la bandeja principal.
              Si un envío quedó incierto, se requiere revisión para evitar
              duplicados.
            </p>
          </div>
        </details>
      )}
    </section>
  );
}
