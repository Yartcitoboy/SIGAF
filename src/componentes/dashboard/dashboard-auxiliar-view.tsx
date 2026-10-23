"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, MapPin, Search } from "lucide-react";
import { type DatosOperacion, operarStock } from "@/lib/servicios/operacion";
import { diasHasta } from "@/lib/servicios/fechas";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { useRol } from "@/context/rol-context";
export function DashboardAuxiliarView({
  datos,
  recargar,
}: {
  datos: DatosOperacion;
  recargar: () => Promise<void>;
}) {
  const { soloLectura } = useRol();
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const claves = useRef<Record<number, string>>({});
  const productos = datos.productos.filter((p) =>
    [p.nombre, p.codigo_barras, p.principio_activo, p.descripcion].some((v) =>
      v?.toLowerCase().includes(busqueda.toLowerCase()),
    ),
  );
  const lotes = datos.inventario
    .filter((i) => i.lote?.id_producto === seleccion && i.stock_actual > 0)
    .sort(
      (a, b) =>
        a.lote!.fecha_vencimiento.localeCompare(b.lote!.fecha_vencimiento) ||
        a.lote!.fecha_ingreso.localeCompare(b.lote!.fecha_ingreso) ||
        a.id_inventario - b.id_inventario,
    );
  const sugerido = lotes.find(
    (i) =>
      i.bodega?.es_sala_ventas &&
      diasHasta(i.lote!.fecha_vencimiento) > datos.configuracion.holgura_dias,
  );
  async function entregar() {
    if (!sugerido || ocupado) return;
    setOcupado(true);
    const id = sugerido.id_inventario;
    claves.current[id] ??= crypto.randomUUID();
    try {
      await operarStock({
        inventario: id,
        cantidad: 1,
        tipo: "SALIDA",
        operacion: claves.current[id],
      });
      delete claves.current[id];
      toast.success("Entrega registrada. Stock actualizado.");
      await recargar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo registrar la entrega.",
      );
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="panel">
        <h2 className="flex items-center gap-2 font-semibold">
          <Search size={18} />
          Buscar medicamento
        </h2>
        <input
          autoFocus
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo mt-4"
          placeholder="Nombre, principio activo o código"
          aria-label="Buscar medicamento"
        />
        <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
          {productos.map((p) => (
            <button
              key={p.id_producto}
              disabled={ocupado}
              onClick={() => setSeleccion(p.id_producto)}
              className={
                "w-full rounded-xl border p-3 text-left transition " +
                (seleccion === p.id_producto
                  ? "border-acento-borde bg-acento-suave "
                  : "border-borde hover:border-acento-borde ")
              }
            >
              <p className="text-sm font-semibold">{p.nombre}</p>
              <p className="mt-1 text-xs text-muted">
                {p.principio_activo || p.descripcion}
              </p>
              <p className="mt-1 text-xs text-muted">{p.codigo_barras}</p>
            </button>
          ))}
          {!productos.length && (
            <p className="text-sm text-muted">
              No hay coincidencias en el catálogo.
            </p>
          )}
        </div>
      </section>
      <section className="space-y-4 lg:col-span-2">
        {!seleccion ? (
          <div className="panel flex min-h-64 flex-col items-center justify-center text-center">
            <ShieldCheck size={36} className="mb-4 text-acento" />
            <h2 className="font-semibold">Selecciona un medicamento</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Te indicaremos qué lote entregar y dónde encontrarlo, respetando
              el orden FEFO.
            </p>
          </div>
        ) : sugerido ? (
          <article className="panel border-acento-borde! bg-acento-suave/40!">
            <p className="text-xs font-bold uppercase tracking-widest text-acento">
              Entregar primero · FEFO
            </p>
            <h2 className="mt-3 text-xl font-semibold">
              {sugerido.lote?.producto?.nombre}
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight">
              {sugerido.lote?.numero_lote}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <MapPin size={16} />
              {sugerido.bodega?.nombre} · {sugerido.bodega?.ubicacion}
            </p>
            <p className="my-3 text-sm text-muted">
              Vence {sugerido.lote?.fecha_vencimiento} · {sugerido.stock_actual}{" "}
              unidades
            </p>
            <button
              disabled={
                ocupado || soloLectura || datos.configuracion.esquema_original
              }
              onClick={entregar}
              className="boton-primario"
            >
              {ocupado ? "Registrando…" : "Confirmar entrega de 1 unidad"}
            </button>
          </article>
        ) : (
          <div className="panel border-amber-300!">
            <h2 className="font-semibold">
              {datos.configuracion.esquema_original
                ? "Sala de ventas sin clasificar en la base existente"
                : "Sin lotes aptos en sala de ventas"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {datos.configuracion.esquema_original
                ? "Puedes consultar las existencias reales más abajo. No se asignan salas de venta ni se habilitan entregas sin esa clasificación."
                : "Solicita reposición a bodega. Los lotes caducados o dentro de la holgura de dispensación permanecen bloqueados."}
            </p>
          </div>
        )}
        {seleccion && (
          <div className="panel">
            <h3 className="mb-3 font-semibold">Existencias del medicamento</h3>
            {lotes.map((i) => (
              <div
                key={i.id_inventario}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-separador py-3"
              >
                <div>
                  <p className="text-sm font-medium">{i.lote?.numero_lote}</p>
                  <p className="mt-1 text-xs text-muted">
                    {i.bodega?.nombre} · {i.stock_actual} un. ·{" "}
                    {i.lote?.fecha_vencimiento}
                  </p>
                </div>
                {i.estado_semaforo === "VENCIDO" ? (
                  <span className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                    BLOQUEADO POR CADUCIDAD
                  </span>
                ) : (
                  <SemaforoBadge estado={i.estado_semaforo} />
                )}
              </div>
            ))}
            {!lotes.length && (
              <p className="text-sm text-muted">Sin existencias físicas.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
