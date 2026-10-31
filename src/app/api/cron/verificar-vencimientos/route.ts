// Se mantiene una respuesta explícita para instalaciones que aún llamen al cron antiguo.
// Un único planificador en Supabase evita dobles envíos y funciona sin la web local.
export async function GET() {
  return Response.json(
    {
      error:
        "El proceso de caducidad se ejecuta en Supabase. Consulta Alertas para configurar Gmail y ver su estado.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
