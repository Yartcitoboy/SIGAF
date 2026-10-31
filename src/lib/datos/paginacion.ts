import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/tipos/database";
export const TAMANO_PAGINA = 25;
// La búsqueda es texto, nunca sintaxis de filtro suministrada por el usuario.
export function patronBusqueda(texto: string) {
  return `%${texto.replace(/[\\%_*,()."']/g, " ").trim()}%`;
}
export async function leerPaginaProductos(
  db: SupabaseClient<Database>,
  filtro: { pagina: number; texto: string; categoria?: number },
) {
  let q = db.from("producto").select("*", { count: "exact" });
  if (filtro.categoria) q = q.eq("id_categoria", filtro.categoria);
  if (filtro.texto) {
    const patron = patronBusqueda(filtro.texto);
    q = q.or(
      [
        "nombre",
        "codigo_barras",
        "principio_activo",
        "descripcion",
        "registro_isp",
      ]
        .map((c) => `${c}.ilike.${patron}`)
        .join(","),
    );
  }
  const [productos, categorias] = await Promise.all([
    q
      .order("nombre")
      .order("id_producto")
      .range(
        (filtro.pagina - 1) * TAMANO_PAGINA,
        filtro.pagina * TAMANO_PAGINA - 1,
      ),
    db.from("categoria").select("*").order("nombre"),
  ]);
  if (productos.error) throw new Error(productos.error.message);
  if (categorias.error) throw new Error(categorias.error.message);
  return {
    productos: productos.data,
    categorias: categorias.data,
    total: productos.count ?? 0,
  };
}
