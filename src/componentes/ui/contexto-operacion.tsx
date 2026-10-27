import { RefreshCw } from "lucide-react";
export function ResumenConsulta({
  cantidad,
  total,
  actualizado,
  recargar,
  limpiar,
  cargando = false,
  unidad = "registros",
}: {
  cantidad: number;
  total: number;
  actualizado?: string | null;
  recargar: () => void;
  limpiar?: () => void;
  cargando?: boolean;
  unidad?: string;
}) {
  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <p role="status">
        Mostrando {cantidad} de {total} {unidad}
        {actualizado && (
          <>
            {" "}
            · Consulta{" "}
            {new Date(actualizado).toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Santiago",
            })}{" "}
            (Chile)
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {limpiar && (
          <button type="button" className="boton-secundario" onClick={limpiar}>
            Limpiar filtros
          </button>
        )}
        <button
          type="button"
          className="boton-secundario"
          disabled={cargando}
          onClick={recargar}
        >
          <RefreshCw size={14} aria-hidden="true" />
          {cargando ? "Consultando…" : "Actualizar"}
        </button>
      </div>
    </div>
  );
}
