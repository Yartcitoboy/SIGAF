import { headers } from "next/headers";
import { LoginFormulario } from "@/componentes/auth/login-formulario";
import { accesoLocalHabilitado } from "@/lib/auth/sesion-local";
export default async function LoginPage() {
  const cabeceras = await headers();
  return (
    <LoginFormulario
      accesoLocal={accesoLocalHabilitado(cabeceras.get("host"))}
    />
  );
}
