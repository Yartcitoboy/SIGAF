import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
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
const ui = await import("../src/lib/vistas/presentacion.ts");
const { prepararInformeVisible } =
  await import("../src/lib/vistas/informe-visible.ts");
const hoy = "2026-10-23";
function escenario() {
  const productos = [
    {
      id_producto: 1,
      nombre: "Producto de prueba",
      unidad_medida: "Caja x 10",
    },
  ];
  const bodegas = [
    { id_bodega: 1, nombre: "Origen", id_sucursal: 1 },
    { id_bodega: 2, nombre: "Destino", id_sucursal: 2 },
    { id_bodega: 3, nombre: "Otra empresa", id_sucursal: 3 },
  ];
  const lotes = [
    {
      id_lote: 1,
      id_producto: 1,
      fecha_vencimiento: "2026-10-10",
      producto: productos[0],
    },
    {
      id_lote: 2,
      id_producto: 1,
      fecha_vencimiento: "2026-10-25",
      producto: productos[0],
    },
  ];
  const inventario = [
    {
      id_inventario: 1,
      id_bodega: 1,
      id_lote: 1,
      stock_actual: 145,
      lote: lotes[0],
      bodega: bodegas[0],
    },
    {
      id_inventario: 2,
      id_bodega: 2,
      id_lote: 2,
      stock_actual: 50,
      lote: lotes[1],
      bodega: bodegas[1],
    },
  ];
  return {
    productos,
    bodegas,
    lotes,
    inventario,
    sucursales: [
      { id_sucursal: 1, id_farmacia: 1 },
      { id_sucursal: 2, id_farmacia: 1 },
      { id_sucursal: 3, id_farmacia: 2 },
    ],
    farmacias: [],
    configuracion: { holgura_dias: 0 },
    mermas: [],
    movimientos: [
      {
        id_movimiento: 1,
        id_inventario: 1,
        inventario: inventario[0],
        id_bodega_destino: 2,
        fecha: "2026-10-23T12:00:00Z",
        tipo_movimiento: "TRASLADO",
        cantidad: 10,
        id_usuario: "responsable",
        cumple_fefo: null,
      },
    ],
  };
}
test("frontend: búsqueda tolera tildes, espacios y campos ausentes", () => {
  assert.ok(ui.coincide("  FARMACEUTICO ", null, "Farmacéutico"));
  assert.ok(ui.coincide("", undefined));
  assert.equal(ui.coincide("abc", null), false);
});
test("frontend: ubicación desconocida no se presenta como bodega", () => {
  assert.equal(ui.tipoUbicacion({ nombre: "Sala" }), "Clasificación pendiente");
  assert.equal(ui.tipoUbicacion({ es_sala_ventas: false }), "Bodega");
  assert.equal(ui.tipoUbicacion({ es_sala_ventas: true }), "Sala de ventas");
});
test("frontend: fechas con zona usan Chile y las fechas sin zona no se reinterpretan", () => {
  assert.equal(ui.diaMovimiento("2026-10-24T01:00:00Z"), hoy);
  assert.equal(ui.diaMovimiento("2026-10-24T01:00:00"), "2026-10-24");
  assert.match(ui.fechaHoraVisible("2026-10-24T01:00:00"), /hora de origen/);
  assert.equal(ui.fechaVisible(hoy), "23/10/2026");
});
test("frontend: stock físico, apto por fecha y holgura quedan separados", () => {
  const d = escenario();
  assert.deepEqual(ui.resumirStock(d.inventario, hoy), {
    fisico: 195,
    aptoPorFecha: 50,
    bloqueado: 145,
    sinFecha: 0,
  });
  assert.equal(ui.resumirStock(d.inventario, hoy, 3).bloqueado, 195);
  assert.equal(
    ui.resumirStock(
      [{ stock_actual: 5, lote: { fecha_vencimiento: "inválida" } }],
      hoy,
    ).sinFecha,
    5,
  );
});
test("frontend: costos desconocidos no se convierten en una valoración conocida cero", () => {
  assert.equal(ui.valoracionVisible([{ cantidad: 10 }]).valor, null);
  assert.deepEqual(
    ui.valoracionVisible([{ cantidad: 10 }, { cantidad: 2, costo: 5 }]),
    { valor: 10, sinCosto: 1 },
  );
  assert.equal(ui.valoracionVisible([{ cantidad: 2, costo: 0 }]).valor, 0);
  assert.equal(ui.valoracionVisible([]).valor, 0);
});
test("frontend: gráfico futuro excluye caducados y el día de hoy", () => {
  const d = escenario();
  assert.equal(ui.unidadesFuturasDelMes(d.inventario, "2026-10", hoy), 50);
  assert.equal(
    ui.unidadesFuturasDelMes(d.inventario, "2026-10", "2026-10-25"),
    0,
  );
});
test("frontend: filtro visual por sucursal no muta datos y conserva traslados entrantes", () => {
  const d = escenario(),
    copia = structuredClone(d);
  const f = ui.filtrarSucursal(d, "2");
  assert.deepEqual(
    f.inventario.map((i) => i.id_bodega),
    [2],
  );
  assert.equal(f.movimientos.length, 1);
  assert.deepEqual(d, copia);
});
test("frontend: informe visible incluye traslado por destino sin ampliar empresa", () => {
  const d = escenario();
  const f = prepararInformeVisible(d, "ROTACION", {
    farmacia: 1,
    sucursal: 2,
    bodega: 2,
  });
  assert.equal(f.filas.length, 1);
  assert.ok(f.filas[0].includes("Destino"));
  assert.equal(
    prepararInformeVisible(d, "ROTACION", { farmacia: 2 }).filas.length,
    0,
  );
  assert.equal(
    prepararInformeVisible(d, "ROTACION", { farmacia: 1, desde: "2026-10-24" })
      .filas.length,
    0,
  );
  assert.equal(
    prepararInformeVisible(d, "ROTACION", {
      farmacia: 1,
      desde: "2026-10-25",
      hasta: hoy,
    }).filas.length,
    0,
  );
});
test("frontend: validaciones locales de GTIN y RUT", () => {
  assert.ok(ui.gtinValido("09506000134352"));
  assert.equal(ui.gtinValido("09506000134353"), false);
  assert.ok(ui.rutValido("12.345.678-5"));
  assert.equal(ui.rutValido("12.345.678-9"), false);
});
