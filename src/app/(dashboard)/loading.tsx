export default function CargandoModulo() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="panel space-y-4"
    >
      <p className="font-semibold">Abriendo módulo…</p>
      <div aria-hidden="true" className="h-8 w-48 rounded-lg bg-sutil" />
      <div aria-hidden="true" className="h-32 rounded-xl bg-sutil" />
    </section>
  );
}
