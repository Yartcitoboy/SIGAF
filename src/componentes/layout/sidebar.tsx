"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Pill,
  QrCode,
  ArrowLeftRight,
  ShoppingCart,
  Bell,
  FileSpreadsheet,
  Users,
  Settings,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useRol } from "@/context/rol-context";
import { PerfilUsuario } from "./perfil-usuario";
const modulos = [
  { nombre: "Dashboard", href: "/dashboard", Icono: LayoutDashboard },
  { nombre: "Inventario", href: "/inventario", Icono: Boxes },
  { nombre: "Productos", href: "/productos", Icono: Pill },
  { nombre: "Lotes", href: "/lotes", Icono: QrCode },
  { nombre: "Dispensación", href: "/dispensacion", Icono: ShoppingCart },
  { nombre: "Movimientos", href: "/movimientos", Icono: ArrowLeftRight },
  { nombre: "Alertas", href: "/alertas", Icono: Bell },
  { nombre: "Mensajes", href: "/mensajes", Icono: Mail },
  { nombre: "Reportes", href: "/reportes", Icono: FileSpreadsheet },
  { nombre: "Usuarios", href: "/usuarios", Icono: Users },
  { nombre: "Configuración", href: "/configuracion", Icono: Settings },
];
export function Sidebar() {
  const pathname = usePathname();
  const { tieneAccesoAModulo } = useRol();
  const [abierto, setAbierto] = useState(false);
  return (
    <aside className="barra-lateral sticky top-0 z-30 shrink-0 md:h-screen md:w-60">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:block focus:p-4"
      >
        Ir al contenido
      </a>
      <div className="flex items-center justify-between border-b border-barra-borde p-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="rounded-xl bg-barra-activa p-2 text-barra-activa-tinta">
            <Pill size={24} />
          </span>
          <span className="text-xl font-bold tracking-tight">
            SIGAF
            <span className="block text-[10px] font-normal tracking-normal text-barra-muted">
              Gestión farmacéutica
            </span>
          </span>
        </Link>
        <button
          aria-label={abierto ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
          className="grid min-h-11 min-w-11 place-items-center rounded-xl hover:bg-barra-hover md:hidden"
        >
          {abierto ? <X /> : <Menu />}
        </button>
      </div>
      <div
        className={
          (abierto ? "flex" : "hidden") +
          " flex-col md:flex md:h-[calc(100vh-90px)]"
        }
      >
        <p className="px-6 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-widest text-barra-muted">
          Espacio de trabajo
        </p>
        <nav
          aria-label="Módulos"
          className="flex-1 space-y-1 overflow-y-auto p-3"
        >
          {modulos
            .filter((m) => tieneAccesoAModulo(m.href))
            .map(({ nombre, href, Icono }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setAbierto(false)}
                className={
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition " +
                  (pathname === href
                    ? "bg-barra-activa font-semibold text-barra-activa-tinta shadow-sm"
                    : "text-barra-muted hover:bg-barra-hover hover:text-barra-tinta")
                }
              >
                <Icono size={18} />
                {nombre}
              </Link>
            ))}
        </nav>
        <PerfilUsuario />
      </div>
    </aside>
  );
}
