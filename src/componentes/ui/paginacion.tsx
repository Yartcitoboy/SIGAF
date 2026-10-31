export function Paginacion({
  pagina,
  total,
  cambiar,
  cargando = false,
  tamano = 25,
}: {
  pagina: number;
  total: number;
  cambiar: (pagina: number) => void;
  cargando?: boolean;
  tamano?: number;
}) {
  const paginas = Math.max(1, Math.ceil(total / tamano));
  return (
    <nav
      aria-label="Paginación del listado"
      className="my-4 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <span role="status">
        Página {pagina} de {paginas} · {total.toLocaleString("es-CL")}{" "}
        coincidencias
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="boton-secundario"
          disabled={cargando || pagina <= 1}
          onClick={() => cambiar(pagina - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="boton-secundario"
          disabled={cargando || pagina >= paginas}
          onClick={() => cambiar(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
