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
const {
  accesoLocalHabilitado,
  autenticarCuentaLocal,
  firmarSesionLocal,
  verificarSesionLocal,
  DURACION_LOCAL,
} = await import("../src/lib/auth/sesion-local.ts");
const { CUENTAS_LOCALES } = await import("../src/lib/auth/cuentas-locales.ts");
const secreto = "secreto-aleatorio-exclusivo-de-pruebas-123456789";
test("acceso local restringido a desarrollo y hosts locales", () => {
  for (const host of ["localhost:3000", "127.0.0.1:3001", "[::1]:3000"])
    assert.equal(
      accesoLocalHabilitado(host, "development", "true", secreto),
      true,
    );
  assert.equal(
    accesoLocalHabilitado("localhost:3000", "production", "true", secreto),
    false,
  );
  assert.equal(
    accesoLocalHabilitado("localhost:3000", "development", "false", secreto),
    false,
  );
  assert.equal(
    accesoLocalHabilitado("sigaf.example", "development", "true", secreto),
    false,
  );
  assert.equal(
    accesoLocalHabilitado("localhost.example", "development", "true", secreto),
    false,
  );
  assert.equal(
    accesoLocalHabilitado("localhost:3000", "development", "true", ""),
    false,
  );
});
test("las tres tarjetas corresponden a cuentas locales y roles válidos", () => {
  for (const cuenta of CUENTAS_LOCALES) {
    assert.equal(
      autenticarCuentaLocal(
        " " + cuenta.email.toUpperCase() + " ",
        cuenta.password,
      )?.rol,
      cuenta.rol,
    );
    assert.equal(autenticarCuentaLocal(cuenta.email, "incorrecta"), null);
    const sesion = verificarSesionLocal(
      firmarSesionLocal(cuenta.rol, secreto, 1000),
      secreto,
      1000,
    );
    assert.equal(sesion?.rol, cuenta.rol);
    assert.equal(sesion?.usuario.id_usuario, cuenta.id_usuario);
    assert.equal(Object.hasOwn(sesion.usuario, "password"), false);
  }
  assert.equal(
    autenticarCuentaLocal(
      "desconocido@sigaf.local",
      CUENTAS_LOCALES[0].password,
    ),
    null,
  );
});
test("sesión local: firma, expiración y protección contra cambio de rol", () => {
  const token = firmarSesionLocal("AUXILIAR", secreto, 1000);
  assert.equal(
    verificarSesionLocal(
      token,
      "otro-secreto-de-prueba-de-al-menos-32-caracteres",
      1000,
    ),
    null,
  );
  assert.equal(
    verificarSesionLocal(token, secreto, 1000 + DURACION_LOCAL * 1000),
    null,
  );
  const [payload, firma] = token.split(".");
  const alterado = JSON.parse(Buffer.from(payload, "base64url").toString());
  alterado.rol = "ADMIN";
  assert.equal(
    verificarSesionLocal(
      Buffer.from(JSON.stringify(alterado)).toString("base64url") + "." + firma,
      secreto,
      1000,
    ),
    null,
  );
  assert.equal(verificarSesionLocal("cookie-inválida", secreto), null);
  assert.equal(verificarSesionLocal(undefined, secreto), null);
});
