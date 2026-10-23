import { autorizar, respuestaError } from "@/lib/autorizacion";
import { obtenerSesionLocal } from "@/lib/auth/local-server";
export async function GET() {
  try {
    const local = await obtenerSesionLocal();
    if (local)
      return Response.json(
        { ...local, modo: "local", fuenteDatos: "supabase", soloLectura: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    const { usuario, rol } = await autorizar();
    return Response.json(
      { usuario, rol },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return respuestaError(error);
  }
}
