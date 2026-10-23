// Paginar evita que el límite predeterminado de PostgREST trunque métricas y exportaciones.
export async function todasLasFilas<T>(
  consulta: (
    desde: number,
    hasta: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const resultado: T[] = [];
  for (let desde = 0; ; desde += 500) {
    const { data, error } = await consulta(desde, desde + 499);
    if (error) throw new Error(error.message);
    resultado.push(...(data ?? []));
    if (!data || data.length < 500) return resultado;
  }
}
