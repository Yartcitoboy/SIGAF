import type { EstadoSemaforo } from "@/tipos/database";
const estilos: Record<string, string> = {
  VENCIDO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  ROJO: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  NARANJO:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
  AMARILLO:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  VERDE:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
};
const nombres: Record<string, string> = {
  VENCIDO: "Caducado",
  ROJO: "Crítico",
  NARANJO: "Crítico",
  AMARILLO: "Preventivo",
  VERDE: "Vigente",
};
export function SemaforoBadge({
  estado,
  diasRestantes,
}: {
  estado: EstadoSemaforo | string | null | undefined;
  diasRestantes?: number;
  mostrarIcono?: boolean;
  tamano?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
        (estilos[estado ?? ""] ?? "border-borde text-muted")
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {nombres[estado ?? ""] ?? "Sin clasificar"}
      {diasRestantes !== undefined && (
        <span className="font-normal opacity-80">· {diasRestantes} d</span>
      )}
    </span>
  );
}
