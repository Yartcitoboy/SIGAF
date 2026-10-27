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
const { prepararDetalleProducto } =
  await import("../src/lib/vistas/detalle-producto.ts");
const hoy = "2026-10-23";
const categorias = [
  { id_categoria: 1, nombre: "Analgésicos", descripcion: null },
];
function escenario() {
  const productos = [
    {
      id_producto: 1,
      nombre: "Producto A",
      id_categoria: 1,
      codigo_barras: "123",
      descripcion: null,
      unidad_medida: "caja",
    },
    {
      id_producto: 2,
      nombre: "Producto B",
      id_categoria: 1,
      codigo_barras: null,
      descripcion: null,
      unidad_medida: "caja",
    },
  ];
  const lotes = [
    {
      id_lote: 11,
      id_producto: 1,
      numero_lote: "A-11",
      fecha_vencimiento: "2026-11-15",
      fecha_ingreso: "2026-10-01",
    },
    {
      id_lote: 12,
      id_producto: 1,
      numero_lote: "A-12",
      fecha_vencimiento: "2026-10-22",
      fecha_ingreso: "2026-10-01",
    },
    {
      id_lote: 21,
      id_producto: 2,
      numero_lote: "B-21",
      fecha_vencimiento: "2027-04-01",
      fecha_ingreso: "2026-10-01",
    },
  ];
  const bodegas = [
    {
      id_bodega: 1,
      nombre: "Sala",
      ubicacion: "Estante A",
      id_sucursal: 1,
      es_sala_ventas: true,
    },
    {
      id_bodega: 2,
      nombre: "Almacén",
      ubicacion: "Repisa B",
      id_sucursal: 1,
      es_sala_ventas: false,
    },
  ];
  const inventario = [
    { id_inventario: 1, id_lote: 11, id_bodega: 1, stock_actual: 2 },
    { id_inventario: 2, id_lote: 11, id_bodega: 2, stock_actual: 10 },
    { id_inventario: 3, id_lote: 12, id_bodega: 2, stock_actual: 3 },
    { id_inventario: 4, id_lote: 21, id_bodega: 1, stock_actual: 999 },
  ].map((i) => ({
    ...i,
    lote: lotes.find((l) => l.id_lote === i.id_lote),
    bodega: bodegas.find((b) => b.id_bodega === i.id_bodega),
    estado_semaforo: null,
  }));
  const movimientos = [
    {
      id_movimiento: 1,
      id_inventario: 1,
      tipo_movimiento: "SALIDA",
      cantidad: 1,
      fecha: "2026-10-23T10:00:00",
      id_usuario: "user",
    },
    {
      id_movimiento: 2,
      id_inventario: 3,
      tipo_movimiento: "MERMA",
      cantidad: 1,
      fecha: "2026-10-23T11:00:00",
      id_usuario: "user",
    },
    {
      id_movimiento: 3,
      id_inventario: 4,
      tipo_movimiento: "ENTRADA",
      cantidad: 999,
      fecha: "2026-10-23T12:00:00",
      id_usuario: "user",
    },
  ];
  return {
    productos,
    lotes,
    bodegas,
    inventario,
    movimientos,
    mermas: [],
    sucursales: [],
    farmacias: [],
    configuracion: {
      id: 1,
      dias_critico: 45,
      dias_preventivo: 90,
      holgura_dias: 0,
    },
  };
}
test("detalle: combina stock por producto y ubicación, sin incluir otro producto", () => {
  const datos = escenario();
  const copia = structuredClone(datos);
  const d = prepararDetalleProducto(
    datos,
    categorias,
    { tipo: "producto", id: 1 },
    hoy,
  );
  assert.equal(d.producto.nombre, "Producto A");
  assert.equal(d.categoria.nombre, "Analgésicos");
  assert.equal(d.stockActual, 15);
  assert.equal(d.stockApto, 12);
  assert.equal(d.stockSala, 2);
  assert.equal(d.stockBloqueado, 3);
  assert.equal(d.estado, "Con lotes en alerta");
  assert.deepEqual(
    d.ubicaciones.map((u) => u.stock),
    [2, 13],
  );
  assert.deepEqual(
    d.lotes.map((l) => l.id_lote),
    [12, 11],
  );
  assert.deepEqual(
    d.movimientos.map((m) => m.id_movimiento),
    [2, 1],
  );
  assert.deepEqual(
    datos,
    copia,
    "la composición no modifica los registros compartidos",
  );
});
test("detalle: lote y movimiento resuelven la misma ficha con su contexto exacto", () => {
  const datos = escenario();
  const lote = prepararDetalleProducto(
    datos,
    categorias,
    { tipo: "lote", id: 11 },
    hoy,
  );
  const mov = prepararDetalleProducto(
    datos,
    categorias,
    { tipo: "movimiento", id: 1 },
    hoy,
  );
  assert.equal(lote.producto.id_producto, 1);
  assert.equal(lote.lote.id_lote, 11);
  assert.equal(mov.producto.id_producto, 1);
  assert.equal(mov.lote.id_lote, 11);
  assert.equal(mov.movimiento.id_movimiento, 1);
  assert.equal(mov.inventarioOperacion.id_inventario, 1);
  datos.inventario[0].stock_actual = 0;
  assert.equal(
    prepararDetalleProducto(
      datos,
      categorias,
      { tipo: "movimiento", id: 1 },
      hoy,
    ).inventarioOperacion,
    undefined,
    "un movimiento agotado no cambia silenciosamente de origen",
  );
});
test("detalle: agotado, bloqueado por fecha y disponibilidad no se confunden", () => {
  const datos = escenario();
  datos.inventario
    .filter((i) => i.id_lote === 11)
    .forEach((i) => (i.stock_actual = 0));
  assert.equal(
    prepararDetalleProducto(datos, categorias, { tipo: "producto", id: 1 }, hoy)
      .estado,
    "Bloqueado por fecha u holgura",
  );
  datos.inventario[2].stock_actual = 0;
  const agotado = prepararDetalleProducto(
    datos,
    categorias,
    { tipo: "lote", id: 12 },
    hoy,
  );
  assert.equal(agotado.stockActual, 0);
  assert.equal(agotado.estado, "Sin stock");
  assert.equal(agotado.inventarioOperacion, undefined);
  assert.equal(
    prepararDetalleProducto(datos, categorias, { tipo: "producto", id: 2 }, hoy)
      .estado,
    "Disponible",
  );
});
test("detalle: respeta holgura, lote sin recepción y referencias no autorizadas", () => {
  const datos = escenario();
  datos.configuracion.holgura_dias = 30;
  assert.equal(
    prepararDetalleProducto(datos, categorias, { tipo: "producto", id: 1 }, hoy)
      .stockApto,
    0,
  );
  for (const tipo of ["producto", "lote", "movimiento"])
    assert.equal(
      prepararDetalleProducto(datos, categorias, { tipo, id: 99999 }, hoy),
      null,
    );
  datos.productos.push({
    id_producto: 3,
    nombre: "Sin recepción",
    id_categoria: 50,
  });
  const nuevo = prepararDetalleProducto(
    datos,
    [],
    { tipo: "producto", id: 3 },
    hoy,
  );
  assert.equal(nuevo.stockActual, 0);
  assert.equal(nuevo.categoria, undefined);
  assert.equal(nuevo.lotes.length, 0);
  datos.inventario = datos.inventario.filter((i) => i.id_inventario !== 1);
  assert.equal(
    prepararDetalleProducto(
      datos,
      categorias,
      { tipo: "movimiento", id: 1 },
      hoy,
    ),
    null,
  );
});
