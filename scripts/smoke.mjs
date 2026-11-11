import { spawn } from "node:child_process";
import { once } from "node:events";
import assert from "node:assert/strict";

const port = Number(process.env.SIGAF_SMOKE_PORT || 3199);
assert.ok(Number.isInteger(port) && port > 1024 && port < 65536);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: ["ignore", "pipe", "ignore"] });
let ready = false;
let salida = "";
server.stdout.on("data", (chunk) => {
  salida = (salida + chunk.toString()).slice(-2048);
  ready ||= salida.includes("Ready");
});
let failed;
server.on("error", (e) => { failed = e; });
try {
  const deadline = Date.now() + 30000;
  while (true) {
    if (failed) throw failed;
    if (server.exitCode !== null) throw new Error("La instancia no pudo iniciarse; revisa compilación y puerto.");
    try {
      if (ready) {
        const r = await fetch(`${base}/login`, { signal: AbortSignal.timeout(3000) });
        if (r.ok) { assert.match(await r.text(), /SIGAF/); break; }
      }
    } catch { /* Esperar el arranque con tiempo limitado. */ }
    if (Date.now() > deadline) throw new Error("El login no respondió en 30 segundos.");
    await new Promise((r) => setTimeout(r, 250));
  }
  for (const path of ["dashboard", "inventario", "productos", "lotes", "dispensacion", "movimientos", "alertas", "reportes", "usuarios", "configuracion"]) {
    const r = await fetch(`${base}/${path}`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    assert.ok([303, 307, 308].includes(r.status), `${path}: debe redirigir sin sesión`);
    assert.equal(new URL(r.headers.get("location"), base).pathname, "/login");
  }
  const consulta = await fetch(`${base}/api/datos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "contexto" }) });
  assert.equal(consulta.status, 401);
  const codigo = await fetch(`${base}/api/medicamentos/codigo?codigo=4006381333931`);
  assert.equal(codigo.status, 401);
  const origen = await fetch(`${base}/api/datos`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://origen-ajeno.invalid" }, body: JSON.stringify({ accion: "contexto" }) });
  assert.equal(origen.status, 403);
  assert.equal((await fetch(`${base}/mensajes`)).status, 404);
  console.log("Smoke correcto: login, 10 rutas protegidas, Mensajes retirado, APIs sin sesión y origen ajeno. Sin escrituras.");
} finally {
  if (server.exitCode === null && !failed) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
}
