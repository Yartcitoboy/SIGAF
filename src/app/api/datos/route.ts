import { comandoDatos, TABLAS, validarCampos } from "@/lib/datos/contrato";
import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";
import { obtenerSesionLocal } from "@/lib/auth/local-server";
import { leerSupabaseExistente } from "@/lib/datos/supabase-existente";
import { crearClienteLectura } from "@/lib/supabase/lectura";
import type { Database } from "@/tipos/database";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const origen = request.headers.get("origin");
    if (origen && new URL(origen).host !== request.headers.get("host"))
      throw new ErrorHttp("Origen de petición no permitido.", 403);
    const entrada = comandoDatos.safeParse(await request.json());
    if (!entrada.success)
      throw new ErrorHttp("Solicitud de datos inválida.", 400);
    const comando = entrada.data;
    const local = await obtenerSesionLocal();
    let data: unknown;
    if (local) {
      if (comando.accion !== "leer")
        throw new ErrorHttp(
          "El acceso temporal consulta Supabase en modo de solo lectura. No se ha modificado ningún registro.",
          403,
        );
      data = await leerSupabaseExistente(crearClienteLectura(), comando.tabla, {
        rol: local.rol,
        id_usuario: local.usuario.id_usuario,
        id_sucursal: local.usuario.id_sucursal,
      });
    } else {
      const { db } = await autorizar();
      if (comando.accion === "leer") {
        data = await leerSupabaseExistente(db, comando.tabla);
      } else if (comando.accion === "guardar") {
        validarCampos(comando);
        // Mantener cada tabla concreta preserva los tipos de escritura de PostgREST.
        const consulta = (() => {
          switch (comando.tabla) {
            case "producto": {
              const campos =
                comando.campos as Database["public"]["Tables"]["producto"]["Update"];
              return comando.id
                ? db
                    .from("producto")
                    .update(campos)
                    .filter(TABLAS.producto, "eq", comando.id)
                : db.from("producto").insert(campos);
            }
            case "configuracion": {
              const campos =
                comando.campos as Database["public"]["Tables"]["configuracion"]["Update"];
              return comando.id
                ? db
                    .from("configuracion")
                    .update(campos)
                    .filter(TABLAS.configuracion, "eq", comando.id)
                : db.from("configuracion").insert(campos);
            }
            case "farmacia": {
              const campos =
                comando.campos as Database["public"]["Tables"]["farmacia"]["Update"];
              return comando.id
                ? db
                    .from("farmacia")
                    .update(campos)
                    .filter(TABLAS.farmacia, "eq", comando.id)
                : db.from("farmacia").insert(campos);
            }
            case "sucursal": {
              const campos =
                comando.campos as Database["public"]["Tables"]["sucursal"]["Update"];
              return comando.id
                ? db
                    .from("sucursal")
                    .update(campos)
                    .filter(TABLAS.sucursal, "eq", comando.id)
                : db.from("sucursal").insert(campos);
            }
            case "bodega": {
              const campos =
                comando.campos as Database["public"]["Tables"]["bodega"]["Update"];
              return comando.id
                ? db
                    .from("bodega")
                    .update(campos)
                    .filter(TABLAS.bodega, "eq", comando.id)
                : db.from("bodega").insert(campos);
            }
            case "notificacion": {
              const campos =
                comando.campos as Database["public"]["Tables"]["notificacion"]["Update"];
              return comando.id
                ? db
                    .from("notificacion")
                    .update(campos)
                    .filter(TABLAS.notificacion, "eq", comando.id)
                : db.from("notificacion").insert(campos);
            }
            case "reporte": {
              const campos =
                comando.campos as Database["public"]["Tables"]["reporte"]["Update"];
              return comando.id
                ? db
                    .from("reporte")
                    .update(campos)
                    .filter(TABLAS.reporte, "eq", comando.id)
                : db.from("reporte").insert(campos);
            }
          }
        })();
        const { data: filas, error } = await consulta.select("*");
        if (error) throw new Error(error.message);
        if (!filas?.length)
          throw new ErrorHttp(
            "Registro no encontrado o sin permiso de escritura.",
            403,
          );
        data = filas;
      } else {
        const resultado =
          comando.accion === "recibir"
            ? await db.rpc("recibir_lote", { p_datos: { ...comando.datos } })
            : await db.rpc("operar_stock", {
                p_inventario: comando.datos.inventario,
                p_cantidad: comando.datos.cantidad,
                p_tipo: comando.datos.tipo,
                p_operacion: comando.datos.operacion,
                p_motivo: comando.datos.motivo,
                p_destino: comando.datos.destino,
              });
        if (resultado.error) throw new Error(resultado.error.message);
        data = resultado.data;
      }
    }
    return Response.json(
      { data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return respuestaError(error);
  }
}
