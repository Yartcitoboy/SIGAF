const pendientes = new Map<
  string,
  { vence: number; promesa: Promise<unknown> }
>();
const clave = (usuario: string, comando: unknown) =>
  usuario + ":" + JSON.stringify(comando);
export function prepararLectura<T>(
  usuario: string,
  comando: unknown,
  cargar: () => Promise<T>,
) {
  const ahora = Date.now();
  for (const [k, v] of pendientes) if (v.vence <= ahora) pendientes.delete(k);
  const k = clave(usuario, comando);
  if (pendientes.has(k)) return;
  const promesa = cargar();
  const entrada = { vence: ahora + 5000, promesa };
  pendientes.set(k, entrada);
  void promesa.catch(() => {
    if (pendientes.get(k) === entrada) pendientes.delete(k);
  });
}
export function consumirLectura<T>(
  usuario: string,
  comando: unknown,
): Promise<T> | undefined {
  const k = clave(usuario, comando),
    entrada = pendientes.get(k);
  pendientes.delete(k);
  return entrada && entrada.vence > Date.now()
    ? (entrada.promesa as Promise<T>)
    : undefined;
}
export function descartarLecturas() {
  pendientes.clear();
}
