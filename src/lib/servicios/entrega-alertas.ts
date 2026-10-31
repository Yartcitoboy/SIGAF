export interface EstadoEntrega {
  email: string;
  correo_admitido: boolean;
  confirmado: boolean;
  proveedor_configurado: boolean;
  gmail_conectado: boolean;
  correo_activo: boolean;
  fecha_chile: string;
  fecha_inicio: string;
  ultimo_resumen: {
    fecha: string;
    estado: string;
    error: string | null;
  } | null;
  administracion: {
    cliente: string | null;
    remitente: string | null;
    error: string | null;
    cron_activo: boolean;
    ultima_fecha: string | null;
    ultima_ejecucion: string | null;
    destinatarios: {
      id_usuario: string;
      nombre: string;
      email: string;
      rol: string;
      correo_admitido: boolean;
      confirmado: boolean;
    }[];
    envios_recientes: {
      fecha_resumen: string;
      destinatario: string;
      estado: string;
      error: string | null;
    }[];
  } | null;
}
export async function solicitarEntrega(datos?: object) {
  const r = await fetch("/api/alertas", {
    method: datos ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    ...(datos
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        }
      : {}),
  });
  const respuesta = await r.json();
  if (!r.ok)
    throw new Error(
      respuesta.error || "No se pudo consultar el envío de alertas.",
    );
  return respuesta;
}
export async function obtenerEstadoEntrega(): Promise<EstadoEntrega> {
  return solicitarEntrega();
}
export function estadoCorreoVisible(estado: string) {
  return (
    (
      {
        ACEPTADO: "Aceptado por Gmail",
        PENDIENTE: "Pendiente de envío",
        PROCESANDO: "En proceso",
        ERROR: "Pendiente de reintento",
        REVISION: "Requiere revisión",
        ENVIADO: "Registrado por el proveedor",
      RESUMEN_DIARIO: "Se evalúa en el resumen diario",
      } as Record<string, string>
    )[estado] || estado
  );
}
