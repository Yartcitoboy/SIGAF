export function escaparHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export interface LineaCaducidad {
  producto: string;
  registro_isp: string | null;
  lote: string;
  vencimiento: string;
  dias: number;
  estado: string;
  stock: number;
  presentacion: string | null;
  ubicacion: string;
  sucursal: string;
}
export function mensajeResumen(fecha: string, lineas: LineaCaducidad[]) {
  const estado = (l: LineaCaducidad) =>
    l.dias < 0
      ? "CADUCADO"
      : l.dias === 0
        ? "VENCE HOY"
        : l.estado === "NARANJO"
          ? "CRÍTICO"
          : "PRÓXIMO A VENCER";
  const texto = lineas
    .map(
      (l) =>
        `${estado(l)} · ${l.producto}${l.registro_isp ? " · ISP " + l.registro_isp : ""}\nLote ${l.lote} · Vence ${l.vencimiento} · ${l.dias} días\n${l.stock} ${l.presentacion || "unidades"} · ${l.sucursal} / ${l.ubicacion}`,
    )
    .join("\n\n");
  const html = lineas
    .map(
      (l) =>
        `<tr><td style="padding:16px;border-bottom:1px solid #dce5e8"><strong>${escaparHtml(estado(l))} · ${escaparHtml(l.producto)}</strong><br>Lote ${escaparHtml(l.lote)} · Vence ${escaparHtml(l.vencimiento)} (${l.dias} días)<br>${l.stock} ${escaparHtml(l.presentacion || "unidades")} · ${escaparHtml(l.sucursal)} / ${escaparHtml(l.ubicacion)}${l.registro_isp ? "<br>ISP " + escaparHtml(l.registro_isp) : ""}</td></tr>`,
    )
    .join("");
  return {
    subject: `SIGAF · Resumen de caducidad · ${fecha}`,
    text: `SIGAF · Resumen diario ${fecha} · Hora de Chile\n\n${texto}\n\nConsulta SIGAF para comprobar el stock actual. Los productos que vencen hoy o están caducados están bloqueados para dispensación.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#171a4a"><div style="padding:24px;background:#171a4a;color:white"><h1>SIGAF</h1><p>Resumen diario de caducidad · ${escaparHtml(fecha)} · Chile</p></div><table style="width:100%;border-collapse:collapse">${html}</table><p style="padding:20px;font-size:12px">Consulta SIGAF para comprobar el stock actual. Los productos que vencen hoy o están caducados están bloqueados para dispensación.</p></div>`,
  };
}
