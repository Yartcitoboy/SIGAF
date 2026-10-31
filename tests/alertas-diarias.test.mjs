import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { errorCorreoReal } from "../supabase/functions/_shared/correo.ts";
import { mensajeResumen } from "../supabase/functions/sigaf-alertas/dominio.ts";
import {
  mensajeMime,
  enviarGmail,
  ErrorEntrega,
  renovarAcceso,
} from "../supabase/functions/sigaf-alertas/gmail.ts";
const archivoCorreccionGmail = new URL(
  "../supabase/migrations/20261030063632_corregir_guardado_configuracion_gmail.sql",
  import.meta.url,
);
test("guardado Gmail: las mutaciones mantienen filtros compatibles con safeupdate", async () => {
  // PGlite no carga pg_safeupdate: comprobamos además el filtro exterior de
  // cada mutación de las definiciones que se ejecutan en la prueba OAuth.
  const sql = await readFile(archivoCorreccionGmail, "utf8");
  const cuerpos = [...sql.matchAll(/AS \$\$([\s\S]*?)\$\$;/g)];
  assert.equal(cuerpos.length, 5);
  let total = 0;
  for (const [, cuerpo] of cuerpos) {
    for (const [sentencia] of cuerpo.matchAll(
      /\b(?:UPDATE\s+[\w.]+\s+SET|DELETE\s+FROM\s+[\w.]+)\b[^;]*/gi,
    )) {
      let exterior = sentencia;
      while (/\([^()]*\)/.test(exterior))
        exterior = exterior.replace(/\([^()]*\)/g, "");
      assert.match(exterior, /\bWHERE\b/i, sentencia);
      assert.doesNotMatch(exterior, /\bWHERE\s+(?:true|1\s*=\s*1)\s*$/i);
      total++;
    }
  }
  assert.equal(total, 7);
});
test("correo: una dirección de prueba no se convierte en Gmail", () => {
  for (const email of [
    "alex.sigaf@gmail.com",
    "equipo@farmacia.cl",
    "alex.sigaf+alertas@googlemail.com",
  ])
    assert.equal(errorCorreoReal(email), null);
  for (const email of [
    "alex.sigaf@local.com",
    "a@equipo.local",
    "a@example.com",
    "a@host.invalid",
    "a..b@gmail.com",
    "a@gmail.com\r\nBcc: otra@correo.cl",
  ])
    assert.ok(errorCorreoReal(email));
});
test("correo Gmail: MIME UTF-8 y HTML seguro con vencimientos, ubicación y stock", () => {
  const m = mensajeResumen("2026-10-30", [
    {
      producto: "Medicamento <script>alert(1)</script>",
      registro_isp: "F-123/26",
      lote: "L-Á",
      vencimiento: "2026-10-30",
      dias: 0,
      estado: "VENCIDO",
      stock: 3,
      presentacion: "Caja",
      ubicacion: "Vitrina",
      sucursal: "Central",
    },
  ]);
  assert.match(m.text, /VENCE HOY/);
  assert.match(m.text, /3 Caja/);
  assert.doesNotMatch(m.html, /<script>/);
  assert.match(m.html, /&lt;script&gt;/);
  const raw = mensajeMime(
    "remitente@gmail.com",
    "destino@gmail.com",
    m,
    "1234-abcd",
  );
  const decodificado = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(decodificado, /To: destino@gmail.com/);
  assert.match(decodificado, /multipart\/alternative/);
  assert.match(decodificado, /Subject: =\?UTF-8\?B\?/);
  assert.equal(
    mensajeMime("remitente@gmail.com", "destino@gmail.com", m, "1234-abcd"),
    raw,
  );
  assert.throws(() =>
    mensajeMime(
      "remitente@gmail.com",
      "x@gmail.com\r\nBcc: secreto@gmail.com",
      m,
      "id",
    ),
  );
});
test("Gmail API: errores ambiguos no se repiten; cuota sí admite reintento", async () => {
  const mensaje = { subject: "SIGAF", text: "Resumen", html: "<p>Resumen</p>" };
  let peticion;
  assert.equal(
    await enviarGmail(
      "token-ficticio",
      "envio@gmail.com",
      "destino@gmail.com",
      mensaje,
      "id-prueba",
      async (url, opciones) => {
        peticion = { url, opciones };
        return Response.json({ id: "gmail-id" });
      },
    ),
    "gmail-id",
  );
  assert.equal(
    peticion.url,
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
  );
  assert.ok(JSON.parse(peticion.opciones.body).raw);
  for (const [status, reintentar] of [
    [429, true],
    [500, false],
    [400, false],
    [401, true],
  ])
    await assert.rejects(
      enviarGmail(
        "t",
        "envio@gmail.com",
        "destino@gmail.com",
        mensaje,
        "id-prueba",
        async () => Response.json({ error: {} }, { status }),
      ),
      (e) => e instanceof ErrorEntrega && e.reintentar === reintentar,
    );
  await assert.rejects(
    enviarGmail(
      "t",
      "envio@gmail.com",
      "destino@gmail.com",
      mensaje,
      "id-prueba",
      async () => {
        throw Error("timeout");
      },
    ),
    (e) => !e.reintentar,
  );
  assert.equal(
    await renovarAcceso(
      "cliente",
      "secreto",
      "refresh",
      async (url, opciones) => {
        assert.equal(url, "https://oauth2.googleapis.com/token");
        assert.equal(opciones.body.get("grant_type"), "refresh_token");
        return Response.json({ access_token: "nuevo-token-ficticio" });
      },
    ),
    "nuevo-token-ficticio",
  );
});
test("PostgreSQL: caducidad diaria, alcance, confirmación y envíos sin duplicados", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE SCHEMA auth;
   CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz DEFAULT now(),deleted_at timestamptz,is_anonymous boolean DEFAULT false);
   CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;`);
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
      "20261030052521_alertas_diarias_y_destinatarios.sql",
    ])
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + nombre, import.meta.url),
          "utf8",
        ),
      );
    const ids = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
    ];
    await db.exec(`INSERT INTO perfil(nombre) VALUES('ADMIN'),('BODEGUERO'),('AUXILIAR');INSERT INTO farmacia(razon_social,rut) VALUES('Prueba','1-9');
   INSERT INTO sucursal(nombre,id_farmacia) VALUES('Central',1),('Otra',1);INSERT INTO bodega(nombre,id_sucursal,es_sala_ventas) VALUES('Almacén',1,false),('Vitrina',1,true),('Ajena',2,true);
   INSERT INTO categoria(nombre) VALUES('Prueba');INSERT INTO producto(nombre,id_categoria,unidad_medida) VALUES('Medicamento',1,'Caja');
   INSERT INTO lote(numero_lote,fecha_vencimiento,id_producto) VALUES('HOY',hoy_chile(),1),('CRITICO',hoy_chile()+5,1),('PREVENTIVO',hoy_chile()+20,1),('FUERA',hoy_chile()+90,1),('SIN_STOCK',hoy_chile()-1,1);
   INSERT INTO inventario(id_lote,id_bodega,stock_actual) SELECT l.id_lote,b.id_bodega,CASE WHEN l.numero_lote='SIN_STOCK' THEN 0 ELSE 10 END FROM lote l CROSS JOIN bodega b;`);
    for (const [i, rol, email] of [
      [0, 1, "admin@gmail.com"],
      [1, 2, "bodega@gmail.com"],
      [2, 3, "aux@gmail.com"],
      [3, 2, "cuenta@local.com"],
      [4, 2, "sin-confirmar@gmail.com"],
    ]) {
      await db.query(
        "INSERT INTO usuario(id_usuario,nombre,email,id_perfil,id_sucursal,activo) VALUES($1,'Prueba',$2,$3,1,true)",
        [ids[i], email, rol],
      );
      await db.query("INSERT INTO auth.users(id) VALUES($1)", [ids[i]]);
      if (i < 4)
        await db.query(
          "INSERT INTO correo_destino(id_usuario,email,confirmado_en) VALUES($1,$2,now())",
          [ids[i], email],
        );
    }
    const n = async (sql, args = []) =>
      Object.values((await db.query(sql, args)).rows[0])[0];
    await t.test(
      "no adelanta el primer corte y no genera correos fuera del horario programado",
      async () => {
        assert.equal(await n("SELECT preparar_resumen_diario()"), 0);
        assert.equal(await n("SELECT count(*)::int FROM correo_resumen"), 0);
        await db.exec(
          "UPDATE sigaf_privado.programacion_alertas SET fecha_inicio=hoy_chile()",
        );
      },
    );
    await t.test(
      "incluye preventivos, críticos y hoy; excluye agotados y fechas lejanas",
      async () => {
        assert.equal(await n("SELECT preparar_resumen_diario()"), 3);
        const { rows } = await db.query(
          "SELECT id_usuario,mensajes FROM correo_resumen ORDER BY id_usuario",
        );
        assert.equal(
          rows.find((r) => r.id_usuario === ids[0]).mensajes.length,
          9,
        );
        assert.equal(
          rows.find((r) => r.id_usuario === ids[1]).mensajes.length,
          6,
        );
        assert.equal(
          rows.find((r) => r.id_usuario === ids[2]).mensajes.length,
          3,
        );
        assert.ok(
          rows
            .find((r) => r.id_usuario === ids[2])
            .mensajes.every((m) => m.ubicacion === "Vitrina"),
        );
        assert.ok(
          rows.every((r) =>
            r.mensajes.every((m) => !["FUERA", "SIN_STOCK"].includes(m.lote)),
          ),
        );
        assert.equal(
          await n(
            "SELECT count(*)::int FROM correo_resumen WHERE id_usuario=$1",
            [ids[3]],
          ),
          0,
        );
        assert.equal(
          await n(
            "SELECT count(*)::int FROM correo_resumen WHERE id_usuario=$1",
            [ids[4]],
          ),
          0,
        );
        assert.ok(
          await n(
            "SELECT count(*)::int FROM notificacion WHERE id_usuario=$1",
            [ids[3]],
          ),
        );
      },
    );
    await t.test(
      "un resumen diario no se duplica aunque el cron se repita",
      async () => {
        assert.equal(await n("SELECT preparar_resumen_diario()"), 0);
        await db.exec(
          "UPDATE sigaf_privado.programacion_alertas SET ultima_fecha=NULL",
        );
        assert.equal(await n("SELECT preparar_resumen_diario()"), 0);
        assert.equal(await n("SELECT count(*)::int FROM correo_resumen"), 3);
      },
    );
    await t.test(
      "reservas exclusivas; una entrega incierta requiere revisión",
      async () => {
        const { rows } = await db.query("SELECT * FROM reclamar_correos()");
        assert.equal(rows.length, 3);
        assert.equal(
          (await db.query("SELECT * FROM reclamar_correos()")).rows.length,
          0,
        );
        const a = rows.find((r) => r.id_usuario === ids[0]);
        assert.equal(
          await n("SELECT finalizar_resumen_diario($1,$2,$3,NULL,true)", [
            a.id_envio,
            randomUUID(),
            "gmail-id",
          ]),
          false,
        );
        assert.equal(
          await n("SELECT finalizar_resumen_diario($1,$2,$3,NULL,true)", [
            a.id_envio,
            a.reserva,
            "gmail-id",
          ]),
          true,
        );
        await db.exec(
          "UPDATE correo_resumen SET disponible=now()-interval '1 minute' WHERE estado='PROCESANDO'",
        );
        assert.equal(
          (await db.query("SELECT * FROM reclamar_correos()")).rows.length,
          0,
        );
        assert.equal(
          await n(
            "SELECT count(*)::int FROM correo_resumen WHERE estado='REVISION'",
          ),
          2,
        );
      },
    );
    await t.test(
      "un cambio de correo invalida su confirmación y los envíos anteriores",
      async () => {
        await db.query(
          "UPDATE usuario SET email='nuevo@gmail.com' WHERE id_usuario=$1",
          [ids[1]],
        );
        assert.equal(
          await n(
            "SELECT count(*)::int FROM correo_destino WHERE id_usuario=$1",
            [ids[1]],
          ),
          0,
        );
      },
    );
    await t.test(
      "código de un solo uso, límite de intentos y caducidad",
      async () => {
        const nonce = randomUUID(),
          hash = "a".repeat(64);
        await db.query("SELECT solicitar_codigo_correo($1,$2,$3)", [
          ids[4],
          nonce,
          hash,
        ]);
        for (let i = 0; i < 5; i++)
          assert.equal(
            await n("SELECT confirmar_codigo_correo($1,$2,$3)", [
              ids[4],
              nonce,
              "b".repeat(64),
            ]),
            false,
          );
        assert.equal(
          await n("SELECT confirmar_codigo_correo($1,$2,$3)", [
            ids[4],
            nonce,
            hash,
          ]),
          false,
        );
        await db.exec(
          "UPDATE sigaf_privado.codigo_correo SET solicitado=now()-interval '2 minutes'",
        );
        await db.query("SELECT solicitar_codigo_correo($1,$2,$3)", [
          ids[4],
          nonce,
          hash,
        ]);
        assert.equal(
          await n("SELECT confirmar_codigo_correo($1,$2,$3)", [
            ids[4],
            nonce,
            hash,
          ]),
          true,
        );
        assert.equal(
          await n("SELECT confirmar_codigo_correo($1,$2,$3)", [
            ids[4],
            nonce,
            hash,
          ]),
          false,
        );
        await db.query("SELECT solicitar_codigo_correo($1,$2,$3)", [
          ids[4],
          nonce,
          hash,
        ]);
        await db.exec(
          "UPDATE sigaf_privado.codigo_correo SET vence=now()-interval '1 second'",
        );
        assert.equal(
          await n("SELECT confirmar_codigo_correo($1,$2,$3)", [
            ids[4],
            nonce,
            hash,
          ]),
          false,
        );
      },
    );
    await t.test(
      "un rol o sucursal distintos bloquean el contenido ya preparado",
      async () => {
        await db.exec(
          "UPDATE sigaf_privado.programacion_alertas SET ultima_fecha=NULL",
        );
        await db.exec("DELETE FROM correo_resumen");
        await db.exec("SELECT preparar_resumen_diario()");
        const { rows } = await db.query("SELECT * FROM reclamar_correos()");
        const envio = rows.find((r) => r.id_usuario === ids[0]);
        assert.ok(envio);
        await db.query("UPDATE usuario SET id_sucursal=2 WHERE id_usuario=$1", [
          ids[0],
        ]);
        assert.equal(
          await n("SELECT autorizar_resumen_diario($1,$2)", [
            envio.id_envio,
            envio.reserva,
          ]),
          false,
        );
      },
    );
    await t.test(
      "no se exponen códigos ni operaciones del servidor a clientes",
      async () => {
        await db.exec("SET ROLE authenticated");
        await assert.rejects(
          db.query("SELECT * FROM sigaf_privado.codigo_correo"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("SELECT reclamar_correos()"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("SELECT preparar_resumen_diario()"),
          /permission denied/,
        );
        await db.exec("RESET ROLE");
      },
    );
    await t.test(
      "cron y OAuth: secretos privados, estado de un solo uso y remitente confirmado por Google",
      async () => {
        // Dobles solo del entorno aislado: nunca crean secretos ni solicitudes reales.
        await db.exec(`CREATE SCHEMA vault;CREATE TABLE vault.secrets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text UNIQUE,secret text);
       CREATE VIEW vault.decrypted_secrets AS SELECT id,name,secret AS decrypted_secret FROM vault.secrets;
       CREATE FUNCTION vault.create_secret(new_secret text,new_name text DEFAULT NULL,new_description text DEFAULT NULL,new_key_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql AS $$DECLARE v uuid;BEGIN INSERT INTO vault.secrets(name,secret) VALUES(new_name,new_secret) RETURNING id INTO v;RETURN v;END$$;
       CREATE FUNCTION vault.update_secret(secret_id uuid,new_secret text DEFAULT NULL,new_name text DEFAULT NULL,new_description text DEFAULT NULL,new_key_id uuid DEFAULT NULL) RETURNS void LANGUAGE sql AS $$UPDATE vault.secrets SET secret=coalesce(new_secret,secret) WHERE id=secret_id$$;
       CREATE SCHEMA extensions;CREATE FUNCTION extensions.gen_random_bytes(int) RETURNS bytea LANGUAGE sql AS $$SELECT decode(repeat('aa',$1),'hex')$$;
       CREATE SCHEMA cron;CREATE TABLE cron.job(jobid bigint GENERATED ALWAYS AS IDENTITY,jobname text UNIQUE,schedule text,command text,active boolean DEFAULT true);
       CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE plpgsql AS $$DECLARE v bigint;BEGIN INSERT INTO cron.job(jobname,schedule,command) VALUES($1,$2,$3) RETURNING jobid INTO v;RETURN v;END$$;
       CREATE SCHEMA net;CREATE FUNCTION net.http_post(url text,body jsonb DEFAULT '{}'::jsonb,params jsonb DEFAULT '{}'::jsonb,headers jsonb DEFAULT '{}'::jsonb,timeout_milliseconds int DEFAULT 2000) RETURNS bigint LANGUAGE sql AS $$SELECT 1::bigint$$;`);
        const infraestructura = await readFile(
          new URL(
            "../supabase/migrations/20261030052832_cron_alertas_y_correo_vault.sql",
            import.meta.url,
          ),
          "utf8",
        );
        assert.equal(
          (infraestructura.match(/^CREATE EXTENSION.*$/gm) || []).length,
          2,
        );
        await db.exec(infraestructura.replace(/^CREATE EXTENSION.*$/gm, ""));
        await db.exec(await readFile(archivoCorreccionGmail, "utf8"));
        assert.equal(
          await n(
            "SELECT count(*)::int FROM cron.job WHERE active AND schedule='* * * * *' AND jobname='sigaf-caducidad-diaria'",
          ),
          1,
        );
        const cliente = "cliente_prueba.apps.googleusercontent.com";
        await assert.rejects(
          db.query("SELECT configurar_correo_alertas($1,$2,$3,$4,false)", [
            ids[2],
            cliente,
            "secreto-ficticio",
            "https://prueba.supabase.co",
          ]),
          /Solo Admin/,
        );
        await db.query("SELECT configurar_correo_alertas($1,$2,$3,$4,false)", [
          ids[0],
          cliente,
          "secreto-ficticio",
          "https://prueba.supabase.co",
        ]);
        assert.equal(
          (await n("SELECT estado_entrega_alertas($1)", [ids[0]]))
            .proveedor_configurado,
          true,
        );
        // Reintentar con el mismo cliente y secreto vacío conserva el guardado.
        await db.query("SELECT configurar_correo_alertas($1,$2,'',$3,true)", [
          ids[0],
          cliente,
          "https://prueba.supabase.co",
        ]);
        assert.equal(
          await n(
            "SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_secret'",
          ),
          "secreto-ficticio",
        );
        assert.equal(
          (await n("SELECT estado_entrega_alertas($1)", [ids[0]]))
            .correo_activo,
          false,
        );
        await db.query(
          "INSERT INTO sigaf_privado.vinculo_gmail(hash,id_usuario,vence) VALUES($1,$3,now()+interval '10 minutes'),($2,$3,now()-interval '1 minute')",
          ["d".repeat(64), "e".repeat(64), ids[0]],
        );
        const otroCliente = "otro_cliente.apps.googleusercontent.com";
        await db.query("SELECT configurar_correo_alertas($1,$2,$3,$4,false)", [
          ids[0],
          otroCliente,
          "otro-secreto-ficticio",
          "https://prueba.supabase.co",
        ]);
        assert.equal(
          await n(
            "SELECT count(*)::int FROM sigaf_privado.vinculo_gmail WHERE vence>now()",
          ),
          0,
        );
        assert.equal(
          await n(
            "SELECT count(*)::int FROM sigaf_privado.vinculo_gmail WHERE vence<=now()",
          ),
          1,
        );
        await db.query("SELECT configurar_correo_alertas($1,$2,$3,$4,false)", [
          ids[0],
          cliente,
          "secreto-ficticio",
          "https://prueba.supabase.co",
        ]);
        await db.query("SELECT error_integracion_gmail($1)", [
          "Error aislado de prueba",
        ]);
        assert.equal(
          (await n("SELECT estado_entrega_alertas($1)", [ids[0]]))
            .administracion.error,
          "Error aislado de prueba",
        );
        const state = "c".repeat(64);
        await db.query("SELECT iniciar_vinculo_gmail($1,$2)", [ids[0], state]);
        assert.equal(
          await n("SELECT consumir_vinculo_gmail($1)", [state]),
          ids[0],
        );
        assert.equal(
          await n("SELECT consumir_vinculo_gmail($1)", [state]),
          null,
        );
        await db.query("SELECT guardar_vinculo_gmail($1,$2,$3,$4)", [
          ids[0],
          cliente,
          "refresh-ficticio",
          "remitente@gmail.com",
        ]);
        const visible = await n("SELECT estado_entrega_alertas($1)", [ids[0]]);
        assert.equal(visible.gmail_conectado, true);
        assert.equal(visible.correo_activo, true);
        assert.equal(visible.administracion.remitente, "remitente@gmail.com");
        assert.doesNotMatch(
          JSON.stringify(visible),
          /secreto-ficticio|refresh-ficticio/,
        );
        const auxiliar = await n("SELECT estado_entrega_alertas($1)", [ids[2]]);
        assert.equal(auxiliar.administracion, null);
        await db.exec("SET ROLE authenticated");
        await assert.rejects(
          db.query("SELECT configuracion_envio_alertas()"),
          /permission denied/,
        );
        await assert.rejects(
          db.query("SELECT * FROM sigaf_privado.vinculo_gmail"),
          /permission denied/,
        );
        await db.exec("RESET ROLE");
      },
    );
    await t.test(
      "repite el resumen al cambiar el día de Chile y respeta el salto de horario de verano",
      async () => {
        const anterior = await n("SELECT hoy_chile()::text");
        const siguiente = await n("SELECT (hoy_chile()+1)::text");
        await db.query("SELECT set_config('sigaf.prueba_fecha',$1,false)", [
          siguiente,
        ]);
        await db.exec(
          "CREATE OR REPLACE FUNCTION public.hoy_chile() RETURNS date LANGUAGE sql STABLE AS $$SELECT current_setting('sigaf.prueba_fecha')::date$$",
        );
        assert.ok((await n("SELECT preparar_resumen_diario()")) > 0);
        assert.equal(await n("SELECT preparar_resumen_diario()"), 0);
        assert.ok(
          (await n(
            "SELECT count(*)::int FROM correo_resumen WHERE fecha_resumen=$1",
            [anterior],
          )) > 0,
        );
        assert.ok(
          (await n(
            "SELECT count(*)::int FROM correo_resumen WHERE fecha_resumen=$1",
            [siguiente],
          )) > 0,
        );
        const cambios = await db.query(
          "SELECT ('2026-06-01 03:59:00+00'::timestamptz AT TIME ZONE 'America/Santiago')::date::text AS invierno_antes,('2026-06-01 04:00:00+00'::timestamptz AT TIME ZONE 'America/Santiago')::date::text AS invierno_despues,('2026-09-06 03:59:00+00'::timestamptz AT TIME ZONE 'America/Santiago')::date::text AS verano_antes,('2026-09-06 04:00:00+00'::timestamptz AT TIME ZONE 'America/Santiago')::date::text AS verano_despues",
        );
        assert.deepEqual(cambios.rows[0], {
          invierno_antes: "2026-05-31",
          invierno_despues: "2026-06-01",
          verano_antes: "2026-09-05",
          verano_despues: "2026-09-06",
        });
      },
    );
  } finally {
    await db.close();
  }
});
