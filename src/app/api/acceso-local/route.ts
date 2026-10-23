import { NextResponse } from "next/server";
import {
  accesoLocalHabilitado,
  autenticarCuentaLocal,
  COOKIE_LOCAL,
  DURACION_LOCAL,
  firmarSesionLocal,
} from "@/lib/auth/sesion-local";
export async function POST(request: Request) {
  if (!accesoLocalHabilitado(request.headers.get("host")))
    return NextResponse.json(
      { error: "El acceso temporal local está desactivado." },
      { status: 404 },
    );
  const origen = request.headers.get("origin");
  if (origen) {
    try {
      const emisor = new URL(origen);
      const destino = new URL("http://" + request.headers.get("host"));
      if (
        !["http:", "https:"].includes(emisor.protocol) ||
        !accesoLocalHabilitado(emisor.host) ||
        emisor.port !== destino.port
      ) {
        return NextResponse.json(
          { error: "Origen de acceso no permitido." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Origen de acceso no permitido." },
        { status: 403 },
      );
    }
  }
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Revisa los datos de acceso." },
      { status: 400 },
    );
  }
  if (
    typeof cuerpo?.email !== "string" ||
    typeof cuerpo?.password !== "string" ||
    cuerpo.email.length > 150 ||
    cuerpo.password.length > 128
  )
    return NextResponse.json(
      { error: "Revisa los datos de acceso." },
      { status: 400 },
    );
  const cuenta = autenticarCuentaLocal(cuerpo.email, cuerpo.password);
  if (!cuenta)
    return NextResponse.json(
      { error: "El correo o la contraseña local no coinciden." },
      { status: 401 },
    );
  const respuesta = NextResponse.json(
    { ok: true, rol: cuenta.rol },
    { headers: { "Cache-Control": "no-store" } },
  );
  respuesta.cookies.set(
    COOKIE_LOCAL,
    firmarSesionLocal(cuenta.rol, process.env.SIGAF_LOCAL_SESSION_SECRET!),
    {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: DURACION_LOCAL,
      secure: false,
    },
  );
  return respuesta;
}
export async function DELETE() {
  const respuesta = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  respuesta.cookies.set(COOKIE_LOCAL, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return respuesta;
}
