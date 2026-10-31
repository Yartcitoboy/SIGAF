import { autorizar, respuestaError } from "@/lib/autorizacion";
import { buscarMedicamentoCodigo } from "@/lib/datos/busqueda-codigo";
import { ErrorCodigo } from "@/lib/servicios/codigo-medicamento";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { db } = await autorizar();
    const resultado = await buscarMedicamentoCodigo(
      db,
      new URL(request.url).searchParams.get("codigo") ?? "",
    );
    return Response.json(
      resultado.producto
        ? resultado
        : { ...resultado, error: "El medicamento no está registrado." },
      { status: resultado.producto ? 200 : 404, headers },
    );
  } catch (e) {
    if (e instanceof ErrorCodigo)
      return Response.json({ error: e.message }, { status: e.estado, headers });
    const respuesta = respuestaError(e);
    respuesta.headers.set("Cache-Control", "no-store");
    return respuesta;
  }
}
