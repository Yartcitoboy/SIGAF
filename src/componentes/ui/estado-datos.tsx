import { Database, RefreshCw, AlertCircle } from "lucide-react";
export function EstadoDatos({
  cargando,
  error,
  vacio,
  recargar,
}: {
  cargando: boolean;
  error: string | null;
  vacio?: boolean;
  recargar?: () => void;
}) {
  if (cargando)
    return (
      <div role="status" aria-label="Cargando datos" className="space-y-3 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-20 rounded-xl" />
        ))}
        <span className="sr-only">Cargando datos…</span>
      </div>
    );
  if (error)
    return (
      <div role="alert" className="panel my-4 border-red-200">
        <AlertCircle className="mb-3 text-red-500" />
        <h3 className="font-semibold">No pudimos cargar la información</h3>
        <p className="mt-2 text-sm text-muted">{error}</p>
        {recargar && (
          <button onClick={recargar} className="boton-secundario mt-4">
            <RefreshCw size={15} />
            Reintentar
          </button>
        )}
      </div>
    );
  if (vacio)
    return (
      <div className="panel my-4 py-12 text-center">
        <Database className="mx-auto mb-3 text-acento" />
        <h3 className="font-semibold">Aún no hay registros</h3>
        <p className="mt-2 text-sm text-muted">
          Los datos aparecerán aquí cuando se registren operaciones.
        </p>
      </div>
    );
  return null;
}
