import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
const { formatearMontoCLP, leerMontoCLP } =
  await import("../src/lib/vistas/formularios.ts");
const { contextoSistemaSchema } = await import("../src/lib/datos/contexto.ts");
test("formularios: separadores CLP conservan el valor y rechazan montos incompletos", () => {
  for (const [entrada, esperado] of [
    ["1000", "1.000"],
    ["1000000", "1.000.000"],
    ["1000,50", "1.000,50"],
    ["0", "0"],
  ])
    assert.equal(formatearMontoCLP(entrada), esperado);
  assert.equal(leerMontoCLP("1.000.000"), 1000000);
  assert.equal(leerMontoCLP("1.000,50"), 1000.5);
  for (const invalido of ["", "1,", "1.00", "abc", "-100", "1,2,3"])
    assert.ok(Number.isNaN(leerMontoCLP(invalido)));
});
test("contexto: reloj y opciones deben venir completos; no hay valores de reemplazo", () => {
  for (const valor of [
    {},
    { hoy: "2026-10-27" },
    { hoy: "2026-10-27", ahora: "fecha-local", tema: "claro", opciones: [] },
  ])
    assert.equal(contextoSistemaSchema.safeParse(valor).success, false);
});
test("aplicación: no quedan almacenes ni accesos demo, y los mensajes no simulan envíos", async () => {
  const fuentes = await readdir(new URL("../src/", import.meta.url), {
    recursive: true,
  });
  for (const ruta of fuentes.filter((f) => /\.(ts|tsx)$/.test(f))) {
    const codigo = await readFile(
      new URL("../src/" + ruta.replaceAll("\\", "/"), import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      codigo,
      /PGlite|datos-mock|obtenerSesionLocal|SIGAF_ACCESO_LOCAL|CONFIGURACION_ORIGINAL|localStorage|Vista previa del formulario/,
      ruta,
    );
  }
  const mensajes = await readFile(
    new URL("../src/app/(dashboard)/mensajes/page.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(mensajes, /fetch\(|localStorage|toast\.success/);
  assert.match(mensajes, /disabled/);
});
test("PostgreSQL: contexto, preferencias privadas e importación ISP sin stock ficticio", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      `CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE SCHEMA auth;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$; GRANT USAGE ON SCHEMA auth,public TO authenticated,anon,service_role;GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated,anon,service_role;`,
    );
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
    ])
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + nombre, import.meta.url),
          "utf8",
        ),
      );
    const uno = randomUUID(),
      dos = randomUUID();
    await db.exec("INSERT INTO perfil(nombre) VALUES('ADMIN');");
    for (const [id, email] of [
      [uno, "uno@prueba.invalid"],
      [dos, "dos@prueba.invalid"],
    ])
      await db.query(
        "INSERT INTO usuario(id_usuario,nombre,email,id_perfil,activo) VALUES($1,'Cuenta de prueba',$2,1,true)",
        [id, email],
      );
    async function como(id) {
      await db.exec("RESET ROLE");
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
        id ?? "",
      ]);
      await db.exec("SET ROLE authenticated");
    }
    await t.test(
      "fecha de Chile y opciones proceden de PostgreSQL",
      async () => {
        await como(uno);
        const { rows } = await db.query(
          "SELECT contexto_sigaf() AS contexto,hoy_chile()::text AS hoy",
        );
        const c = contextoSistemaSchema.parse(rows[0].contexto);
        assert.equal(c.hoy, rows[0].hoy);
        assert.ok(c.opciones.length >= 20);
        assert.equal(c.tema, "claro");
      },
    );
    await t.test("el tema de una persona no se comparte con otra", async () => {
      await como(uno);
      await db.query(
        "INSERT INTO preferencia_usuario(id_usuario,tema) VALUES($1,'oscuro')",
        [uno],
      );
      assert.equal(
        (await db.query("SELECT contexto_sigaf()->>'tema' AS tema")).rows[0]
          .tema,
        "oscuro",
      );
      await como(dos);
      assert.equal(
        (await db.query("SELECT * FROM preferencia_usuario")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("SELECT contexto_sigaf()->>'tema' AS tema")).rows[0]
          .tema,
        "claro",
      );
      assert.equal(
        (
          await db.query(
            "UPDATE preferencia_usuario SET tema='claro' WHERE id_usuario=$1 RETURNING id_usuario",
            [uno],
          )
        ).rows.length,
        0,
      );
      await assert.rejects(
        db.query(
          "INSERT INTO preferencia_usuario(id_usuario,tema) VALUES($1,'claro')",
          [uno],
        ),
      );
    });
    await t.test(
      "198 registros verificables, importación repetible y sin existencias inventadas",
      async () => {
        await db.exec("RESET ROLE");
        const sql = await readFile(
          new URL(
            "../supabase/importaciones/2026-10-27_catalogo_isp.sql",
            import.meta.url,
          ),
          "utf8",
        );
        const manifiesto = JSON.parse(
          await readFile(
            new URL(
              "../supabase/importaciones/2026-10-27_procedencia_isp.json",
              import.meta.url,
            ),
            "utf8",
          ),
        );
        assert.equal(
          createHash("sha256").update(sql).digest("hex"),
          manifiesto.sha256_sql,
        );
        await db.exec(sql);
        assert.equal(
          (await db.query("SELECT count(*)::int AS n FROM producto")).rows[0].n,
          198,
        );
        await db.exec(sql);
        assert.equal(
          (await db.query("SELECT count(*)::int AS n FROM producto")).rows[0].n,
          198,
        );
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM producto WHERE codigo_barras IS NOT NULL OR unidad_medida IS NOT NULL OR vida_util_meses IS NOT NULL",
            )
          ).rows[0].n,
          0,
        );
        assert.equal(
          (await db.query("SELECT count(*)::int AS n FROM inventario")).rows[0]
            .n,
          0,
        );
        assert.equal(
          (await db.query("SELECT count(*)::int AS n FROM lote")).rows[0].n,
          0,
        );
        assert.equal(
          (
            await db.query(
              "SELECT count(DISTINCT registro_isp)::int AS n FROM producto WHERE estado_registro_isp='Vigente' AND fuente_isp='https://registrosanitario.ispch.gob.cl/'",
            )
          ).rows[0].n,
          198,
        );
      },
    );
  } finally {
    await db.close();
  }
});
