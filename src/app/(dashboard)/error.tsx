"use client";

export default function ErrorModulo({ retry }: { retry: () => void }) {
  return (
    <section role="alert" className="panel mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">No se pudo mostrar esta pantalla</h1>
      <p>Intenta cargarla de nuevo. Si estabas confirmando una operación, revisa el historial antes de repetirla.</p>
      <div className="flex flex-wrap gap-3">
        <button className="boton-primario" onClick={() => retry()}>Volver a intentar</button>
        <a className="boton-secundario" href="/dashboard">Ir al dashboard</a>
      </div>
    </section>
  );
}
