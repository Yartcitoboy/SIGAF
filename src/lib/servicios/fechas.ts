export function fechaChile(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}
export function fechaValida(fecha: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    !Number.isNaN(Date.parse(fecha)) &&
    new Date(fecha).toISOString().slice(0, 10) === fecha
  );
}
export function diasHasta(fecha: string, hoy = fechaChile()) {
  if (!fechaValida(fecha) || !fechaValida(hoy))
    throw new Error("Fecha inválida. Usa una fecha de calendario real.");
  return Math.round((Date.parse(fecha) - Date.parse(hoy)) / 86400000);
}
