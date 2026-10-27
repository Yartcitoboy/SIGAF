export function formatearMontoCLP(entrada: string) {
  const partes = entrada.replace(/[^\d,]/g, "").split(",");
  const entero = partes[0].replace(/^0+(?=\d)/, "");
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return agrupado + (partes.length > 1 ? "," + partes[1].slice(0, 2) : "");
}
export function leerMontoCLP(entrada: string) {
  if (!/^(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/.test(entrada)) return NaN;
  return Number(entrada.replaceAll(".", "").replace(",", "."));
}
