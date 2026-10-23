import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Configuracion, RolPerfil } from "@/tipos/database";
import type { TablaDatos } from "./contrato";
import { COLUMNAS_USUARIO, TABLAS } from "./contrato";
import { todasLasFilas } from "../servicios/consulta";

// Umbrales de fn_estado_semaforo en 001_initial_schema.sql, no una tabla ficticia.
export const CONFIGURACION_ORIGINAL: Configuracion = {
  id: 1,
  dias_critico: 7,
  dias_preventivo: 30,
  holgura_dias: 0,
  esquema_original: true,
};
export function faltaTablaConfiguracion(error: {
  code?: string;
  message?: string;
}) {
  return (
    ["PGRST205", "42P01"].includes(error.code ?? "") &&
    /configuracion/i.test(error.message ?? "")
  );
}
export interface ConsultaTemporal {
  rol: RolPerfil;
  id_sucursal: number | null;
  id_usuario: string;
}
export async function leerSupabaseExistente(
  db: SupabaseClient<Database>,
  tabla: TablaDatos,
  temporal?: ConsultaTemporal,
) {
  if (tabla === "configuracion") {
    const resultado = await db.from("configuracion").select("*").eq("id", 1);
    if (resultado.error) {
      if (faltaTablaConfiguracion(resultado.error))
        return [{ ...CONFIGURACION_ORIGINAL }];
      throw new Error(resultado.error.message);
    }
    if (!resultado.data.length)
      throw new Error(
        "La tabla de configuración existe, pero falta su registro. No se han generado valores de reemplazo.",
      );
    return resultado.data;
  }
  const operario = temporal && temporal.rol !== "ADMIN";
  if (
    operario &&
    ["usuario", "perfil", "reporte", "movimiento_inventario", "merma"].includes(
      tabla,
    ) &&
    (temporal.rol === "AUXILIAR" ||
      ["usuario", "perfil", "reporte"].includes(tabla))
  )
    return [];
  // Una identidad temporal no tiene notificaciones personales en Supabase.
  if (temporal && tabla === "notificacion" && temporal.rol !== "ADMIN")
    return [];
  let columna: string | undefined;
  let ids: number[] | undefined;
  if (operario) {
    if (!temporal.id_sucursal) return [];
    if (tabla === "sucursal" || tabla === "bodega") {
      columna = "id_sucursal";
      ids = [temporal.id_sucursal];
    } else if (
      ["inventario", "lote", "movimiento_inventario", "merma"].includes(tabla)
    ) {
      const bodegas = await todasLasFilas((a, b) =>
        db
          .from("bodega")
          .select("*")
          .eq("id_sucursal", temporal.id_sucursal!)
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
