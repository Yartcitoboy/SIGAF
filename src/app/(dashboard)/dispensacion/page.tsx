"use client";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { ResumenConsulta } from "@/componentes/ui/contexto-operacion";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { DashboardAuxiliarView } from "@/componentes/dashboard/dashboard-auxiliar-view";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";

export default function DispensacionPage() {
  const consulta = useConsulta(obtenerOperacion);
  return (
    <TransicionPagina>
      <Header
        titulo="Dispensación · FEFO"
        subtitulo="Selecciona medicamento y ubicación. La recomendación no modifica existencias; el servidor verifica cada salida real."
      />
      <EstadoDatos {...consulta} />
      {consulta.datos && !consulta.cargando && !consulta.error && (
        <>
          <ResumenConsulta
            cantidad={consulta.datos.productos.length}
            total={consulta.datos.productos.length}
            unidad="productos del catálogo consultado"
            actualizado={consulta.actualizado}
            recargar={consulta.recargar}
            cargando={consulta.cargando}
          />
          <DashboardAuxiliarView
            datos={consulta.datos}
            recargar={consulta.recargar}
            filtrarPorUbicacion
          />
        </>
      )}
    </TransicionPagina>
  );
}
