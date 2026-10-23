"use client";
import { useState } from "react";
import { toast } from "sonner";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";
import {
  prepararReporte,
  crearPDF,
  crearLibroExcel,
  type TipoInforme,
} from "@/lib/servicios/reportes";
import { guardarFila } from "@/lib/servicios/datos";
import { useRol } from "@/context/rol-context";
import { fechaChile } from "@/lib/servicios/fechas";
export default function ReportesPage() {
  const consulta = useConsulta(obtenerOperacion);
  const { perfilActual, soloLectura } = useRol();
  const [tipo, setTipo] = useState<TipoInforme>("INVENTARIO");
  const [empresa, setEmpresa] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [bodega, setBodega] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const farmacia = consulta.datos?.farmacias.find(
    (f) => String(f.id_farmacia) === empresa,
  );
  const sucursales =
    consulta.datos?.sucursales.filter(
      (s) => s.id_farmacia === Number(empresa),
    ) ?? [];
  const ids = new Set(
    sucursales
      .filter((s) => !sucursal || s.id_sucursal === Number(sucursal))
      .map((s) => s.id_sucursal),
  );
  const bodegas =
    consulta.datos?.bodegas.filter((b) => ids.has(b.id_sucursal)) ?? [];
  async function exportar(formato: "PDF" | "XLS", completo = false) {
    if (!consulta.datos || !farmacia) return;
    if (desde && hasta && desde > hasta) {
      toast.error("La fecha inicial debe ser anterior a la final.");
      return;
    }
    setOcupado(true);
    try {
      const filtro = {
        farmacia: farmacia.id_farmacia,
        sucursal: sucursal ? Number(sucursal) : undefined,
        bodega: bodega ? Number(bodega) : undefined,
        desde,
        hasta,
      };
      const filtroTexto =
        "Sucursal: " +
        (sucursales.find((s) => String(s.id_sucursal) === sucursal)?.nombre ||
          "Todas") +
        " | Bodega: " +
        (bodegas.find((b) => String(b.id_bodega) === bodega)?.nombre ||
          "Todas") +
        " | Fechas: " +
        (desde || "sin inicio") +
        " a " +
        (hasta || "sin fin");
      const tipos: TipoInforme[] = completo
        ? ["INVENTARIO", "MERMAS", "ROTACION"]
        : [tipo];
      const tablas = tipos.map((t) =>
        prepararReporte(consulta.datos!, t, filtro),
      );
      const nombre =
        "SIGAF-" +
        (completo ? "completo" : tipo.toLowerCase()) +
        "-" +
        fechaChile();
      if (!tablas.some((t) => t.filas.length)) {
        toast.info("No hay registros para los filtros seleccionados.");
        return;
      }
      const pdf =
        formato === "PDF"
          ? await crearPDF(
              tablas[0],
              farmacia,
              sucursales.find((s) => String(s.id_sucursal) === sucursal)
                ?.direccion || "Todas las sucursales",
              filtroTexto,
            )
          : null;
      const libro =
        formato === "XLS"
          ? await crearLibroExcel(tablas, {
              farmacia: farmacia.razon_social,
              rut: farmacia.rut,
              filtros: filtroTexto,
            })
          : null;
      if (!soloLectura)
        await guardarFila("reporte", {
          id_usuario: perfilActual.id_usuario,
          tipo,
          formato,
          fecha_generacion: new Date().toISOString(),
        });
      if (pdf) pdf.save(nombre + ".pdf");
      if (libro) {
        const XLSX = await import("xlsx");
        XLSX.writeFile(libro, nombre + ".xlsx");
      }
      toast.success(
        soloLectura
          ? "Informe descargado sin modificar Supabase"
          : "Informe generado con los registros seleccionados",
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo generar el informe.",
      );
    } finally {
      setOcupado(false);
    }
  }
  return (
    <TransicionPagina>
      <Header
        titulo="Reportes y auditoría"
        subtitulo="Inventario, libro de control y bajas. Documentos con identidad de la farmacia."
      />
      <EstadoDatos {...consulta} />
      {consulta.datos && !consulta.cargando && !consulta.error && (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="panel space-y-4 lg:col-span-2">
            <h2 className="font-semibold">Define el alcance</h2>
            <label className="block text-sm">
              Farmacia
              <select
                required
                value={empresa}
                onChange={(e) => {
                  setEmpresa(e.target.value);
                  setSucursal("");
                  setBodega("");
                }}
                className="campo mt-1"
              >
                <option value="">Selecciona la farmacia del membrete</option>
                {consulta.datos.farmacias.map((f) => (
                  <option key={f.id_farmacia} value={f.id_farmacia}>
                    {f.razon_social}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Sucursal
                <select
                  value={sucursal}
                  onChange={(e) => {
                    setSucursal(e.target.value);
                    setBodega("");
                  }}
                  className="campo mt-1"
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map((s) => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Bodega
                <select
                  value={bodega}
                  onChange={(e) => setBodega(e.target.value)}
                  className="campo mt-1"
                >
                  <option value="">Todas las bodegas</option>
                  {bodegas.map((b) => (
                    <option key={b.id_bodega} value={b.id_bodega}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Desde
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="campo mt-1"
                />
              </label>
              <label className="text-sm">
                Hasta
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="campo mt-1"
                />
              </label>
            </div>
            <p className="text-xs text-muted">
              En inventario las fechas filtran vencimientos. En mermas y
              movimientos filtran la fecha de operación.
            </p>
            <label className="block text-sm">
              Informe
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoInforme)}
                className="campo mt-1"
              >
                <option value="INVENTARIO">Inventario farmacéutico</option>
                <option value="MERMAS">Mermas y acta de baja</option>
                <option value="ROTACION">Rotación / libro de control</option>
              </select>
            </label>
          </section>
          <section className="panel space-y-4">
            <h2 className="font-semibold">Exportar información</h2>
            <p className="text-sm text-muted">
              El PDF incluye membrete, filtros, fecha de emisión, paginación y
              espacio de firma del Director Técnico.
            </p>
            <button
              disabled={!farmacia || ocupado}
              className="boton-primario w-full justify-center"
              onClick={() => exportar("PDF")}
            >
              <FileDown size={17} />
              {ocupado ? "Generando…" : "Descargar PDF"}
            </button>
            <button
              disabled={!farmacia || ocupado}
              className="boton-secundario w-full justify-center"
              onClick={() => exportar("XLS")}
            >
              <FileSpreadsheet size={17} />
              Descargar Excel
            </button>
            <button
              disabled={!farmacia || ocupado}
              className="w-full text-sm font-semibold text-acento disabled:opacity-50"
              onClick={() => exportar("XLS", true)}
            >
              Exportar inventario, mermas y movimientos
            </button>
            <p className="text-xs text-muted">
              Revisa y firma los informes antes de presentarlos. La disposición
              final de mermas se documenta en el acta.
            </p>
          </section>
        </div>
      )}
    </TransicionPagina>
  );
}
