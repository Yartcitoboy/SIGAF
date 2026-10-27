import { autorizar, respuestaError } from "@/lib/autorizacion";
export async function GET() {
  try {
    const { usuario, rol } = await autorizar();
    return Response.json(
      { usuario, rol },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return respuestaError(error);
  }
}
