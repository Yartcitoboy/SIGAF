import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transpileModule, ModuleKind, ScriptTarget } from "typescript";
import { createHash } from "node:crypto";

// Ejecuta el handler real con Auth/RPC aislados. No conecta a Supabase ni Gmail.
test("gestión de correo: solo Admin confirma códigos del destinatario seleccionado", async () => {
  const id = "16da4ad2-f4ce-4e6c-b77b-8f2d78097f87";
  const destino = "cf00692b-bb8a-4617-9e5d-7acfe717c949";
  const nonce = "e75c981e-2db9-4a08-884e-727e69cf2ebe";
  const calls = [];
  let role = "ADMIN", valido = true, disponible = true;
  const db = {
    auth: { getUser: async () => ({ data: { user: { id } }, error: null }) },
    from(tabla) {
      const q = { select: () => q, eq: () => q,
        single: async () => ({ data: tabla === "usuario" ? { id_usuario: id, id_perfil: 1, activo: true } : { nombre: role } }) };
      return q;
    },
    rpc: async (nombre, args) => {
      calls.push([nombre, args]);
      if (nombre === "nonce_codigo_correo") return { data: disponible ? nonce : null };
      if (nombre === "confirmar_codigo_correo") return { data: valido };
      throw new Error("RPC no esperado: " + nombre);
    },
  };
  const originalDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: (key) => ({ SUPABASE_URL: "https://fixture.invalid", SUPABASE_ANON_KEY: "fixture", SUPABASE_SERVICE_ROLE_KEY: "fixture" })[key] }, serve: () => {} };
  globalThis.sigafClientePrueba = () => db;
  try {
    const url = new URL("../supabase/functions/sigaf-alertas/index.ts", import.meta.url);
    let source = await readFile(url, "utf8");
    source = source.replace(/import \{ createClient \} from [^;]+;/, "const createClient = globalThis.sigafClientePrueba;");
    source = source.replace('"npm:zod@4.6.5"', JSON.stringify(new URL("../node_modules/zod/index.js", import.meta.url).href));
    source = source.replace(/from "(\.\.?\/[^\"]+)"/g, (_match, path) => "from " + JSON.stringify(new URL(path, url).href));
    const js = transpileModule(source, { compilerOptions: { module: ModuleKind.ESNext, target: ScriptTarget.ES2022 } }).outputText;
    const { atender } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
    const request = (body) => atender(new Request("https://fixture.invalid/functions/v1/sigaf-alertas", { method: "POST", headers: { Authorization: "Bearer fixture", "Content-Type": "application/json" }, body: JSON.stringify(body) }));
    for (role of ["BODEGUERO", "AUXILIAR"]) {
      for (const body of [{ accion: "estado" }, { accion: "solicitar_codigo", id_usuario: destino }, { accion: "confirmar_codigo", id_usuario: destino, codigo: "123456" }]) {
        assert.equal((await request(body)).status, 403);
      }
    }
    assert.deepEqual(calls, []);
    role = "ADMIN";
    assert.equal((await request({ accion: "confirmar_codigo", id_usuario: destino, codigo: "123456" })).status, 200);
    assert.equal(calls[0][1].p_usuario, destino);
    assert.equal(calls[1][1].p_usuario, destino);
    assert.equal(calls[1][1].p_nonce, nonce);
    assert.equal(calls[1][1].p_hash, createHash("sha256").update(nonce + ":123456").digest("hex"));
    calls.length = 0;
    disponible = false;
    assert.equal((await request({ accion: "confirmar_codigo", id_usuario: destino, codigo: "123456" })).status, 400);
    assert.equal(calls.length, 1);
    disponible = true; valido = false;
    assert.equal((await request({ accion: "confirmar_codigo", id_usuario: destino, codigo: "654321" })).status, 400);
    calls.length = 0;
    assert.equal((await request({ accion: "confirmar_codigo", id_usuario: "no-uuid", codigo: "123456" })).status, 400);
    assert.equal(calls.length, 0);
  } finally {
    globalThis.Deno = originalDeno;
    delete globalThis.sigafClientePrueba;
  }
});
