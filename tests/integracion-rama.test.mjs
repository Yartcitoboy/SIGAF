import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
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
const { planificarDispensacion } =
  await import("../src/lib/vistas/dispensacion.ts");
const { prepararEtiquetaLote } =
  await import("../src/lib/vistas/etiqueta-lote.ts");
const { nombreResponsable } = await import("../src/lib/vistas/responsables.ts");
const { dispensar } = await import("../src/lib/servicios/dispensacion.ts");
const { obtenerHistorialReportes } =
  await import("../src/lib/servicios/reportes.ts");
const { tieneAcceso } = await import("../src/lib/permisos.ts");
const hoy = "2026-10-27";
function escenario() {
  const productos = [
    {
      id_producto: 1,
      nombre: "Medicamento de prueba",
      codigo_barras: "09506000134352",
      unidad_medida: "Caja",
    },
  ];
  const bodegas = [
    { id_bodega: 1, id_sucursal: 1, nombre: "Sala A", es_sala_ventas: true },
    { id_bodega: 2, id_sucursal: 1, nombre: "Sala B", es_sala_ventas: true },
    {
      id_bodega: 3,
      id_sucursal: 2,
      nombre: "Otra sucursal",
      es_sala_ventas: true,
    },
  ];
  const lotes = [
    {
      id_lote: 1,
      id_producto: 1,
      numero_lote: "L-A",
      fecha_vencimiento: "2026-11-10",
      fecha_ingreso: "2026-10-01",
    },
    {
      id_lote: 2,
      id_producto: 1,
      numero_lote: "L-B",
      fecha_vencimiento: "2026-12-10",
      fecha_ingreso: "2026-10-01",
    },
    {
      id_lote: 3,
      id_producto: 1,
      numero_lote: "L-C",
      fecha_vencimiento: "2026-10-30",
      fecha_ingreso: "2026-10-01",
    },
  ];
  const inventario = [
    { id_inventario: 1, id_lote: 1, id_bodega: 1, stock_actual: 8 },
    { id_inventario: 2, id_lote: 2, id_bodega: 2, stock_actual: 20 },
    { id_inventario: 3, id_lote: 3, id_bodega: 3, stock_actual: 30 },
  ].map((i) => ({
    ...i,
    lote: lotes.find((l) => l.id_lote === i.id_lote),
    bodega: bodegas.find((b) => b.id_bodega === i.id_bodega),
  }));
  return {
    productos,
    bodegas,
    lotes,
    inventario,
    configuracion: { holgura_dias: 0 },
    sucursales: [],
    farmacias: [],
    movimientos: [],
    mermas: [],
  };
}
test("integración: FEFO respeta sucursal y detecta el lote previo en otra ubicación", () => {
  const d = escenario(),
    copia = structuredClone(d);
  const p = planificarDispensacion(d, 1, 2, hoy);
  assert.equal(p.sugerido.id_inventario, 1);
  assert.equal(p.otraUbicacion, true);
  assert.equal(p.estado, "OTRA_UBICACION_FEFO");
  assert.deepEqual(
    p.lotes.map((i) => i.id_bodega),
    [2],
  );
  assert.equal(planificarDispensacion(d, 1, 3, hoy).sugerido.id_inventario, 3);
  assert.deepEqual(d, copia);
});
test("integración: caducado hoy, holgura y stock cero no se recomiendan", () => {
  const d = escenario();
  d.lotes[0].fecha_vencimiento = hoy;
  d.lotes[1].fecha_vencimiento = "2026-10-28";
  d.configuracion.holgura_dias = 1;
  const p = planificarDispensacion(d, 1, 1, hoy);
  assert.equal(p.sugerido, undefined);
  assert.equal(p.candidatoVista, undefined);
  assert.equal(p.estado, "BLOQUEADO_FECHA");
  d.inventario[0].stock_actual = 0;
  assert.equal(planificarDispensacion(d, 1, 1, hoy).lotes.length, 0);
});
test("integración: sin clasificación no se recomienda ni simula una entrega", () => {
  const d = escenario();
  for (const b of d.bodegas) delete b.es_sala_ventas;
  const p = planificarDispensacion(d, 1, 1, hoy);
  assert.equal(p.estado, "CLASIFICACION_PENDIENTE");
  assert.equal(p.sugerido, undefined);
  assert.equal(p.candidatoVista, undefined);
});
test("integración: origen fuera del alcance, producto inexistente y fechas incompletas bloquean", () => {
  const d = escenario();
  assert.equal(
    planificarDispensacion(d, 1, 999, hoy).estado,
    "ORIGEN_NO_AUTORIZADO",
  );
  assert.equal(planificarDispensacion(d, 999, 1, hoy).sugerido, undefined);
  d.lotes[0].fecha_vencimiento = "sin-fecha";
  const p = planificarDispensacion(d, 1, 1, hoy);
  assert.equal(p.estado, "FECHA_NO_DISPONIBLE");
  assert.equal(p.sugerido, undefined);
  assert.equal(p.candidatoVista, undefined);
  d.lotes[0].fecha_vencimiento = null;
  assert.equal(
    planificarDispensacion(d, 1, 1, hoy).estado,
    "FECHA_NO_DISPONIBLE",
  );
});
test("integración: salida utiliza una única operación existente, sin autor ni saldo enviados por cliente", async () => {
  const previo = globalThis.fetch,
    llamadas = [];
  globalThis.fetch = async (url, options) => {
    llamadas.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ data: 10 }) };
  };
  try {
    await dispensar({
      inventario: 8,
      cantidad: 2,
      operacion: "10000000-0000-4000-8000-000000000001",
      id_usuario: "no-confiable",
      stockActual: 999,
    });
    assert.equal(llamadas.length, 1);
    assert.equal(llamadas[0].url, "/api/datos");
    assert.deepEqual(llamadas[0].body, {
      accion: "operar",
      datos: {
        inventario: 8,
        cantidad: 2,
        operacion: "10000000-0000-4000-8000-000000000001",
        tipo: "SALIDA",
      },
    });
    for (const cantidad of [0, -1, 1.5, NaN, Infinity])
      await assert.rejects(() =>
        dispensar({ inventario: 8, cantidad, operacion: "x" }),
      );
    await assert.rejects(() =>
      dispensar({ inventario: 8, cantidad: 1, operacion: "" }),
    );
    assert.equal(llamadas.length, 1);
  } finally {
    globalThis.fetch = previo;
  }
});
test("integración: historial solo lee, ordena por fecha y conserva autor real", async () => {
  const previo = globalThis.fetch,
    llamadas = [];
  globalThis.fetch = async (url, options) => {
    const c = JSON.parse(options.body);
    llamadas.push(c);
    return {
      ok: true,
      json: async () => ({
        data:
          c.tabla === "usuario"
            ? [{ id_usuario: "real", nombre: "Autor real" }]
            : [
                {
                  id_reporte: 1,
                  id_usuario: "real",
                  fecha_generacion: "2026-10-25",
                },
                {
                  id_reporte: 2,
                  id_usuario: "sin-nombre",
                  fecha_generacion: "2026-10-27",
                },
              ],
      }),
    };
  };
  try {
    const filas = await obtenerHistorialReportes();
    assert.deepEqual(
      filas.map((r) => r.id_reporte),
      [2, 1],
    );
    assert.equal(filas[1].responsable, "Autor real");
    assert.ok(llamadas.every((c) => c.accion === "leer"));
  } finally {
    globalThis.fetch = previo;
  }
});
test("integración: nombres se resuelven solo por UUID, sin suplantar al administrador", () => {
  const directorio = [{ id_usuario: "uno", nombre: "Persona uno" }];
  assert.equal(nombreResponsable("uno", directorio), "Persona uno");
  assert.equal(
    nombreResponsable("otro", directorio, {
      id_usuario: "local",
      nombre: "Admin temporal",
    }),
    "ID …otro",
  );
});
test("integración: etiqueta suma todas las ubicaciones y no inserta HTML ni genera QR ficticio", async () => {
  const d = escenario();
  d.inventario.push({
    ...d.inventario[0],
    id_inventario: 4,
    id_bodega: 2,
    stock_actual: 3,
    bodega: d.bodegas[1],
  });
  const copia = structuredClone(d),
    etiqueta = prepararEtiquetaLote(d, 1);
  assert.equal(etiqueta.stock, 11);
  assert.equal(etiqueta.ubicaciones.length, 2);
  assert.equal(prepararEtiquetaLote(d, 999), null);
  assert.deepEqual(d, copia);
  const fuente = await readFile(
    new URL("../src/componentes/productos/etiqueta-lote.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    fuente,
    /document\.write|dangerouslySetInnerHTML|innerHTML/,
  );
});
test("integración: Dispensación está protegida y no amplía otros permisos", async () => {
  for (const rol of ["ADMIN", "BODEGUERO", "AUXILIAR"])
    assert.equal(tieneAcceso(rol, "/dispensacion"), true);
  assert.equal(tieneAcceso("AUXILIAR", "/usuarios"), false);
  assert.equal(tieneAcceso("BODEGUERO", "/reportes"), false);
  assert.equal(tieneAcceso("AUXILIAR", "/dispensacion-otra"), false);
  const proxy = await readFile(
    new URL("../src/proxy.ts", import.meta.url),
    "utf8",
  );
  assert.match(proxy, /"\/dispensacion\/:path\*"/);
});
