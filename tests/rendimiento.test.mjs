import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
test("rendimiento: página de inventario limitada, filtros globales, orden estable y RLS por sucursal", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz DEFAULT now(),deleted_at timestamptz,is_anonymous boolean DEFAULT false);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  GRANT USAGE ON SCHEMA auth,public TO authenticated,anon,service_role; GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated,anon,service_role;`);
    for (const nombre of [
      "001_initial_schema.sql",
      "002_operacion_segura.sql",
      "003_resumenes_correo.sql",
      "004_proteger_administracion.sql",
      "005_contexto_y_preferencias.sql",
      "006_procedencia_catalogo_isp.sql",
      "20261027065931_seguridad_cuentas_reales.sql",
      "20261027072035_optimizar_politicas_sesion.sql",
      "20261027205509_proteger_ultimo_admin_real.sql",
      "20261031053112_paginacion_inventario.sql",
    ])
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + nombre, import.meta.url),
          "utf8",
        ),
      );
    const admin = randomUUID(),
      bodega = randomUUID(),
      aux = randomUUID();
    await db.exec(
      `INSERT INTO perfil(nombre) VALUES('ADMIN'),('BODEGUERO'),('AUXILIAR'); INSERT INTO farmacia(razon_social,rut) VALUES('Prueba','1-9'); INSERT INTO sucursal(nombre,id_farmacia) VALUES('Central',1),('Otra',1); INSERT INTO bodega(nombre,id_sucursal,es_sala_ventas) VALUES('Central',1,true),('Otra',2,true); INSERT INTO categoria(nombre) VALUES('Prueba'); INSERT INTO producto(nombre,codigo_barras,id_categoria) VALUES('Ácido de prueba','SKU-PRUEBA',1);`,
    );
    for (const [id, rol, sucursal] of [
      [admin, 1, null],
      [bodega, 2, 1],
      [aux, 3, 2],
    ]) {
      await db.query(
        "INSERT INTO usuario(id_usuario,nombre,email,id_perfil,id_sucursal,activo) VALUES($1,$2,$3,$4,$5,true)",
        [id, "Prueba", id + "@example.test", rol, sucursal],
      );
      await db.query("INSERT INTO auth.users(id) VALUES($1)", [id]);
    }
    await db.exec(
      `INSERT INTO lote(id_producto,numero_lote,fecha_vencimiento) SELECT 1,'LOTE-'||n,hoy_chile()+n FROM generate_series(1,60) n; INSERT INTO inventario(id_lote,id_bodega,stock_actual) SELECT id_lote,CASE WHEN id_lote<=52 THEN 1 ELSE 2 END,10 FROM lote;`,
    );
    const como = async (id) => {
      await db.exec("RESET ROLE;SET ROLE authenticated");
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
    };
    const pagina = async (
      n = 1,
      texto = "",
      b = null,
      estado = "",
      orden = "vencimiento",
    ) =>
      (
        await db.query("SELECT pagina_inventario($1,$2,$3,$4,$5) AS datos", [
          n,
          texto,
          b,
          estado,
          orden,
        ])
      ).rows[0].datos;
    await como(admin);
    const primera = await pagina(),
      segunda = await pagina(2),
      tercera = await pagina(3);
    assert.equal(primera.total, 60);
    assert.equal(primera.inventario.length, 25);
    assert.equal(tercera.inventario.length, 10);
    assert.equal(
      new Set(
        [
          ...primera.inventario,
          ...segunda.inventario,
          ...tercera.inventario,
        ].map((i) => i.id_inventario),
      ).size,
      60,
    );
    const filtro = await pagina(1, "LOTE-60");
    assert.equal(filtro.total, 1);
    assert.equal(filtro.inventario[0].lote.numero_lote, "LOTE-60");
    assert.equal((await pagina(1, "SKU-PRUEBA")).total, 60);
    assert.equal((await pagina(1, "", 2)).total, 8);
    await assert.rejects(pagina(0), /inválidos/);
    await como(bodega);
    assert.equal((await pagina()).total, 52);
    assert.equal((await pagina(1, "", 2)).total, 0);
    await como(aux);
    assert.equal((await pagina()).total, 8);
    await db.exec("RESET ROLE;SET ROLE anon");
    await assert.rejects(pagina(), /permission denied/);
  } finally {
    await db.close();
  }
});
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, next) {
    if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) {
      try {
        return next(s + ".ts", c);
      } catch {}
    }
    return next(s, c);
  },
});
const { leerPaginaProductos, patronBusqueda } =
  await import("../src/lib/datos/paginacion.ts");
const { obtenerOperacion, obtenerConfiguracionOperacion } =
  await import("../src/lib/servicios/operacion.ts");
const { tablasOperacion } = await import("../src/lib/datos/alcance-operacion.ts");
test("dispensación conserva todo el stock y omite historiales que no utiliza", async () => {
  assert.deepEqual([...tablasOperacion("dispensacion")].sort(), ["inventario", "lote", "producto", "bodega", "sucursal", "farmacia", "configuracion"].sort());
  assert.ok(tablasOperacion("completo").includes("movimiento_inventario"));
  assert.ok(tablasOperacion("completo").includes("merma"));
  const previo = globalThis.fetch;
  globalThis.fetch = async (_url, opciones) => {
    assert.equal(JSON.parse(opciones.body).alcance, "dispensacion");
    return { ok: true, json: async () => ({ data: {
      inventario: [{ id_inventario: 1, id_lote: 2, id_bodega: 3, stock_actual: 4 }],
      lote: [{ id_lote: 2, id_producto: 5, fecha_vencimiento: "2027-01-01" }],
      producto: [{ id_producto: 5, nombre: "Ficha de prueba" }],
      bodega: [{ id_bodega: 3 }], sucursal: [], farmacia: [],
      configuracion: [{ id: 1, dias_critico: 7, dias_preventivo: 30, holgura_dias: 0 }],
      sistema: { hoy: "2026-11-03", ahora: "2026-11-03T12:00:00Z" },
    } }) };
  };
  try {
    const r = await obtenerOperacion("dispensacion");
    assert.equal(r.inventario[0].stock_actual, 4);
    assert.equal(r.inventario[0].lote.producto.nombre, "Ficha de prueba");
    assert.deepEqual(r.movimientos, []);
    assert.deepEqual(r.mermas, []);
  } finally { globalThis.fetch = previo; }
});
test("rendimiento: catálogo aplica filtros y límite en servidor antes de entregar filas", async () => {
  const llamadas = [];
  const db = {
    from(tabla) {
      const q = {
        select(...args) {
          llamadas.push([tabla, "select", ...args]);
          return q;
        },
        eq(...args) {
          llamadas.push([tabla, "eq", ...args]);
          return q;
        },
        or(...args) {
          llamadas.push([tabla, "or", ...args]);
          return q;
        },
        order() {
          return q;
        },
        range(...args) {
          llamadas.push([tabla, "range", ...args]);
          return q;
        },
        then(resolve) {
          return Promise.resolve({ data: [], count: 214, error: null }).then(
            resolve,
          );
        },
      };
      return q;
    },
  };
  const r = await leerPaginaProductos(db, {
    pagina: 2,
    texto: "paracetamol",
    categoria: 3,
  });
  assert.equal(r.total, 214);
  assert.ok(
    llamadas.some(
      (c) =>
        c[0] === "producto" && c[1] === "range" && c[2] === 25 && c[3] === 49,
    ),
  );
  assert.ok(
    llamadas.some(
      (c) => c[1] === "eq" && c[2] === "id_categoria" && c[3] === 3,
    ),
  );
  assert.ok(
    llamadas.some(
      (c) => c[1] === "or" && c[2].includes("nombre.ilike.%paracetamol%"),
    ),
  );
  assert.ok(!/[(),*"']/.test(patronBusqueda("x),id.gt.0*")));
});
test("rendimiento: operación se carga en una petición; configuración conserva el control de bodegas con stock", async () => {
  const previo = globalThis.fetch,
    llamadas = [];
  globalThis.fetch = async (url, opciones) => {
    const c = JSON.parse(opciones.body);
    llamadas.push(c);
    return {
      ok: true,
      json: async () => ({
        data: {
          inventario: [],
          lote: [],
          producto: [],
          bodega: [],
          movimiento_inventario: [],
          merma: [],
          sucursal: [],
          farmacia: [],
          configuracion: [
            { id: 1, dias_critico: 7, dias_preventivo: 30, holgura_dias: 0 },
          ],
          sistema: { hoy: "2026-10-31", ahora: "2026-10-31T05:00:00Z" },
          bodegasConStock: [2],
        },
      }),
    };
  };
  try {
    const r = await obtenerOperacion();
    assert.equal(llamadas.length, 1);
    assert.equal(llamadas[0].accion, "operacion");
    assert.equal(r.configuracion.dias_critico, 7);
    const config = await obtenerConfiguracionOperacion();
    assert.equal(llamadas[1].alcance, "configuracion");
    assert.deepEqual(config.bodegasConStock, [2]);
    assert.ok(!("inventario" in config));
  } finally {
    globalThis.fetch = previo;
  }
});
