import { redirect } from "next/navigation";
import { Sidebar } from "@/componentes/layout/sidebar";
import { cookies } from "next/headers";
import { TemaProvider } from "@/context/tema-context";
import { modoValido, nombreCookieTema } from "@/lib/tema/paletas";
import { RolProvider } from "@/context/rol-context";
import { autorizar, ErrorHttp } from "@/lib/autorizacion";
import { obtenerSesionLocal } from "@/lib/auth/local-server";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const local = await obtenerSesionLocal();
  let sesion;
  if (local) sesion = { ...local, db: null };
  else
    try {
      sesion = await autorizar();
    } catch (error) {
      if (error instanceof ErrorHttp)
        redirect(
          "/login?motivo=" + (error.status === 403 ? "perfil" : "sesion"),
        );
      redirect("/login?motivo=configuracion");
    }
  const { usuario, rol, db } = sesion;
  const modoInicial = modoValido(
    (await cookies()).get(nombreCookieTema(rol))?.value,
  );
  const { data: sucursal } =
    db && usuario.id_sucursal
      ? await db
          .from("sucursal")
          .select("nombre")
          .eq("id_sucursal", usuario.id_sucursal)
          .single()
      : { data: null };
  const perfil = {
    ...usuario,
    accesoLocal: Boolean(local),
    rol,
    iniciales: usuario.nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join(""),
    cargo:
      rol === "ADMIN"
        ? "Administración"
        : rol === "BODEGUERO"
          ? "Logística e inventario"
          : "Dispensación",
    sucursal: local
      ? "Supabase · consulta"
      : (sucursal?.nombre ?? "Todas las sucursales"),
  };
  return (
    <RolProvider perfil={perfil}>
      <TemaProvider key={rol} rol={rol} modoInicial={modoInicial}>
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 md:p-8">
          {local && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-acento-borde/40 bg-acento-suave px-4 py-3 text-xs text-acento">
              <span>
                <strong>Datos de Supabase</strong> · {rol} · Acceso temporal de
                solo lectura. Se muestra la base existente sin modificar
                registros ni enviar correos.
              </span>
              <Link
                href="/login"
                className="font-semibold underline underline-offset-4"
              >
                Cambiar perfil
              </Link>
            </div>
          )}
          {children}
        </main>
      </TemaProvider>
    </RolProvider>
  );
}
