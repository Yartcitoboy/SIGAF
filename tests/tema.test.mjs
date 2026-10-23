import { test } from "node:test";
import assert from "node:assert/strict";
const {
  PALETAS,
  TEMAS,
  nombreCookieTema,
  modoValido,
  alternarModo,
  variablesTema,
} = await import("../src/lib/tema/paletas.ts");
function luminancia(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contraste(a, b) {
  const x = luminancia(a),
    y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test("temas: se conservan exactamente los cinco colores de cada rol", () => {
  assert.deepEqual(PALETAS, {
    ADMIN: ["#000020", "#171a4a", "#2f2c79", "#5dc1b9", "#9ce0db"],
    BODEGUERO: ["#031926", "#468189", "#77aca2", "#9dbebb", "#f4e9cd"],
    AUXILIAR: ["#a3b18a", "#dad7cd", "#588157", "#3a5a40", "#344e41"],
  });
  for (const rol of Object.keys(PALETAS)) {
    for (const modo of ["claro", "oscuro"]) {
      const vars = variablesTema(rol, modo);
      PALETAS[rol].forEach((color, i) =>
        assert.equal(vars[`--paleta-${i + 1}`], color),
      );
      assert.equal(vars["--lienzo"], TEMAS[rol][modo].lienzo);
      assert.ok(Object.values(vars).every((v) => /^#[a-f\d]{6}$/i.test(v)));
    }
    assert.notEqual(TEMAS[rol].claro.lienzo, TEMAS[rol].oscuro.lienzo);
  }
});
test("temas: contraste AA en texto, botones y navegación de las seis variantes", () => {
  for (const [rol, modos] of Object.entries(TEMAS))
    for (const [modo, t] of Object.entries(modos)) {
      for (const fondo of ["lienzo", "superficie", "sutil", "elevado"]) {
        for (const texto of ["tinta", "muted"])
          assert.ok(
            contraste(t[texto], t[fondo]) >= 4.5,
            `${rol} ${modo}: ${texto}/${fondo} ${contraste(t[texto], t[fondo])}`,
          );
      }
      for (const [texto, fondo] of [
        ["sobre-accion", "accion"],
        ["sobre-accion", "accion-hover"],
        ["acento", "superficie"],
        ["acento", "acento-suave"],
        ["barra-tinta", "barra"],
        ["barra-muted", "barra"],
        ["barra-muted", "barra-hover"],
        ["barra-activa-tinta", "barra-activa"],
      ])
        assert.ok(
          contraste(t[texto], t[fondo]) >= 4.5,
          `${rol} ${modo}: ${texto}/${fondo} ${contraste(t[texto], t[fondo])}`,
        );
      assert.ok(
        contraste(t.acento, t.superficie) >= 3,
        `${rol} ${modo}: foco visible`,
      );
    }
});
test("temas: alternancia reversible, valores seguros y preferencia independiente por rol", () => {
  assert.equal(alternarModo("claro"), "oscuro");
  assert.equal(alternarModo(alternarModo("claro")), "claro");
  for (const valor of [undefined, "", "auto", "dark", "<script>"])
    assert.equal(modoValido(valor), "claro");
  assert.equal(modoValido("oscuro"), "oscuro");
  assert.equal(new Set(Object.keys(PALETAS).map(nombreCookieTema)).size, 3);
  assert.equal(nombreCookieTema("BODEGUERO"), "sigaf_tema_bodeguero");
});
