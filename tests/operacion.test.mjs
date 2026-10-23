import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL: migraciones, RLS, FEFO, stock atómico y alertas", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      GRANT USAGE ON SCHEMA auth,public TO authenticated,anon,service_role;
      GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated,anon,service_role;`);
    for (const nombre of [
      "001_initial_schema.sql",
      "002_operacion_segura.sql",
      "003_resumenes_correo.sql",
      "004_proteger_administracion.sql",
    ]) {
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + nombre, import.meta.url),
          "utf8",
        ),
      );
    }
    // Datos exclusivos de prueba. Nunca se envían a la aplicación ni a Supabase.
    const admin = randomUUID(),
      bodeguero = randomUUID(),
      auxiliar = randomUUID(),
      inactivo = randomUUID();
    await db.exec(`INSERT INTO perfil(nombre) VALUES ('ADMIN'),('BODEGUERO'),('AUXILIAR');
      INSERT INTO farmacia(razon_social,rut) VALUES ('Prueba','1-9');
      INSERT INTO sucursal(nombre,id_farmacia) VALUES ('Central',1),('Otra',1);
      INSERT INTO bodega(nombre,id_sucursal,es_sala_ventas) VALUES ('Vitrina',1,true),('Bodega',1,false),('Otra sucursal',2,true);
      INSERT INTO categoria(nombre) VALUES ('Prueba');
      INSERT INTO producto(nombre,id_categoria,vida_util_meses) VALUES ('Medicamento de prueba',1,24);
      INSERT INTO usuario(id_usuario,nombre,email,id_perfil,id_sucursal,activo) VALUES
      ('${admin}','Admin','admin@example.test',1,NULL,true),('${bodeguero}','Bodega','bodega@example.test',2,1,true),
      ('${auxiliar}','Auxiliar','aux@example.test',3,1,true),('${inactivo}','Inactivo','inactivo@example.test',2,1,false);`);
    const como = async (id, rol = "authenticated") => {
      await db.exec("RESET ROLE; SET ROLE " + rol);
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
    };
    const valor = async (sql, args = []) =>
      Object.values((await db.query(sql, args)).rows[0])[0];
    const hoy = String(await valor("SELECT hoy_chile()::text"));
    const fecha = async (dias) =>
      String(await valor("SELECT (hoy_chile()+$1::int)::text", [dias]));
    const recibir = async (
      codigo,
      dias,
      bodega = 1,
      clave = randomUUID(),
      cantidad = 10,
    ) =>
      db.query("SELECT recibir_lote($1::jsonb)", [
        JSON.stringify({
          operacion: clave,
          id_producto: 1,
          numero_lote: codigo,
          fecha_vencimiento: await fecha(dias),
          fecha_ingreso: hoy,
          id_bodega: bodega,
          stock_inicial: cantidad,
          costo_unitario: 100,
        }),
      ]);
    const operar = (
      id,
      tipo,
      cantidad = 1,
      clave = randomUUID(),
      motivo = null,
      destino = null,
    ) =>
      db.query("SELECT operar_stock($1,$2,$3,$4,$5,$6)", [
        id,
        cantidad,
        tipo,
        clave,
        motivo,
        destino,
      ]);
    await como(bodeguero);
    await t.test("recepción transaccional y clave idempotente", async () => {
      const clave = randomUUID();
      const a = await recibir("PRIMERO", 10, 1, clave);
      const b = await recibir("PRIMERO", 10, 1, clave);
      assert.equal(a.rows[0].recibir_lote, b.rows[0].recibir_lote);
      assert.equal(await valor("SELECT count(*)::int FROM inventario"), 1);
      await assert.rejects(recibir("PRIMERO", 10, 1, clave, 99), /otros datos/);
      await assert.rejects(recibir("OTRA_SUCURSAL", 20, 3), /no autorizada/i);
      await assert.rejects(recibir("CADUCADO", 0), /caducados/i);
      assert.equal(await valor("SELECT count(*)::int FROM lote"), 1);
    });
    await recibir("SEGUNDO", 30);
    await recibir("ALMACEN", 20, 2);
    await como(auxiliar);
    await t.test("FEFO y bloqueo de mutaciones del auxiliar", async () => {
      await assert.rejects(recibir("SIN_PERMISO", 40), /no autorizada/i);
      await assert.rejects(operar(2, "SALIDA"), /FEFO/);
      await assert.rejects(operar(3, "SALIDA"), /sala de ventas/);
      await assert.rejects(
        operar(1, "MERMA", 1, randomUUID(), "DETERIORO"),
        /no autorizada/,
      );
      await assert.rejects(
        db.exec("UPDATE inventario SET stock_actual=900"),
        /permission denied/,
      );
      await assert.rejects(
        db.exec("SELECT password_hash FROM usuario"),
        /permission denied/,
      );
      const clave = randomUUID();
      await operar(1, "SALIDA", 1, clave);
      await operar(1, "SALIDA", 1, clave);
      await assert.rejects(operar(1, "SALIDA", 2, clave), /otros datos/);
      assert.equal(
        await valor(
          "SELECT stock_actual FROM inventario WHERE id_inventario=1",
        ),
        9,
      );
      await assert.rejects(operar(1, "SALIDA", 100), /insuficiente/);
    });
    await como(bodeguero);
    await t.test(
      "merma y traslado conservan existencias y auditoría",
      async () => {
        await assert.rejects(operar(1, "MERMA", 2), /motivo/);
        await operar(1, "MERMA", 2, randomUUID(), "DETERIORO");
        assert.equal(
          await valor(
            "SELECT stock_actual FROM inventario WHERE id_inventario=1",
          ),
          7,
        );
        assert.equal(await valor("SELECT count(*)::int FROM merma"), 1);
        await operar(1, "TRASLADO", 3, randomUUID(), "Reubicación", 2);
        assert.equal(
          await valor("SELECT sum(stock_actual)::int FROM inventario"),
          27,
        );
        assert.equal(
          await valor(
            "SELECT stock_actual FROM inventario WHERE id_inventario=1",
          ),
          4,
        );
      },
    );
    await db.exec("RESET ROLE");
    await db.exec(
      "UPDATE lote SET fecha_vencimiento=hoy_chile() WHERE numero_lote='PRIMERO'; INSERT INTO lote(numero_lote,fecha_vencimiento,id_producto) VALUES ('AJENO',hoy_chile()+10,1); INSERT INTO inventario(id_lote,id_bodega,stock_actual) SELECT id_lote,3,7 FROM lote WHERE numero_lote='AJENO';",
    );
    await como(auxiliar);
    await t.test(
      "vencimiento en el día actual, holgura y aislamiento de sucursal",
      async () => {
        await assert.rejects(operar(1, "SALIDA"), /CADUCIDAD/);
        assert.equal(
          await valor("SELECT count(*)::int FROM inventario WHERE id_bodega=3"),
          0,
        );
        assert.equal(await valor("SELECT count(*)::int FROM merma"), 0);
        await db.exec(
          "RESET ROLE; UPDATE configuracion SET holgura_dias=31 WHERE id=1",
        );
        await como(auxiliar);
        await assert.rejects(operar(2, "SALIDA"), /holgura/);
      },
    );
    await como(inactivo);
    await t.test(
      "usuario desactivado pierde acceso inmediatamente",
      async () => {
        assert.equal(await valor("SELECT count(*)::int FROM inventario"), 0);
        await assert.rejects(operar(1, "SALIDA"), /inválida/);
      },
    );
    await db.exec("RESET ROLE");
    await t.test("no se puede desactivar el último administrador", async () => {
      await assert.rejects(
        db.query("UPDATE usuario SET activo=false WHERE id_usuario=$1", [
          admin,
        ]),
        /administradora activa/,
      );
      await assert.rejects(
        db.query("DELETE FROM usuario WHERE id_usuario=$1", [admin]),
        /administradora activa/,
      );
    });
    await t.test(
      "cron solo accesible al servidor y datos inaccesibles al anónimo",
      async () => {
        await como(auxiliar);
        await assert.rejects(
          db.query("SELECT generar_alertas()"),
          /permission denied/,
        );
        await db.exec("RESET ROLE; SET ROLE anon");
        await assert.rejects(
          db.query("SELECT * FROM inventario"),
          /permission denied/,
        );
        await db.exec("RESET ROLE; SET ROLE service_role");
        assert.equal(await valor("SELECT count(*)::int FROM usuario"), 4);
        assert.equal(await valor("SELECT count(*)::int FROM configuracion"), 1);
        await db.exec("RESET ROLE");
      },
    );
    await t.test(
      "alertas sin duplicados, resúmenes y reserva exclusiva",
      async () => {
        const primera = await valor("SELECT generar_alertas()");
        assert.ok(primera > 0);
        assert.equal(await valor("SELECT generar_alertas()"), 0);
        const total = await valor("SELECT count(*)::int FROM correo_resumen");
        assert.equal(total, 2);
        const reservados = await db.query("SELECT * FROM reclamar_correos()");
        assert.equal(reservados.rows.length, 2);
        assert.equal(
          (await db.query("SELECT * FROM reclamar_correos()")).rows.length,
          0,
        );
        const envio = reservados.rows[0];
        await db.query("SELECT finalizar_correo($1,$2,NULL)", [
          envio.id_envio,
          "resend-prueba",
        ]);
        assert.equal(
          await valor(
            "SELECT estado_correo FROM notificacion WHERE id_envio=$1 LIMIT 1",
            [envio.id_envio],
          ),
          "ENVIADO",
        );
        const pendiente = reservados.rows[1];
        await db.query(
          "UPDATE correo_resumen SET primer_intento=now()-interval '25 hours',disponible=now() WHERE id_envio=$1",
          [pendiente.id_envio],
        );
        assert.equal(
          (await db.query("SELECT * FROM reclamar_correos()")).rows.length,
          0,
        );
        assert.equal(
          await valor("SELECT estado FROM correo_resumen WHERE id_envio=$1", [
            pendiente.id_envio,
          ]),
          "REVISION",
        );
      },
    );
  } finally {
    await db.close();
  }
});
