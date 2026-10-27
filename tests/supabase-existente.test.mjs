import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { createClient } from "@supabase/supabase-js";
registerHooks({
  resolve(s, c, next) {
    if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) {
      try {
        return next(s + ".ts", c);
      } catch {
        /* resolver normal */
      }
    }
    return next(s, c);
  },
});
const { leerSupabaseExistente } =
  await import("../src/lib/datos/supabase-existente.ts");
function conexion({ tablas = {}, errores = {} } = {}) {
  const peticiones = [];
  const db = createClient(
    "https://sigaf-pruebas.invalid",
    "clave-publica-prueba",
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async (input, opciones = {}) => {
          assert.equal(
            opciones.method || "GET",
            "GET",
            "la adaptación no debe escribir en Supabase",
          );
          const url = new URL(input);
          const tabla = url.pathname.split("/").at(-1);
          peticiones.push({ tabla, url });
          if (errores[tabla])
            return Response.json(errores[tabla], {
              status: errores[tabla].code === "42501" ? 403 : 404,
            });
          let filas = (tablas[tabla] || []).map((f) => ({ ...f }));
          for (const [campo, filtro] of url.searchParams) {
            if (filtro.startsWith("eq."))
              filas = filas.filter((f) => String(f[campo]) === filtro.slice(3));
            if (filtro.startsWith("in.(")) {
              const ids = filtro.slice(4, -1).split(",");
              filas = filas.filter((f) => ids.includes(String(f[campo])));
            }
          }
          const campos = url.searchParams.get("select");
          if (campos && campos !== "*")
            filas = filas.map((f) =>
              Object.fromEntries(
                campos
                  .split(",")
                  .filter((c) => c in f)
                  .map((c) => [c, f[c]]),
              ),
            );
          const offset = Number(url.searchParams.get("offset") || 0),
            limite = Number(url.searchParams.get("limit") || 1000);
          return Response.json(filas.slice(offset, offset + limite));
        },
      },
    },
  );
  return { db, peticiones };
}
const admin = {
  rol: "ADMIN",
  id_sucursal: null,
  id_usuario: "cuenta-de-prueba",
};
const bodega = {
  rol: "BODEGUERO",
  id_sucursal: 1,
  id_usuario: "cuenta-de-prueba",
};
test("Supabase existente: catálogo completo mediante consultas, sin datos locales ni límite de 1000", async () => {
  const productos = Array.from({ length: 1005 }, (_, i) => ({
    id_producto: i + 1,
    nombre: `Producto de prueba ${i + 1}`,
  }));
  const { db, peticiones } = conexion({ tablas: { producto: productos } });
  const filas = await leerSupabaseExistente(db, "producto", admin);
  assert.equal(filas.length, 1005);
  assert.equal(peticiones.length, 3);
  assert.ok(peticiones.every((p) => p.tabla === "producto"));
});
test("Supabase existente: falta de configuración genera error, sin umbrales locales", async () => {
  const { db } = conexion({
    errores: {
      configuracion: {
        code: "PGRST205",
        message: "Could not find table public.configuracion",
      },
    },
  });
  await assert.rejects(
    leerSupabaseExistente(db, "configuracion", admin),
    /configuracion/,
  );
});

test("Supabase existente: no oculta permisos, red ni una configuración vacía", async () => {
  const a = conexion({
    errores: {
      configuracion: {
        code: "42501",
        message: "permission denied for table configuracion",
      },
    },
  });
  await assert.rejects(
    leerSupabaseExistente(a.db, "configuracion", admin),
    /permission denied/,
  );
  const b = conexion({ tablas: { configuracion: [] } });
  await assert.rejects(
    leerSupabaseExistente(b.db, "configuracion", admin),
    /falta su registro/,
  );
  const c = conexion({
    errores: {
      producto: {
        code: "42501",
        message: "permission denied for table producto",
      },
    },
  });
  await assert.rejects(
    leerSupabaseExistente(c.db, "producto", admin),
    /permission denied/,
  );
});
test("Supabase existente: personal autenticado mantiene catálogo común y stock de su sucursal", async () => {
  const { db } = conexion({
    tablas: {
      producto: [{ id_producto: 1 }, { id_producto: 2 }],
      bodega: [
        { id_bodega: 1, id_sucursal: 1 },
        { id_bodega: 2, id_sucursal: 2 },
      ],
      inventario: [
        { id_inventario: 10, id_bodega: 1, id_lote: 100 },
        { id_inventario: 20, id_bodega: 2, id_lote: 200 },
      ],
      lote: [{ id_lote: 100 }, { id_lote: 200 }],
      movimiento_inventario: [
        { id_movimiento: 1, id_inventario: 10 },
        { id_movimiento: 2, id_inventario: 20 },
      ],
    },
  });
  assert.equal((await leerSupabaseExistente(db, "producto", bodega)).length, 2);
  assert.deepEqual(
    (await leerSupabaseExistente(db, "inventario", bodega)).map(
      (i) => i.id_inventario,
    ),
    [10],
  );
  assert.deepEqual(
    (await leerSupabaseExistente(db, "lote", bodega)).map((i) => i.id_lote),
    [100],
  );
  assert.deepEqual(
    (await leerSupabaseExistente(db, "movimiento_inventario", bodega)).map(
      (m) => m.id_movimiento,
    ),
    [1],
  );
  assert.deepEqual(
    await leerSupabaseExistente(db, "movimiento_inventario", {
      ...bodega,
      rol: "AUXILIAR",
    }),
    [],
  );
});
test("Supabase existente: usuarios sin hashes y sin suplantar destinatarios de alertas", async () => {
  const { db, peticiones } = conexion({
    tablas: {
      usuario: [
        {
          id_usuario: "real",
          nombre: "Persona de prueba",
          password_hash: "NO_EXPOSICION",
        },
      ],
    },
  });
  const [u] = await leerSupabaseExistente(db, "usuario", admin);
  assert.equal(u.nombre, "Persona de prueba");
  assert.equal("password_hash" in u, false);
  const n = peticiones.length;
  assert.deepEqual(await leerSupabaseExistente(db, "notificacion", bodega), []);
  assert.equal(peticiones.length, n + 1);
  assert.equal(
    peticiones.at(-1).url.searchParams.get("id_usuario"),
    "eq." + bodega.id_usuario,
  );
});
