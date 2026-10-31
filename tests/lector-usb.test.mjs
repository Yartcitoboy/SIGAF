import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
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
const { interpretarCodigo, variantesCodigo, codigoCanonico } =
  await import("../src/lib/servicios/codigo-medicamento.ts");
const { buscarMedicamentoCodigo, validarCodigoProducto } =
  await import("../src/lib/datos/busqueda-codigo.ts");
const { ControlLecturas } =
  await import("../src/lib/servicios/control-lecturas.ts");
const producto = {
  id_producto: 7,
  nombre: "Producto de prueba",
  codigo_barras: "9506000134352",
  unidad_medida: "Caja x 20",
  id_categoria: 1,
};
function cliente(filas, error = null) {
  const llamadas = [];
  const q = {
    select(c) {
      llamadas.push(["select", c]);
      return q;
    },
    in(c, vs) {
      llamadas.push(["in", c, vs]);
      return q;
    },
    limit(n) {
      llamadas.push(["limit", n]);
      return Promise.resolve({ data: filas, error });
    },
  };
  return {
    db: {
      from(t) {
        llamadas.push(["from", t]);
        return q;
      },
    },
    llamadas,
  };
}
test("lector: GTIN, código manual, prefijo HID y GS1 conservan ceros, lote y vencimiento", () => {
  assert.equal(
    interpretarCodigo("]E09506000134352\r\n").codigo,
    "9506000134352",
  );
  assert.equal(interpretarCodigo("MED-001").codigo, "MED-001");
  assert.deepEqual(
    interpretarCodigo("]d2010950600013435210LOTE-A\u001d17270228"),
    { codigo: "09506000134352", lote: "LOTE-A", vencimiento: "2027-02-28" },
  );
  assert.ok(variantesCodigo("09506000134352").includes("9506000134352"));
  for (const valor of [
    "",
    "12",
    "https://sitio.cl/medicamento",
    "<script>",
    "A".repeat(513),
    "(01)09506000134351",
  ])
    assert.throws(() => interpretarCodigo(valor));
});
test("lector: encuentra en backend y devuelve ficha real sin guardar", async () => {
  const { db, llamadas } = cliente([producto]);
  const r = await buscarMedicamentoCodigo(
    db,
    "(01)09506000134352(17)270228(10)LOTE-A",
  );
  assert.equal(r.producto.id_producto, 7);
  assert.equal(r.producto.unidad_medida, "Caja x 20");
  assert.equal(r.lectura.lote, "LOTE-A");
  assert.equal(r.lectura.vencimiento, "2027-02-28");
  assert.ok(
    llamadas.every((c) => ["select", "in", "limit", "from"].includes(c[0])),
  );
});
test("lector: desconocido, dígito inválido, catálogo ambiguo y fallo de red", async () => {
  assert.equal(
    (await buscarMedicamentoCodigo(cliente([]).db, "4006381333931")).producto,
    null,
  );
  await assert.rejects(
    buscarMedicamentoCodigo(cliente([]).db, "4006381333932"),
    /control/,
  );
  await assert.rejects(
    buscarMedicamentoCodigo(
      cliente([producto, { ...producto, id_producto: 8 }]).db,
      "09506000134352",
    ),
    (e) => e.estado === 409,
  );
  await assert.rejects(
    buscarMedicamentoCodigo(cliente([], {}).db, "MED-001"),
    (e) => e.estado === 503,
  );
});
test("lector: códigos históricos inválidos se advierten, sin tratarlos como un alta", async () => {
  const p = { ...producto, codigo_barras: "7801234567890" };
  const r = await buscarMedicamentoCodigo(cliente([p]).db, p.codigo_barras);
  assert.equal(r.producto.id_producto, 7);
  assert.match(r.advertencia, /histórico/);
  assert.equal(
    await validarCodigoProducto(cliente([p]).db, p.codigo_barras, 7),
    p.codigo_barras,
  );
  await assert.rejects(validarCodigoProducto(cliente([]).db, p.codigo_barras));
});
test("alta: rechaza equivalentes y normaliza antes de la restricción única existente", async () => {
  await assert.rejects(
    validarCodigoProducto(cliente([producto]).db, "09506000134352"),
    (e) => e.estado === 409,
  );
  assert.equal(
    await validarCodigoProducto(cliente([producto]).db, "09506000134352", 7),
    "09506000134352",
  );
  assert.equal(
    codigoCanonico("9506000134352"),
    codigoCanonico("09506000134352"),
  );
});
test("lector: varios escaneos, Enter repetido y respuestas desordenadas", () => {
  const c = new ControlLecturas();
  const a = c.iniciar("A", 0);
  assert.equal(c.iniciar("A", 900), null);
  const b = c.iniciar("B", 901);
  assert.equal(c.vigente(a), false);
  assert.equal(c.vigente(b), true);
  c.terminar(b);
  assert.equal(c.iniciar("B", 902), null);
  assert.notEqual(c.iniciar("B", 1800), null);
  c.cancelar();
  assert.equal(c.vigente(b), false);
  assert.notEqual(c.iniciar("B", 1801), null);
});
const { consultarCodigoMedicamento } =
  await import("../src/lib/servicios/lector-usb.ts");
test("lector: servicio de consulta usa GET, sesión y señal de cancelación; nunca envía escrituras", async () => {
  const anterior = globalThis.fetch;
  const abort = new AbortController();
  let llamada;
  globalThis.fetch = async (url, op) => {
    llamada = { url, op };
    return {
      ok: true,
      status: 200,
      json: async () => ({ producto, lectura: { codigo: "09506000134352" } }),
    };
  };
  try {
    const r = await consultarCodigoMedicamento(
      "(01)09506000134352",
      abort.signal,
    );
    assert.equal(r.datos.producto.id_producto, 7);
    assert.equal(
      new URL(llamada.url, "http://localhost").searchParams.get("codigo"),
      "(01)09506000134352",
    );
    assert.equal(llamada.op.signal, abort.signal);
    assert.equal(llamada.op.credentials, "same-origin");
    assert.ok(!llamada.op.method || llamada.op.method === "GET");
    assert.equal(llamada.op.body, undefined);
  } finally {
    globalThis.fetch = anterior;
  }
});
