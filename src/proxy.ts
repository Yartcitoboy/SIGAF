import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { tieneAcceso } from "@/lib/permisos";
import { verificarAccesoVigente } from "@/lib/supabase/perfil-vigente";
import type { Database } from "@/tipos/database";
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key)
    return NextResponse.redirect(
      new URL("/login?motivo=configuracion", request.url),
    );
  const db = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const mover = (ruta: string) => {
    const result = NextResponse.redirect(new URL(ruta, request.url));
    response.cookies.getAll().forEach((c) => result.cookies.set(c));
    return result;
  };
  const acceso = await verificarAccesoVigente(db);
  if (!acceso.autenticado) return mover("/login");
  const vigente = acceso.perfil;
  if (!vigente) return mover("/login?motivo=perfil");
  if (!tieneAcceso(vigente.rol, request.nextUrl.pathname))
    return mover("/dashboard?acceso=denegado");
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventario/:path*",
    "/productos/:path*",
    "/lotes/:path*",
    "/dispensacion/:path*",
    "/movimientos/:path*",
    "/alertas/:path*",
    "/reportes/:path*",
    "/usuarios/:path*",
    "/configuracion/:path*",
    "/mensajes/:path*",
  ],
};
