import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      try {
        return next(specifier + ".ts", context);
      } catch {
        /* resolución normal */
      }
    }
    return next(specifier, context);
  },
});
const { inicializarBaseLocal, ejecutarLocal } =
  await import("../src/lib/datos/local.ts");
const { comandoDatos } = await import("../src/lib/datos/contrato.ts");
const cuentas = [1, 2, 3].map(
  (id) => `10000000-0000-4000-8000-00000000000${id}`,
);
test("datos locales: tres roles, persistencia, stock y aislamiento", async (t) => {
  const db = await inicializarBaseLocal(new PGlite());
  const leer = (actor, tabla) =>
    ejecutarLocal(db, actor, { accion: "leer", tabla });
  try {
    await t.test(
      "los tres perfiles tienen configuración, catálogo, inventario y alertas",
      async () => {
        for (const actor of cuentas) {
          for (const tabla of [
            "configuracion",
            "producto",
            "lote",
            "inventario",
            "sucursal",
            "bodega",
            "farmacia",
            "notificacion",
          ])
            assert.ok((await leer(actor, tabla)).length, `${actor}: ${tabla}`);
        }
        assert.ok((await leer(cuentas[0], "movimiento_inventario")).length);
        const lote = (await leer(cuentas[0], "lote"))[0];
        assert.match(lote.fecha_vencimiento, /^\d{4}-\d{2}-\d{2}$/);
        assert.match(lote.fecha_ingreso, /^\d{4}-\d{2}-\d{2}$/);
        assert.equal(typeof lote.costo_unitario, "number");
        assert.match(
          (await leer(cuentas[0], "merma"))[0].fecha_baja,
          /^\d{4}-\d{2}-\d{2}$/,
        );
        assert.ok((await leer(cuentas[1], "merma")).length);
        assert.equal(
          (await leer(cuentas[2], "movimiento_inventario")).length,
          0,
        );
        assert.equal((await leer(cuentas[0], "usuario")).length, 3);
        assert.equal((await leer(cuentas[2], "usuario")).length, 1);
        assert.equal(
          "password_hash" in (await leer(cuentas[0], "usuario"))[0],
          false,
        );
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM notificacion WHERE estado_correo != 'NO_APLICA'",
            )
          ).rows[0].n,
          0,
        );
      },
    );
    await t.test(
      "los saldos de ejemplo coinciden con entradas, salidas y mermas",
      async () => {
        const { rows } =
          await db.query(`SELECT i.id_inventario FROM inventario i
        JOIN movimiento_inventario m USING(id_inventario) GROUP BY i.id_inventario
        HAVING i.stock_actual != sum(CASE WHEN m.tipo_movimiento='ENTRADA' THEN m.cantidad ELSE -m.cantidad END)`);
        assert.equal(rows.length, 0);
      },
    );
    await t.test(
      "cambios compartidos entre roles y re-inicialización no repone datos",
      async () => {
        const operacion = randomUUID();
        const previo = (await leer(cuentas[0], "inventario"))[0].stock_actual;
        const datos = { inventario: 1, cantidad: 1, tipo: "SALIDA", operacion };
        await ejecutarLocal(db, cuentas[2], { accion: "operar", datos });
        await ejecutarLocal(db, cuentas[2], { accion: "operar", datos });
        await inicializarBaseLocal(db);
        assert.equal(
          (await leer(cuentas[1], "inventario"))[0].stock_actual,
          previo - 1,
        );
        await ejecutarLocal(db, cuentas[0], {
          accion: "guardar",
          tabla: "configuracion",
          id: 1,
          campos: { holgura_dias: 2 },
        });
        assert.equal(
          (await leer(cuentas[2], "configuracion"))[0].holgura_dias,
          2,
        );
        await assert.rejects(
          ejecutarLocal(db, cuentas[1], {
            accion: "guardar",
            tabla: "configuracion",
            id: 1,
            campos: { holgura_dias: 5 },
          }),
          /permiso|permission|policy/i,
        );
        await assert.rejects(
          ejecutarLocal(db, cuentas[2], {
            accion: "operar",
            datos: {
              ...datos,
              operacion: randomUUID(),
              tipo: "MERMA",
              motivo: "DETERIORO",
            },
          }),
          /autoriz/i,
        );
      },
    );
    await t.test(
      "recepción, emisión de reportes y alertas usan la misma base",
      async () => {
        const fecha = (
          await db.query(
            "SELECT (hoy_chile()+120)::text AS venc, hoy_chile()::text AS hoy",
          )
        ).rows[0];
        await ejecutarLocal(db, cuentas[1], {
          accion: "recibir",
          datos: {
            id_producto: 1,
            numero_lote: "TEST-NUEVO",
            fecha_vencimiento: fecha.venc,
            fecha_ingreso: fecha.hoy,
            id_bodega: 2,
            stock_inicial: 3,
            costo_unitario: 100,
            operacion: randomUUID(),
          },
        });
        assert.ok(
          (await leer(cuentas[2], "lote")).some(
            (l) => l.numero_lote === "TEST-NUEVO",
          ),
        );
        await ejecutarLocal(db, cuentas[0], {
          accion: "guardar",
          tabla: "reporte",
          campos: {
            id_usuario: cuentas[0],
            tipo: "INVENTARIO",
            formato: "PDF",
          },
        });
        assert.equal((await leer(cuentas[0], "reporte")).length, 1);
        const alerta = (await leer(cuentas[2], "notificacion"))[0];
        await ejecutarLocal(db, cuentas[2], {
          accion: "guardar",
          tabla: "notificacion",
          id: alerta.id_notificacion,
          campos: { estado: "LEIDO" },
        });
        assert.equal(
          (await leer(cuentas[2], "notificacion"))[0].estado,
          "LEIDO",
        );
      },
    );
    await t.test(
      "contrato cerrado: sin SQL libre, escrituras de usuarios ni columnas sensibles",
      async () => {
        assert.equal(
          comandoDatos.safeParse({
            accion: "leer",
            tabla: "usuario; DROP TABLE producto",
          }).success,
          false,
        );
        assert.equal(
          comandoDatos.safeParse({
            accion: "guardar",
            tabla: "usuario",
            campos: { activo: false },
          }).success,
          false,
        );
        await assert.rejects(
          ejecutarLocal(db, cuentas[0], {
            accion: "guardar",
            tabla: "producto",
            id: 1,
            campos: { "nombre=1; DROP TABLE producto;--": 1 },
          }),
          /no permitidos/,
        );
      },
    );
  } finally {
    await db.close();
  }
});
