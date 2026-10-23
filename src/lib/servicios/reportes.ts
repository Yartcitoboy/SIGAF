import type { DatosOperacion } from "./operacion";
import type { Farmacia } from "@/tipos/database";
export type TipoInforme = "INVENTARIO" | "MERMAS" | "ROTACION";
export interface FiltroReporte {
  farmacia: number;
  sucursal?: number;
  bodega?: number;
  desde?: string;
  hasta?: string;
}
export interface TablaReporte {
  titulo: string;
  columnas: string[];
  filas: (string | number)[][];
}
export function prepararReporte(
  datos: DatosOperacion,
  tipo: TipoInforme,
  filtro: FiltroReporte,
): TablaReporte {
  const sucursales = new Set(
    datos.sucursales
      .filter(
        (s) =>
          s.id_farmacia === filtro.farmacia &&
          (!filtro.sucursal || s.id_sucursal === filtro.sucursal),
      )
      .map((s) => s.id_sucursal),
  );
  const bodegas = new Set(
    datos.bodegas
      .filter(
        (b) =>
          sucursales.has(b.id_sucursal) &&
          (!filtro.bodega || b.id_bodega === filtro.bodega),
      )
      .map((b) => b.id_bodega),
  );
  const stock = datos.inventario.filter((i) => bodegas.has(i.id_bodega));
  const ids = new Set(stock.map((i) => i.id_inventario));
  const dentro = (fecha: string) => {
    const dia = fecha.slice(0, 10);
    return (
      (!filtro.desde || dia >= filtro.desde) &&
      (!filtro.hasta || dia <= filtro.hasta)
    );
  };
  if (tipo === "INVENTARIO")
    return {
      titulo: "Informe de inventario",
      columnas: [
        "Medicamento",
        "Código",
        "Lote",
        "Ubicación",
        "Stock",
        "Vencimiento",
        "Estado",
        "Costo unit. CLP",
      ],
      filas: stock
        .filter((i) => dentro(i.lote!.fecha_vencimiento))
        .map((i) => [
          i.lote?.producto?.nombre || "",
          i.lote?.producto?.codigo_barras || "",
          i.lote?.numero_lote || "",
          i.bodega?.nombre || "",
          i.stock_actual,
          i.lote?.fecha_vencimiento || "",
          i.estado_semaforo || "",
          i.lote?.costo_unitario ?? "Sin costo",
        ]),
    };
  if (tipo === "MERMAS")
    return {
      titulo: "Registro de mermas y acta de baja",
      columnas: [
        "Fecha de baja",
        "Medicamento",
        "Lote",
        "Ubicación",
        "Cantidad",
        "Motivo",
        "Costo unit. CLP",
        "Responsable",
      ],
      filas: datos.mermas
        .filter((m) => ids.has(m.id_inventario) && dentro(m.fecha_baja))
        .map((m) => [
          m.fecha_baja,
          m.inventario?.lote?.producto?.nombre || "",
          m.inventario?.lote?.numero_lote || "",
          m.inventario?.bodega?.nombre || "",
          m.cantidad,
          m.motivo,
          m.costo_unitario ?? "Sin costo",
          m.id_usuario,
        ]),
    };
  return {
    titulo: "Rotación y libro de control",
    columnas: [
      "Fecha",
      "Movimiento",
      "Medicamento",
      "Lote",
      "Origen",
      "Destino",
      "Cantidad",
      "FEFO",
      "Responsable",
    ],
    filas: datos.movimientos
      .filter((m) => ids.has(m.id_inventario) && dentro(m.fecha))
      .map((m) => [
        m.fecha.replace("T", " ").slice(0, 19),
        m.tipo_movimiento,
        m.inventario?.lote?.producto?.nombre || "",
        m.inventario?.lote?.numero_lote || "",
        m.inventario?.bodega?.nombre || "",
        datos.bodegas.find((b) => b.id_bodega === m.id_bodega_destino)
          ?.nombre || "",
        m.cantidad,
        m.cumple_fefo === null || m.cumple_fefo === undefined
          ? "No evaluado"
          : m.cumple_fefo
            ? "Sí"
            : "No",
        m.id_usuario,
      ]),
  };
}
export async function crearPDF(
  tabla: TablaReporte,
  farmacia: Farmacia,
  ubicacion: string,
  filtros: string,
  emitido = new Date(),
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setCreationDate(emitido);
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const encabezado = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, ancho, 36, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    let tamano = 15;
    doc.setFontSize(tamano);
    while (
      doc.splitTextToSize(farmacia.razon_social, ancho - 90).length > 2 &&
      tamano > 8
    ) {
      doc.setFontSize(--tamano);
    }
    doc.text(doc.splitTextToSize(farmacia.razon_social, ancho - 90), 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("RUT: " + farmacia.rut, 14, 24);
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(farmacia.direccion || "", ancho - 90), 14, 29);
    if (farmacia.logo_url?.startsWith("data:image/")) {
      try {
        doc.addImage(
          farmacia.logo_url,
          farmacia.logo_url.startsWith("data:image/png") ? "PNG" : "JPEG",
          ancho - 39,
          6,
          24,
          24,
          undefined,
          "FAST",
        );
      } catch {
        throw new Error(
          "El logo guardado no se puede incorporar al PDF. Revisa Configuración.",
        );
      }
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(tabla.titulo, 14, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      doc.splitTextToSize(ubicacion + " | " + filtros, ancho - 28),
      14,
      52,
    );
    doc.text(
      "Emitido: " +
        new Intl.DateTimeFormat("es-CL", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Santiago",
        }).format(emitido) +
        " (Chile)",
      14,
      61,
    );
  };
  autoTable(doc, {
    head: [tabla.columnas],
    body: tabla.filas,
    foot: [
      [
        {
          content:
            "\n______________________________________\nFirma Director Técnico / Químico Farmacéutico\n" +
            (farmacia.director_tecnico ||
              "Nombre: ______________________________") +
            (tabla.titulo.includes("mermas")
              ? "\nDisposición final / destrucción: _____________________   Fecha: ___________"
              : ""),
          colSpan: tabla.columnas.length,
        },
      ],
    ],
    showFoot: "lastPage",
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [15, 23, 42],
      fontStyle: "normal",
      fontSize: 9,
      cellPadding: { top: 10, bottom: 4, left: 2, right: 2 },
    },
    startY: 68,
    margin: { top: 68, bottom: 24, left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2.5,
      overflow: "linebreak",
    },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: encabezado,
  });
  const total = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= total; pagina++) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "SIGAF - Registro para revisión y firma del Director Técnico",
      14,
      alto - 10,
    );
    doc.text("Página " + pagina + " de " + total, ancho - 45, alto - 10);
  }
  return doc;
}
export async function crearLibroExcel(
  tablas: TablaReporte[],
  identidad: { farmacia: string; rut: string; filtros: string },
) {
  const XLSX = await import("xlsx");
  const libro = XLSX.utils.book_new();
  for (const tabla of tablas) {
    const hoja = XLSX.utils.aoa_to_sheet([tabla.columnas, ...tabla.filas]);
    hoja["!cols"] = tabla.columnas.map(() => ({ wch: 22 }));
    if (tabla.filas.length) hoja["!autofilter"] = { ref: hoja["!ref"]! };
    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      tabla.titulo.startsWith("Informe")
        ? "Inventario"
        : tabla.titulo.startsWith("Registro")
          ? "Mermas"
          : "Movimientos",
    );
  }
  XLSX.utils.book_append_sheet(
    libro,
    XLSX.utils.aoa_to_sheet([
      ["Farmacia", identidad.farmacia],
      ["RUT", identidad.rut],
      ["Filtros", identidad.filtros],
      [
        "Emisión (Chile)",
        new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" }),
      ],
    ]),
    "Identificación",
  );
  return libro;
}
