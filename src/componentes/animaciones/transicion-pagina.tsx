import type { ReactNode } from "react";
export function TransicionPagina({
  children,
  className = "space-y-6",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`entrada-pagina ${className}`}>{children}</div>;
}
