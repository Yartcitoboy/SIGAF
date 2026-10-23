import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { writeFile } from "node:fs/promises";

// Node 24 ejecuta TypeScript sin generar archivos de compilación de pruebas.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      try {
        return next(specifier + ".ts", context);
      } catch {
        /* resolver normal */
      }
    }
    return next(specifier, context);
  },
});
const { fechaChile, diasHasta, fechaValida } =
  await import("../src/lib/servicios/fechas.ts");
const { calcularSemaforoLote } =
  await import("../src/lib/servicios/semaforo.ts");
const { leerGS1 } = await import("../src/lib/servicios/gs1.ts");
const { validarVidaUtil, validarFormatoRegistroISP, fichaISP } =
  await import("../src/lib/servicios/isp.ts");
const { prepararReporte, crearPDF, crearLibroExcel } =
  await import("../src/lib/servicios/reportes.ts");
const XLSX = await import("xlsx");

test("fechas de Chile y umbrales de calendario, sin desfase por horario de verano", () => {
  assert.equal(fechaChile(new Date("2026-10-19T02:00:00Z")), "2026-10-18");
  assert.equal(diasHasta("2026-09-06", "2026-09-05"), 1);
  assert.equal(fechaValida("2026-02-30"), false);
  const config = {
    id: 1,
    dias_critico: 45,
    dias_preventivo: 90,
    holgura_dias: 0,
  };
  for (const [fecha, estado] of [
    ["2026-01-01", "VENCIDO"],
    ["2026-01-02", "NARANJO"],
    ["2026-02-15", "NARANJO"],
    ["2026-02-16", "AMARILLO"],
    ["2026-04-01", "AMARILLO"],
    ["2026-04-02", "VERDE"],
  ])
    assert.equal(
      calcularSemaforoLote(fecha, config, "2026-01-01").estado,
      estado,
    );
});
test("GS1: captura GTIN, lote variable y vencimiento; rechaza fechas inválidas", () => {
  const esperado = {
    gtin: "09506000134352",
    lote: "ABC-123",
    vencimiento: "2027-02-28",
  };
  assert.deepEqual(
    leerGS1("(01)09506000134352(17)270228(10)ABC-123"),
    esperado,
  );
  assert.deepEqual(
    leerGS1("]d2010950600013435210ABC-123\u001d17270228"),
    esperado,
  );
  assert.throws(() => leerGS1("(17)260230"), /inválida/);
  assert.throws(() => leerGS1("(17)260200"), /inválida/);
  assert.throws(() => leerGS1("(01)09506000134351"), /control GTIN/);
});
test("referencia ISP y vida útil por meses reales, sin afirmar verificación externa", () => {
  assert.equal(validarFormatoRegistroISP("F-12345/20"), true);
  assert.equal(validarFormatoRegistroISP("no registrado"), false);
  assert.match(fichaISP("F-12345/20"), /RegistroISP=F-12345%2F20/);
  assert.equal(validarVidaUtil("2026-01-31", "2026-02-28", 1), true);
  assert.equal(validarVidaUtil("2026-01-31", "2026-03-01", 1), false);
});
const farmacia = {
  id_farmacia: 1,
  razon_social: "Farmacia de Prueba - Control de Calidad",
  rut: "76.123.456-7",
  direccion: "Avenida de Pruebas 123, Santiago",
  director_tecnico: "Profesional de prueba",
};
const datos = {
  inventario: [
    {
      id_inventario: 1,
      id_lote: 1,
      id_bodega: 1,
      stock_actual: 10,
      estado_semaforo: "NARANJO",
      lote: {
        numero_lote: "ABC-123",
        fecha_vencimiento: "2027-02-28",
        costo_unitario: 200,
        producto: {
          nombre: "Medicamento de prueba",
          codigo_barras: "7801234567890",
        },
      },
      bodega: { nombre: "Vitrina" },
    },
  ],
  sucursales: [
    { id_sucursal: 1, id_farmacia: 1 },
    { id_sucursal: 2, id_farmacia: 2 },
  ],
  bodegas: [
    { id_bodega: 1, id_sucursal: 1 },
    { id_bodega: 2, id_sucursal: 2 },
  ],
  movimientos: [],
  mermas: [],
};
test("reportes: alcance por farmacia y fechas, Excel real y PDF paginado", async () => {
  const tabla = prepararReporte(datos, "INVENTARIO", { farmacia: 1 });
  assert.equal(tabla.filas.length, 1);
  assert.equal(
    prepararReporte(datos, "INVENTARIO", { farmacia: 2 }).filas.length,
    0,
  );
  assert.equal(
    prepararReporte(datos, "INVENTARIO", { farmacia: 1, hasta: "2026-12-31" })
      .filas.length,
    0,
  );
  const libro = await crearLibroExcel([tabla], {
    farmacia: farmacia.razon_social,
    rut: farmacia.rut,
    filtros: "Todas",
  });
  const binario = XLSX.write(libro, { type: "buffer", bookType: "xlsx" });
  const reabierto = XLSX.read(binario, { type: "buffer" });
  assert.equal(reabierto.Sheets.Inventario.A2.v, "Medicamento de prueba");
  assert.equal(reabierto.Sheets.Inventario.E2.v, 10);
  const extensa = {
    ...tabla,
    filas: Array.from({ length: 140 }, (_, n) => [
      ...tabla.filas[0].slice(0, 2),
      "LOTE-" + (n + 1),
      ...tabla.filas[0].slice(3),
    ]),
  };
  const doc = await crearPDF(
    extensa,
    farmacia,
    "Sucursal de prueba",
    "Todos los registros",
    new Date("2026-10-19T15:00:00Z"),
  );
  assert.ok(doc.getNumberOfPages() > 1);
  assert.ok(doc.output().startsWith("%PDF-"));
  if (process.env.SIGAF_QA_PDF)
    await writeFile(
      process.env.SIGAF_QA_PDF,
      Buffer.from(doc.output("arraybuffer")),
    );
});
