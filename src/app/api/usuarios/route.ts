import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";

// La función verificada de Supabase comprueba de nuevo sesión y rol.
// La clave administrativa permanece exclusivamente en su entorno de servidor.
async function gestionar(request: Request) {
  try {
    const origen = request.headers.get("origin");
    if (origen && new URL(origen).host !== request.headers.get("host"))
      throw new ErrorHttp("Origen no permitido.", 403);
    const { db } = await autorizar(["ADMIN"]);
    const {
      data: { session },
      error: sesionError,
    } = await db.auth.getSession();
    if (sesionError || !session)
      throw new ErrorHttp("Inicia sesión para continuar.", 401);
    const { data, error } = await db.functions.invoke("sigaf-usuarios", {
      body: {
        metodo: request.method,
        ...(request.method === "GET" ? {} : { datos: await request.json() }),
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) {
      if (error.context instanceof Response) {
        const detalle = await error.context
          .json()
          .catch(() => ({ error: "No se pudo gestionar la cuenta." }));
        return Response.json(
          { error: detalle.error || "No se pudo gestionar la cuenta." },
          {
            status: error.context.status,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
      throw new Error(
        "No se pudo conectar con la administración de cuentas de Supabase.",
      );
    }
    return Response.json(data, {
      status: request.method === "POST" ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return respuestaError(error);
  }
}
export const GET = gestionar;
export const POST = gestionar;
export const PATCH = gestionar;
