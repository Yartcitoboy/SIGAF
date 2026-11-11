export function tablasOperacion(alcance: "completo" | "configuracion" | "dispensacion") {
  const comunes = ["bodega", "sucursal", "farmacia", "configuracion"] as const;
  if (alcance === "configuracion") return [...comunes];
  const stock = ["inventario", "lote", "producto", ...comunes] as const;
  return alcance === "dispensacion"
    ? [...stock]
    : [...stock, "movimiento_inventario", "merma"] as const;
}
