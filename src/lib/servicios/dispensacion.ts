import { operarStock } from "./operacion";

// Adaptación de la intención de cc15f89. No escribe inventario por separado
// ni acepta un usuario de demostración como autor del movimiento.
export async function dispensar(datos: {
  inventario: number;
  cantidad: number;
  operacion: string;
}) {
  if (
    !Number.isInteger(datos.inventario) ||
    datos.inventario <= 0 ||
    !Number.isInteger(datos.cantidad) ||
    datos.cantidad <= 0
  )
    throw new Error(
      "Indica una existencia válida y una cantidad entera positiva.",
    );
  if (!datos.operacion) throw new Error("Falta la referencia de la operación.");
  await operarStock({
    inventario: datos.inventario,
    cantidad: datos.cantidad,
    operacion: datos.operacion,
    tipo: "SALIDA",
  });
}
