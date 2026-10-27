"use client";
import { createPortal } from "react-dom";
import { Dialogo } from "@/componentes/ui/dialogo";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { prepararEtiquetaLote } from "@/lib/vistas/etiqueta-lote";
import { fechaVisible } from "@/lib/vistas/presentacion";

export function EtiquetaLote({
  datos,
  id,
  cerrar,
}: {
  datos: DatosOperacion;
  id: number;
  cerrar: () => void;
}) {
  const etiqueta = prepararEtiquetaLote(datos, id);
  const emitida = new Date(datos.ahora).toLocaleString("es-CL", {
    timeZone: "America/Santiago",
  });
  if (!etiqueta)
    return (
      <Dialogo titulo="Etiqueta no disponible" cerrar={cerrar}>
        <p>El lote ya no está disponible en el alcance de tu cuenta.</p>
      </Dialogo>
    );
  const contenido = (
    <article className="etiqueta-textual rounded-xl border-2 border-borde bg-white p-5 text-slate-950">
      <p className="text-xs font-semibold uppercase">
        SIGAF · Consulta de lote
      </p>
      <h3 className="my-3 text-lg font-bold">{etiqueta.producto.nombre}</h3>
      <p className="mb-2 font-mono text-lg font-bold">
        {etiqueta.lote.numero_lote}
      </p>
      <p>Vencimiento: {fechaVisible(etiqueta.lote.fecha_vencimiento)}</p>
      <p>
        Presentación: {etiqueta.producto.unidad_medida || "Sin especificar"}
      </p>
      <p>
        Código textual:{" "}
        {etiqueta.producto.codigo_barras || "Sin código registrado"}
      </p>
      <p className="mt-2 font-semibold">
        Stock físico consultado: {etiqueta.stock}
      </p>
      <ul className="my-2 space-y-1 text-sm">
        {etiqueta.ubicaciones.map((u) => (
          <li key={u.id}>
            {u.nombre}: {u.cantidad}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs">
        Consulta: {emitida} (Chile). El stock puede cambiar.
      </p>
      <p className="mt-2 text-xs">
        Referencia interna. No contiene QR ni código de barras escaneable y no
        reemplaza el rotulado del medicamento.
      </p>
    </article>
  );
  return (
    <Dialogo titulo="Etiqueta del lote" cerrar={cerrar}>
      {contenido}
      <p className="my-4 text-sm text-muted">
        Vista de los datos consultados, sin modificar Supabase. “Imprimir” abre
        el diálogo de tu navegador; también puedes guardar como PDF.
      </p>
      <button
        type="button"
        className="boton-primario"
        onClick={() => window.print()}
      >
        Imprimir etiqueta
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <div className="sigaf-etiqueta-impresion" style={{ display: "none" }}>
            <style>{`@media print { @page { size: A6; margin: 8mm; } body { background: white !important; margin: 0 !important; } body > * { display: none !important; } body > .sigaf-etiqueta-impresion { display: block !important; color: #000 !important; font-family: Arial, sans-serif; } .sigaf-etiqueta-impresion article { border: 1px solid #444; padding: 5mm; color: #000; background: #fff; font-size: 10pt; overflow-wrap: anywhere; } .sigaf-etiqueta-impresion h3 { font-size: 13pt; margin: 3mm 0; } .sigaf-etiqueta-impresion p, .sigaf-etiqueta-impresion li { margin: 2mm 0; } }`}</style>
            {contenido}
          </div>,
          document.body,
        )}
    </Dialogo>
  );
}
