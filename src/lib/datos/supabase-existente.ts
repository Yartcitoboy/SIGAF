import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RolPerfil } from "@/tipos/database";
import type { TablaDatos } from "./contrato";
import { COLUMNAS_USUARIO, TABLAS } from "./contrato";
import { todasLasFilas } from "../servicios/consulta";

export interface AlcanceConsulta {
  rol: RolPerfil;
  id_sucursal: number | null;
  id_usuario: string;
}
export async function leerSupabaseExistente(
  db: SupabaseClient<Database>,
  tabla: TablaDatos,
  alcance: AlcanceConsulta,
) {
  if (tabla === "configuracion") {
    const resultado = await db.from("configuracion").select("*").eq("id", 1);
    if (resultado.error) {
      throw new Error(resultado.error.message);
    }
    if (!resultado.data.length)
      throw new Error(
        "La tabla de configuración existe, pero falta su registro. No se han generado valores de reemplazo.",
      );
    return resultado.data;
  }
  const operario = alcance.rol !== "ADMIN";
  if (
    operario &&
    ["usuario", "perfil", "reporte", "movimiento_inventario", "merma"].includes(
      tabla,
    ) &&
    (alcance.rol === "AUXILIAR" ||
      ["usuario", "perfil", "reporte"].includes(tabla))
  )
    return [];
  // La bandeja corresponde siempre al usuario autenticado, incluido Admin.
  if (tabla === "notificacion")
    return todasLasFilas((a, b) =>
      db
        .from("notificacion")
        .select("*")
        .eq("id_usuario", alcance.id_usuario)
        .order("id_notificacion", { ascending: false })
        .range(a, b),
    );
  let columna: string | undefined;
  let ids: number[] | undefined;
  if (operario) {
    if (!alcance.id_sucursal) return [];
    if (tabla === "sucursal" || tabla === "bodega") {
      columna = "id_sucursal";
      ids = [alcance.id_sucursal];
    } else if (
      ["inventario", "lote", "movimiento_inventario", "merma"].includes(tabla)
    ) {
      const bodegas = await todasLasFilas((a, b) =>
        db
          .from("bodega")
          .select("*")
          .eq("id_sucursal", alcance.id_sucursal!)
          .order("id_bodega")
          .range(a, b),
      );
      const idsBodegas = bodegas.map((b) => b.id_bodega);
      if (!idsBodegas.length) return [];
      if (tabla === "inventario") {
        columna = "id_bodega";
        ids = idsBodegas;
      } else {
        const inventario = await todasLasFilas((a, b) =>
          db
            .from("inventario")
            .select("*")
            .in("id_bodega", idsBodegas)
            .order("id_inventario")
            .range(a, b),
        );
        columna = tabla === "lote" ? "id_lote" : "id_inventario";
        ids = [
          ...new Set(
            inventario.map((i) =>
              tabla === "lote" ? i.id_lote : i.id_inventario,
            ),
          ),
        ];
        if (!ids.length) return [];
      }
    }
  }
  return todasLasFilas((a, b) => {
    let consulta = db
      .from(tabla)
      .select(tabla === "usuario" ? COLUMNAS_USUARIO : "*")
      .order(TABLAS[tabla], {
        ascending: ![
          "notificacion",
          "movimiento_inventario",
          "merma",
          "reporte",
        ].includes(tabla),
      });
    if (columna && ids)
      consulta = consulta.filter(columna, "in", `(${ids.join(",")})`);
    return consulta.range(a, b);
  });
}
