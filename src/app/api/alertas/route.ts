import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";
async function gestionar(request: Request) {
  try {
    const origen = request.headers.get("origin");
    if (origen && new URL(origen).host !== request.headers.get("host"))
      throw new ErrorHttp("Origen no permitido.", 403);
    const { db } = await autorizar();
    const {
      data: { session },
      error: sesionError,
    } = await db.auth.getSession();
    if (sesionError || !session)
      throw new ErrorHttp("Inicia sesión para continuar.", 401);
    const { data, error } = await db.functions.invoke("sigaf-alertas", {
      body:
        request.method === "GET" ? { accion: "estado" } : await request.json(),
      headers: { Authorization: "Bearer " + session.access_token },
    });
    if (error) {
      if (error.context instanceof Response) {
        const detalle = await error.context
          .json()
          .catch(() => ({ error: "No se pudo completar la operación." }));
        return Response.json(
          { error: detalle.error },
          {
            status: error.context.status,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
      throw new ErrorHttp(
        "No se pudo conectar con el servicio de alertas.",
        503,
      );
    }
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return respuestaError(error);
  }
}
export const GET = gestionar;
export const POST = gestionar;
