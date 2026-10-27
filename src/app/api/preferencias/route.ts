import { autorizar, ErrorHttp, respuestaError } from "@/lib/autorizacion";
import { z } from "zod";
export async function PATCH(request: Request) {
  try {
    const origen = request.headers.get("origin");
    if (origen && new URL(origen).host !== request.headers.get("host"))
      throw new ErrorHttp("Origen no permitido.", 403);
    const entrada = z
      .object({ tema: z.enum(["claro", "oscuro"]) })
      .strict()
      .safeParse(await request.json());
    if (!entrada.success) throw new ErrorHttp("Tema inválido.", 400);
    const { db, usuario } = await autorizar();
    const { error } = await db
      .from("preferencia_usuario")
      .upsert({ id_usuario: usuario.id_usuario, tema: entrada.data.tema });
    if (error) throw error;
    return Response.json(
      { tema: entrada.data.tema },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return respuestaError(error);
  }
}
