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
const { obtenerPerfilVigente } =
  await import("../src/lib/supabase/perfil-vigente.ts");
function cliente(data, error = null) {
  const llamadas = [];
  const q = {
    select(s) {
      llamadas.push(s);
      return q;
    },
    eq(c, v) {
      llamadas.push([c, v]);
      return q;
    },
    single: async () => ({
      data: typeof data === "function" ? data() : data,
      error,
    }),
  };
  const db = {
    from(t) {
      llamadas.push(t);
      return q;
    },
  };
  return { db, llamadas };
}
test("navegación: perfil y rol se consultan juntos y siempre para el usuario autenticado", async () => {
  const { db, llamadas } = cliente({
    id_usuario: "uno",
    nombre: "Nombre",
    activo: true,
    perfil: { nombre: "ADMIN" },
  });
  const r = await obtenerPerfilVigente(db, "uno");
  assert.equal(r.rol, "ADMIN");
  assert.equal(r.usuario.id_usuario, "uno");
  assert.equal(llamadas.filter((x) => x === "usuario").length, 1);
  assert.ok(
    llamadas.includes(
      "id_usuario,nombre,email,id_perfil,id_sucursal,activo,perfil(nombre)",
    ),
  );
  assert.deepEqual(llamadas[2], ["id_usuario", "uno"]);
});
test("navegación: inactivos, errores y roles inválidos siguen rechazados; no se cachean permisos", async () => {
  for (const data of [
    null,
    { activo: false, perfil: { nombre: "ADMIN" } },
    { activo: true, perfil: null },
    { activo: true, perfil: { nombre: "GERENTE" } },
  ])
    assert.equal(await obtenerPerfilVigente(cliente(data).db, "uno"), null);
  assert.equal(
    await obtenerPerfilVigente(
      cliente(
        { activo: true, perfil: { nombre: "ADMIN" } },
        { message: "sin permiso" },
      ).db,
      "uno",
    ),
    null,
  );
  let rol = "ADMIN";
  const db = cliente(() => ({ activo: true, perfil: { nombre: rol } })).db;
  assert.equal((await obtenerPerfilVigente(db, "uno")).rol, "ADMIN");
  rol = "AUXILIAR";
  assert.equal((await obtenerPerfilVigente(db, "uno")).rol, "AUXILIAR");
});
const { verificarAccesoVigente } =
  await import("../src/lib/supabase/perfil-vigente.ts");
test("navegación: anticipar el perfil nunca sustituye la validación de Auth", async () => {
  const { db } = cliente({
    id_usuario: "uno",
    activo: true,
    perfil: { nombre: "ADMIN" },
  });
  db.auth = {
    getSession: async () => ({
      data: {
        session: {
          access_token:
            "cabecera." +
            Buffer.from(JSON.stringify({ sub: "uno" })).toString("base64url") +
            ".firma-ficticia",
        },
      },
    }),
    getUser: async () => ({
      data: { user: null },
      error: { message: "rechazado" },
    }),
  };
  assert.equal((await verificarAccesoVigente(db)).autenticado, false);
  db.auth.getUser = async () => ({
    data: { user: { id: "otro" } },
    error: null,
  });
  assert.equal((await verificarAccesoVigente(db)).autenticado, false);
  db.auth.getUser = async () => ({
    data: { user: { id: "uno" } },
    error: null,
  });
  assert.equal((await verificarAccesoVigente(db)).perfil.rol, "ADMIN");
});
const { prepararLectura, consumirLectura, descartarLecturas } =
  await import("../src/lib/servicios/lectura-anticipada.ts");
test("navegación: lectura anticipada aislada por usuario, de un uso, con caducidad y descarte", async () => {
  const reloj = Date.now;
  let ahora = 1000;
  Date.now = () => ahora;
  try {
    descartarLecturas();
    const cmd = { accion: "productos_pagina", pagina: 1 };
    let consultas = 0;
    const cargar = async () => {
      consultas++;
      return ["dato del servidor"];
    };
    prepararLectura("uno", cmd, cargar);
    prepararLectura("uno", cmd, cargar);
    assert.equal(consultas, 1);
    assert.equal(consumirLectura("dos", cmd), undefined);
    assert.deepEqual(await consumirLectura("uno", cmd), ["dato del servidor"]);
    assert.equal(consumirLectura("uno", cmd), undefined);
    prepararLectura("uno", cmd, cargar);
    ahora += 5001;
    assert.equal(consumirLectura("uno", cmd), undefined);
    prepararLectura("uno", cmd, cargar);
    descartarLecturas();
    assert.equal(consumirLectura("uno", cmd), undefined);
  } finally {
    Date.now = reloj;
    descartarLecturas();
  }
});
