import { fechaValida } from "./fechas";
export const CONSULTA_ISP = "https://registrosanitario.ispch.gob.cl/";
export function validarFormatoRegistroISP(valor: string) {
  return /^[A-Z]-\d{3,6}\/\d{2}$/i.test(valor.trim());
}
export function fichaISP(registro: string) {
  if (!validarFormatoRegistroISP(registro))
    throw new Error("Formato de registro no válido. Ejemplo: F-12345/20.");
  return (
    CONSULTA_ISP +
    "Ficha.aspx?RegistroISP=" +
    encodeURIComponent(registro.trim().toUpperCase())
  );
}
// El portal público no se presenta como una API. La vigencia y la vida útil deben
// cotejarse en la ficha/resolución ISP; una coincidencia de formato no las verifica.
export function validarVidaUtil(
  fabricacion: string,
  vencimiento: string,
  meses: number,
) {
  if (
    !fechaValida(fabricacion) ||
    !fechaValida(vencimiento) ||
    !Number.isInteger(meses) ||
    meses <= 0
  )
    throw new Error("Datos de vida útil inválidos.");
  const fecha = new Date(fabricacion + "T00:00:00Z");
  const dia = fecha.getUTCDate();
  fecha.setUTCDate(1);
  fecha.setUTCMonth(fecha.getUTCMonth() + meses);
  const ultimo = new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 0),
  ).getUTCDate();
  fecha.setUTCDate(Math.min(dia, ultimo));
  return (
    vencimiento > fabricacion && vencimiento <= fecha.toISOString().slice(0, 10)
  );
}
