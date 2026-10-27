import { redirect } from "next/navigation";
import { Sidebar } from "@/componentes/layout/sidebar";
import { TemaProvider } from "@/context/tema-context";
import { RolProvider } from "@/context/rol-context";
import { autorizar, ErrorHttp } from "@/lib/autorizacion";
import { contextoSistemaSchema } from "@/lib/datos/contexto";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let sesion;
  try {
    sesion = await autorizar();
  } catch (error) {
    if (error instanceof ErrorHttp)
      redirect("/login?motivo=" + (error.status === 403 ? "perfil" : "sesion"));
    redirect("/login?motivo=configuracion");
  }
  const { usuario, rol, db } = sesion;
  const { data: contexto, error } = await db.rpc("contexto_sigaf", {});
  const sistema = contextoSistemaSchema.safeParse(contexto);
  if (error || !sistema.success)
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">
          Completa la configuración de Supabase
        </h1>
        <p className="mt-4">
          Tu sesión es válida, pero falta el contexto operativo de la base.
          Aplica las migraciones pendientes del proyecto. No se utilizarán datos
          de demostración.
        </p>
        <a className="mt-4 block underline" href="/login">
          Volver al acceso
        </a>
      </main>
    );
  const { data: sucursal } = usuario.id_sucursal
    ? await db
        .from("sucursal")
        .select("nombre")
        .eq("id_sucursal", usuario.id_sucursal)
        .single()
    : { data: null };
  const perfil = {
    ...usuario,
    rol,
    sistema: sistema.data,
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
    sucursal:
      sucursal?.nombre ??
      (rol === "ADMIN" ? "Todas las sucursales" : "Sin sucursal asignada"),
  };
  return (
    <RolProvider perfil={perfil}>
      <TemaProvider key={rol} rol={rol} modoInicial={sistema.data.tema}>
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </TemaProvider>
    </RolProvider>
  );
}
