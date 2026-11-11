import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("carga video: dos sucursales, costos completos, fechas y repetición sin reponer stock", async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz DEFAULT now(),deleted_at timestamptz,is_anonymous boolean DEFAULT false);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      GRANT USAGE ON SCHEMA auth,public TO authenticated,anon,service_role;`);
    for (const file of ["001_initial_schema.sql", "002_operacion_segura.sql", "003_resumenes_correo.sql", "004_proteger_administracion.sql", "005_contexto_y_preferencias.sql", "006_procedencia_catalogo_isp.sql", "20261027065931_seguridad_cuentas_reales.sql"]) {
      await db.exec(await readFile(new URL("../supabase/migrations/" + file, import.meta.url), "utf8"));
    }
    // Fecha aislada y fija para que el escenario siga siendo comprobable después del video.
    await db.exec(`CREATE OR REPLACE FUNCTION public.hoy_chile() RETURNS date LANGUAGE sql STABLE AS $$ SELECT DATE '2026-11-10' $$;
      INSERT INTO perfil(nombre) VALUES ('ADMIN');
      INSERT INTO farmacia(razon_social,rut) VALUES ('QA','1-9');
      INSERT INTO sucursal(nombre,id_farmacia) VALUES ('Central',1),('Providencia',1);
      INSERT INTO categoria(id_categoria,nombre) VALUES (1,'Analgesicos'),(3,'Cardiovasculares'),(4,'Antihistaminicos'),(5,'Gastrointestinales');
      INSERT INTO usuario(id_usuario,nombre,email,id_perfil,activo) VALUES ('16da4ad2-f4ce-4e6c-b77b-8f2d78097f87','Responsable QA','responsable@example.test',1,true);
      INSERT INTO auth.users(id) SELECT id_usuario FROM usuario;
      INSERT INTO bodega(nombre,id_sucursal,es_sala_ventas) VALUES ('Original',1,true);
      INSERT INTO producto(nombre,id_categoria) VALUES ('Original',1);
      INSERT INTO lote(numero_lote,fecha_vencimiento,id_producto) VALUES ('ORIGINAL','2026-10-01',1);
      INSERT INTO inventario(id_lote,id_bodega,stock_actual) VALUES (1,1,7);`);
    const script = await readFile(new URL("../supabase/datos-demostracion/video-2026-11-10.sql", import.meta.url), "utf8");
    await db.exec(script);
    const valor = async (q) => Object.values((await db.query(q)).rows[0])[0];
    assert.equal(await valor("SELECT count(*)::int FROM producto"), 7);
    assert.equal(await valor("SELECT count(*)::int FROM lote"), 39);
    assert.equal(await valor("SELECT sum(stock_actual)::int FROM inventario"), 1287);
    assert.equal(await valor("SELECT count(DISTINCT b.id_sucursal)::int FROM inventario i JOIN bodega b USING(id_bodega) JOIN lote l USING(id_lote) WHERE l.numero_lote LIKE 'DEMO-V261110-%'"), 2);
    assert.equal(await valor("SELECT sum(i.stock_actual*l.costo_unitario)::int FROM inventario i JOIN lote l USING(id_lote) WHERE l.numero_lote LIKE 'DEMO-V261110-%'"), 2612000);
    assert.deepEqual((await db.query("SELECT DISTINCT fecha_vencimiento::text AS fecha FROM lote WHERE numero_lote LIKE 'DEMO-V261110-%' ORDER BY fecha")).rows.map(r => r.fecha), ["2026-11-15", "2026-11-30", "2027-01-30", "2027-04-30"]);
    assert.equal(await valor("SELECT count(*)::int FROM movimiento_inventario WHERE tipo_movimiento='ENTRADA' AND costo_unitario>0"), 38);
    assert.equal(await valor("SELECT codigo_barras FROM producto WHERE id_producto=1"), null);
    assert.equal(await valor("SELECT costo_unitario FROM lote WHERE id_lote=1"), null);
    await db.exec("UPDATE inventario SET stock_actual=stock_actual-3 WHERE id_inventario=(SELECT min(i.id_inventario) FROM inventario i JOIN lote l USING(id_lote) WHERE l.numero_lote LIKE 'DEMO-V261110-%')");
    await db.exec(script);
    assert.equal(await valor("SELECT sum(stock_actual)::int FROM inventario"), 1284);
    assert.equal(await valor("SELECT count(*)::int FROM movimiento_inventario"), 38);
    assert.equal(await valor("SELECT stock_actual FROM inventario WHERE id_inventario=1"), 7);
  } finally { await db.close(); }
});
