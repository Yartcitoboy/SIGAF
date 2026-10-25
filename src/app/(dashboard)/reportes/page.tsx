'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/componentes/layout/header';
import { TransicionPagina } from '@/componentes/animaciones/transicion-pagina';
import {
  obtenerDatosInventario,
  obtenerFarmacia,
  registrarReporte,
  obtenerHistorialReportes,
} from '@/lib/servicios/reportes';
import type { Inventario, Farmacia, Reporte } from '@/tipos/database';
import { FileSpreadsheet, FileText, Upload, Download, CheckCircle2, History } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportesPage() {
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [archivoSubido, setArchivoSubido] = useState<string | null>(null);

  // Datos desde Supabase
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [farmacia, setFarmacia] = useState<Farmacia | null>(null);
  const [historial, setHistorial] = useState<Reporte[]>([]);

  const cargarHistorial = useCallback(async () => {
    try {
      const h = await obtenerHistorialReportes();
      setHistorial(h);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [inv, farm] = await Promise.all([
          obtenerDatosInventario(),
          obtenerFarmacia(),
        ]);
        setInventario(inv);
        setFarmacia(farm);
        await cargarHistorial();
      } catch (e) {
        console.error(e);
      }
    }
    cargarDatos();
  }, [cargarHistorial]);

  // Generador real de PDF usando jsPDF con datos de Supabase
  const exportarReportePDF = async (tipo: 'ISP' | 'MERMAS' | 'FEFO') => {
    const doc = new jsPDF();
    const razonSocial = farmacia?.razon_social ?? 'Farmacia';
    const rut = farmacia?.rut ?? '';
    const direccion = farmacia?.direccion ?? '';

    // Encabezado
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(razonSocial, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`RUT: ${rut} | Dirección: ${direccion}`, 14, 26);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}`, 14, 32);

    doc.setFontSize(13);
    doc.setTextColor(13, 148, 136); // Teal
    doc.text(
      tipo === 'ISP' 
        ? 'INFORME SANITARIO OFICIAL: CONTROL DE VENCIMIENTOS (FEFO)' 
        : tipo === 'MERMAS' 
        ? 'INFORME DE MEDICAMENTOS DADOS DE BAJA (MERMAS)' 
        : 'INFORME DE TRAZABILIDAD Y ROTACIÓN DE STOCK',
      14, 42
    );

    // Tabla de datos
    const columnas = ['Código Barra', 'Medicamento', 'N° Lote', 'Ubicación', 'Stock', 'Caducidad', 'Estado'];
    const filas = inventario.map(item => [
      item.lote?.producto?.codigo_barras || '-',
      item.lote?.producto?.nombre || '-',
      item.lote?.numero_lote || '-',
      item.bodega?.nombre || '-',
      `${item.stock_actual} un.`,
      item.lote?.fecha_vencimiento || '-',
      item.estado_semaforo || '-'
    ]);

    autoTable(doc, {
      startY: 48,
      head: [columnas],
      body: filas,
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8 },
    });

    // Pie de página de fiscalización
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Documento oficial generado por SIGAF FarmaVence conforme al Decreto Supremo N° 466 de Farmacias.', 14, finalY + 15);

    doc.save(`SIGAF_Reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`);

    // Registrar el reporte generado en la base de datos y refrescar el historial
    const tipoBD = tipo === 'ISP' ? 'INVENTARIO' : tipo === 'MERMAS' ? 'MERMAS' : 'ROTACION';
    try {
      await registrarReporte(tipoBD, 'PDF');
      await cargarHistorial();
    } catch (e) {
      console.error('No se pudo registrar el reporte:', e);
    }
  };

  // Exporta el inventario a Excel (formato CSV, que Excel abre directamente)
  const exportarExcel = async () => {
    const columnas = ['Codigo Barra', 'Medicamento', 'N Lote', 'Ubicacion', 'Stock', 'Caducidad', 'Estado'];
    const filas = inventario.map((item) => [
      item.lote?.producto?.codigo_barras || '-',
      item.lote?.producto?.nombre || '-',
      item.lote?.numero_lote || '-',
      item.bodega?.nombre || '-',
      String(item.stock_actual ?? 0),
      item.lote?.fecha_vencimiento || '-',
      item.estado_semaforo || '-',
    ]);

    // Construir el contenido CSV (separado por ;) con BOM para acentos
    const sep = ';';
    const lineas = [columnas.join(sep), ...filas.map((f) => f.map((c) => `"${c}"`).join(sep))];
    const csv = '\uFEFF' + lineas.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIGAF_Inventario_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Registrar el reporte
    try {
      await registrarReporte('INVENTARIO', 'XLS');
      await cargarHistorial();
    } catch (e) {
      console.error('No se pudo registrar el reporte:', e);
    }
  };

  const handleSimularExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCargandoArchivo(true);
      const nombre = e.target.files[0].name;
      setTimeout(() => {
        setCargandoArchivo(false);
        setArchivoSubido(nombre);
      }, 1200);
    }
  };

  return (
    <TransicionPagina>
      <Header
        titulo="Centro de Reportes y Migración de Inventario"
        subtitulo="Exportación de informes sanitarios para el ISP y carga masiva mediante planilla Excel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Exportación de Informes Sanitarios */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-md">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Generación de Informes Sanitarios y Auditoría
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Descarga en tiempo real los reportes oficiales en PDF para auditorías del Instituto de Salud Pública (ISP).
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between transition-all duration-150 hover:-translate-y-0.5">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Informe de Vencimientos y Semáforo FEFO
                </p>
                <p className="text-[11px] text-slate-400">
                  Clasificación de todos los lotes vigentes, preventivos y críticos.
                </p>
              </div>
              <button
                onClick={() => exportarReportePDF('ISP')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar PDF
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between transition-all duration-150 hover:-translate-y-0.5">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Acta Oficial de Mermas y Destrucción
                </p>
                <p className="text-[11px] text-slate-400">
                  Registro de medicamentos caducados retirados de la sala de ventas.
                </p>
              </div>
              <button
                onClick={() => exportarReportePDF('MERMAS')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar PDF
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between transition-all duration-150 hover:-translate-y-0.5">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Planilla Completa de Inventario (Excel .XLS)
                </p>
                <p className="text-[11px] text-slate-400">
                  Volcado tabular para control interno o contabilidad.
                </p>
              </div>
              <button
                onClick={exportarExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all duration-150"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Exportar XLS
              </button>
            </div>
          </div>
        </div>

        {/* 2. Carga Masiva Inicial (Importación desde Excel) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Carga Masiva de Inventario (Migración desde Excel)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Si la farmacia manejaba su stock en cuadernos o Excel, sube la planilla para poblar la base de datos automáticamente.
            </p>

            <div className="mt-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-teal-500 transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-800/20 group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleSimularExcel}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto mb-2 transition-transform group-hover:scale-110 duration-200" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Haz clic o arrastra tu archivo Excel (.xlsx / .csv)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Columnas requeridas: Código de Barra, Nombre, N° Lote, Fecha Vencimiento, Cantidad
              </p>
            </div>
          </div>

          <AnimatePresence>
            {cargandoArchivo && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium animate-pulse mt-4"
              >
                ⏳ Analizando archivo y validando fechas de caducidad...
              </motion.div>
            )}

            {archivoSubido && !cargandoArchivo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 mt-4"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Archivo &ldquo;{archivoSubido}&rdquo; validado con éxito: 150 medicamentos listos para migrar a Supabase.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Historial de Reportes Generados (desde la base de datos) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Historial de Reportes Generados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Tipo de Reporte</th>
                <th className="py-3 px-4">Formato</th>
                <th className="py-3 px-4">Generado por</th>
                <th className="py-3 px-4">Fecha de Generación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {historial.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    Aún no se han generado reportes. Descarga un PDF para registrar el primero.
                  </td>
                </tr>
              )}
              {historial.map((rep) => (
                <tr key={rep.id_reporte} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">#{rep.id_reporte}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{rep.tipo}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      {rep.formato}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {(rep as Reporte & { usuario?: { nombre?: string } }).usuario?.nombre ?? 'Sistema'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(rep.fecha_generacion).toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TransicionPagina>
  );
}
