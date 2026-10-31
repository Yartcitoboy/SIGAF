import { comandoDatos, TABLAS, validarCampos } from "@/lib/datos/contrato";
import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";
import { leerSupabaseExistente } from "@/lib/datos/supabase-existente";
import type { Database } from "@/tipos/database";
import { validarCodigoProducto } from "@/lib/datos/busqueda-codigo";
import { ErrorCodigo } from "@/lib/servicios/codigo-medicamento";
import { leerPaginaProductos } from "@/lib/datos/paginacion";
import { todasLasFilas } from "@/lib/servicios/consulta";

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
    let data: unknown;
    {
      const { db, usuario, rol } = await autorizar();
      if (comando.accion === "contexto") {
        const resultado = await db.rpc("contexto_sigaf", {});
        if (resultado.error) throw new Error(resultado.error.message);
        data = resultado.data;
      } else if (comando.accion === "campana") {
        const resultado = await db
          .from("notificacion")
          .select("*", { count: "exact" })
          .eq("id_usuario", usuario.id_usuario)
          .neq("estado", "LEIDO")
          .order("id_notificacion", { ascending: false })
          .limit(5);
        if (resultado.error) throw new Error(resultado.error.message);
        data = { filas: resultado.data, total: resultado.count ?? 0 };
      } else if (comando.accion === "inventario_pagina") {
        const resultado = await db.rpc("pagina_inventario", {
          p_pagina: comando.pagina,
          p_texto: comando.texto,
          p_bodega: comando.bodega ?? null,
          p_estado: comando.estado,
          p_orden: comando.orden,
        });
        if (resultado.error) throw new Error(resultado.error.message);
        data = resultado.data;
      } else if (comando.accion === "productos_pagina") {
        data = await leerPaginaProductos(db, comando);
      } else if (comando.accion === "operacion") {
        const tablas =
          comando.alcance === "completo"
            ? ([
                "inventario",
                "lote",
                "producto",
                "bodega",
                "movimiento_inventario",
                "merma",
                "sucursal",
                "farmacia",
                "configuracion",
              ] as const)
            : (["bodega", "sucursal", "farmacia", "configuracion"] as const);
        const [filas, contexto] = await Promise.all([
          Promise.all(
            tablas.map(
              async (tabla) =>
                [
                  tabla,
                  await leerSupabaseExistente(db, tabla, {
                    rol,
                    id_usuario: usuario.id_usuario,
                    id_sucursal: usuario.id_sucursal,
                  }),
                ] as const,
            ),
          ),
          db.rpc("contexto_sigaf", {}),
        ]);
        if (contexto.error) throw new Error(contexto.error.message);
        const bodegasConStock =
          comando.alcance === "configuracion"
            ? [
                ...new Set(
                  (
                    await todasLasFilas((a, b) =>
                      db
                        .from("inventario")
                        .select("id_bodega")
                        .gt("stock_actual", 0)
                        .order("id_inventario")
                        .range(a, b),
                    )
                  ).map((i) => i.id_bodega),
                ),
              ]
            : undefined;
        data = {
          ...Object.fromEntries(filas),
          sistema: contexto.data,
          bodegasConStock,
        };
      } else if (comando.accion === "reporte_detalle") {
        if (rol !== "ADMIN")
          throw new ErrorHttp("Esta consulta requiere Administración.", 403);
        const resultado = await db
          .from("reporte")
          .select("*")
          .eq("id_reporte", comando.id)
          .single();
        if (resultado.error) throw new Error(resultado.error.message);
        data = resultado.data;
      } else if (comando.accion === "leer") {
        data = await leerSupabaseExistente(db, comando.tabla, {
          rol,
          id_usuario: usuario.id_usuario,
          id_sucursal: usuario.id_sucursal,
        });
      } else if (comando.accion === "guardar") {
        validarCampos(comando);
        if (comando.tabla !== "notificacion" && rol !== "ADMIN")
          throw new ErrorHttp(
            "Esta escritura requiere un perfil de administración.",
            403,
          );
        if (
          comando.tabla === "producto" &&
          Object.hasOwn(comando.campos, "codigo_barras")
        )
          comando.campos.codigo_barras = await validarCodigoProducto(
            db,
            comando.campos.codigo_barras,
            comando.id,
          );
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
                    .eq("id_usuario", usuario.id_usuario)
                : db.from("notificacion").insert(campos);
            }
            case "reporte": {
              const contenido = comando.campos.contenido;
              const campos = {
                ...comando.campos,
                ...(contenido && typeof contenido === "object"
                  ? { contenido: { ...contenido, autor: usuario.nombre } }
                  : {}),
                id_usuario: usuario.id_usuario,
              } as Database["public"]["Tables"]["reporte"]["Update"];
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
        if (error) {
          if (comando.tabla === "producto" && error.code === "23505")
            throw new ErrorHttp(
              "Ya existe un medicamento con ese código.",
              409,
            );
          throw new Error(error.message);
        }
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
    if (error instanceof ErrorCodigo)
      return Response.json({ error: error.message }, { status: error.estado });
    return respuestaError(error);
  }
}
