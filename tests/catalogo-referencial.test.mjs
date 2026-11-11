import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("catálogo referencial: completa 198 fichas, preserva identidad y no pisa ediciones posteriores", async () => {
  const sql = await readFile(new URL("../supabase/datos-demostracion/completar-catalogo-2026-11-10.sql", import.meta.url), "utf8");
  const plan = JSON.parse(sql.match(/\$plan_catalogo\$\s*([\s\S]*?)\s*\$plan_catalogo\$/)[1]);
  const db = new PGlite();
  try {
    await db.exec(await readFile(new URL("../supabase/migrations/001_initial_schema.sql", import.meta.url), "utf8"));
    await db.exec(`ALTER TABLE producto ADD COLUMN principio_activo text, ADD COLUMN registro_isp text;
      INSERT INTO categoria(id_categoria,nombre) VALUES (1,'Analgesicos'),(2,'Antibioticos'),(3,'Cardiovasculares'),(4,'Antihistaminicos'),(5,'Gastrointestinales'),(6,'Antidiabeticos'),(9,'Catalogo ISP');
      INSERT INTO producto(id_producto,nombre,unidad_medida,codigo_barras,id_categoria) VALUES (1,'Ficha real existente','Caja real','REAL-1',1);`);
    const originales = plan.map(p => ({ id_producto: p.id_producto, ...p.antes }));
    await db.query(`INSERT INTO producto(id_producto,nombre,principio_activo,registro_isp,codigo_barras,unidad_medida,id_categoria,descripcion)
      SELECT id_producto,nombre,principio_activo,registro_isp,codigo_barras,unidad_medida,id_categoria,descripcion
      FROM jsonb_to_recordset($1::jsonb) AS x(id_producto int,nombre text,principio_activo text,registro_isp text,codigo_barras text,unidad_medida text,id_categoria int,descripcion text)`, [JSON.stringify(originales)]);
    await db.exec(sql);
    const rows = (await db.query("SELECT * FROM producto ORDER BY id_producto")).rows;
    assert.equal(rows.length, 199);
    for (const p of plan) {
      const real = rows.find(r => r.id_producto === p.id_producto);
      for (const campo of ["nombre", "principio_activo", "registro_isp"]) assert.equal(real[campo], p.antes[campo]);
      for (const [campo, valor] of Object.entries(p.despues)) assert.equal(real[campo], valor);
      assert.match(real.unidad_medida, /\(ref\.\)/);
      assert.match(real.codigo_barras, /^INT-ISP-\d{6}$/);
      assert.notEqual(real.id_categoria, 9);
    }
    assert.equal(rows[0].unidad_medida, "Caja real");
    assert.equal(new Set(rows.map(r => r.codigo_barras)).size, 199);
    assert.equal(rows.find(r => r.id_producto === 115).id_categoria, 3);
    assert.equal(rows.find(r => r.id_producto === 17).unidad_medida, "Frasco x 100 mL (ref.)");
    await db.exec(sql);
    assert.deepEqual((await db.query("SELECT * FROM producto ORDER BY id_producto")).rows, rows);
    await db.exec("UPDATE producto SET unidad_medida='Caja real confirmada' WHERE id_producto=115");
    await assert.rejects(db.exec(sql), /fue editada/);
    await db.exec("ROLLBACK");
    assert.equal((await db.query("SELECT unidad_medida FROM producto WHERE id_producto=115")).rows[0].unidad_medida, "Caja real confirmada");
  } finally { await db.close(); }
});
