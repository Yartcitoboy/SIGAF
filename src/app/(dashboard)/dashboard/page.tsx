"use client";
import { Header } from "@/componentes/layout/header";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { useRol } from "@/context/rol-context";
import { useConsulta } from "@/lib/hooks/use-consulta";
import { obtenerOperacion } from "@/lib/servicios/operacion";
import { DashboardAdminView } from "@/componentes/dashboard/dashboard-admin-view";
import { DashboardBodegueroView } from "@/componentes/dashboard/dashboard-bodeguero-view";
import { DashboardAuxiliarView } from "@/componentes/dashboard/dashboard-auxiliar-view";
export default function DashboardPage() {
  const { rolActual } = useRol();
  const consulta = useConsulta(obtenerOperacion);
  const titulos = {
    ADMIN: "Panorama de tu farmacia",
    BODEGUERO: "Tu operación, en orden",
    AUXILIAR: "Dispensación segura",
  };
  return (
    <TransicionPagina>
      <Header
        titulo={titulos[rolActual]}
        subtitulo="Stock, lotes y decisiones basadas en los registros de tu farmacia."
      />
      <EstadoDatos
        {...consulta}
        vacio={consulta.datos?.inventario.length === 0}
      />
      {consulta.datos &&
        !consulta.cargando &&
        !consulta.error &&
        (rolActual === "ADMIN" ? (
          <DashboardAdminView datos={consulta.datos} />
        ) : rolActual === "BODEGUERO" ? (
          <DashboardBodegueroView datos={consulta.datos} />
        ) : (
          <DashboardAuxiliarView
            datos={consulta.datos}
            recargar={consulta.recargar}
          />
        ))}
    </TransicionPagina>
  );
}
