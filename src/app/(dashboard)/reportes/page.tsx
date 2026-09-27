'use client';

import React, { useState } from 'react';
import { Header } from '@/componentes/layout/header';
import { mockInventario, mockFarmacia } from '@/datos-mock/inventario-data';
import { FileSpreadsheet, FileText, Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportesPage() {
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [archivoSubido, setArchivoSubido] = useState<string | null>(null);

  // Generador real de PDF en el navegador usando jsPDF
  const exportarReportePDF = (tipo: 'ISP' | 'MERMAS' | 'FEFO') => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(mockFarmacia.razon_social, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`RUT: ${mockFarmacia.rut} | Dirección: ${mockFarmacia.direccion}`, 14, 26);
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
    const filas = mockInventario.map(item => [
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
  };

  const handleSimularExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCargandoArchivo(true);
      const nombre = e.target.files[0].name;
      setTimeout(() => {
        setCargandoArchivo(false);
        setArchivoSubido(nombre);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        titulo="Centro de Reportes y Migración de Inventario"
        subtitulo="Exportación de informes sanitarios para el ISP y carga masiva mediante planilla Excel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Exportación de Informes Sanitarios */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar PDF
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar PDF
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Planilla Completa de Inventario (Excel .XLS)
                </p>
                <p className="text-[11px] text-slate-400">
                  Volcado tabular para control interno o contabilidad.
                </p>
              </div>
              <button
                onClick={() => alert('Generando planilla de cálculo Excel...')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Exportar XLS
              </button>
            </div>
          </div>
        </div>

        {/* 2. Carga Masiva Inicial (Importación desde Excel) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Carga Masiva de Inventario (Migración desde Excel)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Si la farmacia manejaba su stock en cuadernos o Excel, sube la planilla para poblar la base de datos automáticamente.
            </p>

            <div className="mt-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-teal-500 transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-800/20">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleSimularExcel}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Haz clic o arrastra tu archivo Excel (.xlsx / .csv)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Columnas requeridas: Código de Barra, Nombre, N° Lote, Fecha Vencimiento, Cantidad
              </p>
            </div>
          </div>

          {cargandoArchivo && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium animate-pulse mt-4">
              ⏳ Analizando archivo y validando fechas de caducidad...
            </div>
          )}

          {archivoSubido && !cargandoArchivo && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 mt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Archivo &ldquo;{archivoSubido}&rdquo; validado con éxito: 150 medicamentos listos para migrar a Supabase.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
