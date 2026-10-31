import { prepararLectura } from "./lectura-anticipada";
import { solicitarDatos } from "./datos";
import type { Producto, Categoria, Inventario, Bodega } from "@/tipos/database";
export function obtenerPaginaProductos(
  pagina: number,
  texto: string,
  categoria: string,
  usuario?: string,
) {
  return solicitarDatos<{
    productos: Producto[];
    categorias: Categoria[];
    total: number;
  }>(
    {
      accion: "productos_pagina",
      pagina,
      texto,
      categoria: categoria ? Number(categoria) : undefined,
    },
    usuario,
  );
}
export function obtenerPaginaInventario(
  pagina: number,
  texto: string,
  bodega: string,
  estado: "" | "VERDE" | "AMARILLO" | "NARANJO" | "VENCIDO",
  orden: "vencimiento" | "stock" | "nombre",
  usuario?: string,
) {
  return solicitarDatos<{
    inventario: Inventario[];
    bodegas: Bodega[];
    total: number;
    ahora: string;
    hoy: string;
  }>(
    {
      accion: "inventario_pagina",
      pagina,
      texto,
      bodega: bodega ? Number(bodega) : undefined,
      estado,
      orden,
    },
    usuario,
  );
}

export function prepararListado(href: string, usuario: string) {
  const comando: import("../datos/contrato").ComandoDatos | undefined =
    href === "/productos"
      ? { accion: "productos_pagina", pagina: 1, texto: "" }
      : href === "/inventario"
        ? {
            accion: "inventario_pagina",
            pagina: 1,
            texto: "",
            estado: "",
            orden: "vencimiento",
          }
        : undefined;
  if (comando) prepararLectura(usuario, comando, () => solicitarDatos(comando));
}
