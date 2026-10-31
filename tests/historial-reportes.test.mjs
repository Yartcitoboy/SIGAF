import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
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
const {
  periodoReporte,
  filtrarEmisiones,
  leerArchivoReporte,
  resumenTablaReporte,
} = await import("../src/lib/vistas/archivo-reporte.ts");
const { crearPDF, crearLibroExcel } =
  await import("../src/lib/servicios/reportes.ts");
const { comandoDatos, validarCampos } =
  await import("../src/lib/datos/contrato.ts");
const archivo = {
  version: 1,
  farmacia: {
    id_farmacia: 1,
    razon_social: "Farmacia archivada",
    rut: "11.111.111-1",
    direccion: "Dirección original",
    director_tecnico: "Profesional original",
  },
  tablas: [
    {
      titulo: "Informe de inventario",
      columnas: ["Stock físico", "Costo unit. CLP"],
      filas: [
        [10, 100],
        [5, "Sin costo registrado"],
      ],
    },
  ],
  filtros: "Sucursal Central | Todas",
  ubicacion: "Central",
  nombre: "SIGAF-inventario-2026-10-31",
  emitido: "2026-11-01T02:30:00Z",
};
const filtro = { texto: "", tipo: "", formato: "", desde: "", hasta: "" };
test("historial: filtros combinados, fecha Chile inclusiva, rango abierto e inválido", () => {
  const filas = [
    {
      id_reporte: 1,
      tipo: "INVENTARIO",
      formato: "PDF",
      responsable: "Ana",
      fecha_generacion: "2026-11-01T02:30:00Z",
      contenido: archivo,
    },
    {
      id_reporte: 2,
      tipo: "MERMAS",
      formato: "XLS",
      responsable: "Otro",
      fecha_generacion: "2026-09-01T01:00:00",
    },
  ];
  assert.equal(filtrarEmisiones(filas, filtro).length, 2);
  assert.equal(
    filtrarEmisiones(filas, {
      ...filtro,
      desde: "2026-10-31",
      hasta: "2026-10-31",
      tipo: "INVENTARIO",
      formato: "PDF",
      texto: "central",
    }).length,
    1,
  );
  assert.equal(
    filtrarEmisiones(filas, { ...filtro, desde: "2026-11-01" }).length,
    0,
  );
  assert.equal(
    filtrarEmisiones(filas, {
      ...filtro,
      desde: "2026-11-01",
      hasta: "2026-01-01",
    }).length,
    0,
  );
  assert.deepEqual(periodoReporte("2026-01-15", "trimestre"), {
    desde: "2025-11-01",
    hasta: "2026-01-15",
  });
  assert.deepEqual(periodoReporte("2026-10-31", "mes"), {
    desde: "2026-10-01",
    hasta: "2026-10-31",
  });
  assert.deepEqual(periodoReporte("2026-10-31", "todo"), {
    desde: "",
    hasta: "",
  });
});
test("archivo: contratos, legado, valoración parcial y contenido válido", () => {
  assert.equal(leerArchivoReporte(null), null);
  assert.equal(leerArchivoReporte({ ...archivo, version: 2 }), null);
  assert.deepEqual(resumenTablaReporte(archivo.tablas[0]), {
    registros: 2,
    unidades: 15,
    valor: 1000,
    sinCosto: 1,
  });
  const comando = comandoDatos.parse({
    accion: "guardar",
    tabla: "reporte",
    campos: { tipo: "INVENTARIO", formato: "PDF", contenido: archivo },
  });
  validarCampos(comando);
  assert.throws(
    () => validarCampos({ ...comando, id: 1 }),
    /no se puede modificar/,
  );
  assert.throws(
    () =>
      validarCampos({
        ...comando,
        tabla: "producto",
        campos: { nombre: archivo },
      }),
    /no permitido/,
  );
});
test("copia: membrete y firma archivados en PDF y Excel sin volver a consultar stock", async () => {
  const copia = JSON.parse(JSON.stringify(archivo));
  const pdf = await crearPDF(
    copia.tablas[0],
    copia.farmacia,
    copia.ubicacion,
    copia.filtros,
    new Date(copia.emitido),
  );
  assert.match(pdf.output(), /Farmacia archivada/);
  assert.match(pdf.output(), /Profesional original/);
  assert.match(pdf.output(), /Firma Director/);
  const libro = await crearLibroExcel(
    copia.tablas,
    {
      farmacia: copia.farmacia.razon_social,
      rut: copia.farmacia.rut,
      filtros: copia.filtros,
      direccion: copia.farmacia.direccion,
      director_tecnico: copia.farmacia.director_tecnico,
    },
    copia.emitido,
  );
  const x = await import("xlsx");
  const reabierto = x.read(
    x.write(libro, { type: "buffer", bookType: "xlsx" }),
    { type: "buffer" },
  );
  const identidad = x.utils.sheet_to_json(reabierto.Sheets["Identificación"], {
    header: 1,
  });
  assert.ok(identidad.some((f) => f[1] === "Profesional original"));
  assert.ok(identidad.some((f) => f[0] === "Firma Director Técnico"));
  assert.equal(reabierto.Sheets.Inventario.A2.v, 10);
});
test("PostgreSQL: conserva el legado y el archivo en JSON sin cambiar permisos", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE TABLE reporte(id_reporte int PRIMARY KEY); INSERT INTO reporte VALUES(1);",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/20261031045729_archivo_emisiones_reportes.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    assert.equal(
      (await db.query("SELECT contenido FROM reporte WHERE id_reporte=1"))
        .rows[0].contenido,
      null,
    );
    await db.query("INSERT INTO reporte VALUES(2,$1)", [
      JSON.stringify(archivo),
    ]);
    assert.deepEqual(
      (await db.query("SELECT contenido FROM reporte WHERE id_reporte=2"))
        .rows[0].contenido,
      archivo,
    );
    await assert.rejects(
      db.query("INSERT INTO reporte VALUES(3,$1)", ["{}"]),
      /check constraint/,
    );
  } finally {
    await db.close();
  }
});
