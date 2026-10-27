"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, MapPin, Search } from "lucide-react";
import type { DatosOperacion } from "@/lib/servicios/operacion";
import { dispensar } from "@/lib/servicios/dispensacion";
import { planificarDispensacion } from "@/lib/vistas/dispensacion";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import { coincide, fechaVisible } from "@/lib/vistas/presentacion";

export function DashboardAuxiliarView({
  datos,
  recargar,
  filtrarPorUbicacion = false,
}: {
  datos: DatosOperacion;
  recargar: () => Promise<void>;
  filtrarPorUbicacion?: boolean;
}) {
  const [busqueda, setBusqueda] = useState(""),
    [seleccion, setSeleccion] = useState<number | null>(null),
    [ubicacion, setUbicacion] = useState("");
  const [cantidad, setCantidad] = useState(1),
    [ocupado, setOcupado] = useState(false);
  const claves = useRef<Record<number, string>>({});
  const productos = datos.productos.filter((p) =>
    coincide(
      busqueda,
      p.nombre,
      p.codigo_barras,
      p.principio_activo,
      p.registro_isp,
      p.descripcion,
    ),
  );
  const plan = planificarDispensacion(
    datos,
    seleccion,
    filtrarPorUbicacion && ubicacion ? Number(ubicacion) : undefined,
  );
  const pendienteUbicacion = filtrarPorUbicacion && !ubicacion;
  const sugerido = pendienteUbicacion ? undefined : plan.sugerido;
  const lotes = pendienteUbicacion ? [] : plan.lotes;
  const cantidadValida =
    Number.isInteger(cantidad) &&
    cantidad > 0 &&
    Boolean(sugerido && cantidad <= sugerido.stock_actual);
  async function entregar() {
    if (
      !sugerido ||
      ocupado ||
      !cantidadValida ||
      plan.otraUbicacion ||
      pendienteUbicacion
    )
      return;
    setOcupado(true);
    const id = sugerido.id_inventario;
    claves.current[id] ??= crypto.randomUUID();
    try {
      await dispensar({
        inventario: id,
        cantidad,
        operacion: claves.current[id],
      });
      delete claves.current[id];
      toast.success("Entrega registrada en Supabase. Stock actualizado.");
      await recargar();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo registrar la entrega.",
      );
    } finally {
      setOcupado(false);
    }
  }
  const mensajes = {
    ORIGEN_NO_AUTORIZADO: [
      "Ubicación no disponible",
      "Selecciona una ubicación autorizada para tu cuenta.",
    ],
    FECHA_NO_DISPONIBLE: [
      "Revisa las fechas",
      "Hay lotes con fechas incompletas. Corrige los datos antes de dispensar.",
    ],
    SIN_STOCK: ["Sin existencias físicas", "Solicita reposición a bodega."],
    BLOQUEADO_FECHA: [
      "Existencias bloqueadas por fecha u holgura",
      "Los lotes caducados o dentro de la holgura no se pueden entregar.",
    ],
    CLASIFICACION_PENDIENTE: [
      "Sala de ventas sin clasificar",
      "Administración debe clasificar las ubicaciones en Configuración antes de dispensar.",
    ],
    REPOSICION: [
      "Sin lotes aptos en sala de ventas",
      "Solicita reposición a bodega.",
    ],
    OTRA_UBICACION_FEFO: [
      "Prioridad en otra ubicación",
      "Selecciona la ubicación indicada por FEFO.",
    ],
    LISTO: ["Lote disponible", ""],
  };
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
              aria-pressed={seleccion === p.id_producto}
              onClick={() => {
                setSeleccion(p.id_producto);
                setCantidad(1);
              }}
              className={
                "w-full rounded-xl border p-3 text-left transition " +
                (seleccion === p.id_producto
                  ? "border-acento-borde bg-acento-suave"
                  : "border-borde hover:border-acento-borde")
              }
            >
              <p className="text-sm font-semibold">{p.nombre}</p>
              <p className="mt-1 text-xs text-muted">
                {p.principio_activo || p.descripcion}
              </p>
              <p className="mt-1 text-xs text-muted">
                {p.codigo_barras || "Sin GTIN registrado"}
                {p.registro_isp ? ` · ISP ${p.registro_isp}` : ""}
              </p>
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
        {filtrarPorUbicacion && (
          <label className="panel block text-sm">
            Bodega o punto de salida
            <select
              aria-label="Ubicación de dispensación"
              className="campo mt-2"
              value={ubicacion}
              disabled={ocupado}
              onChange={(e) => {
                setUbicacion(e.target.value);
                setCantidad(1);
              }}
            >
              <option value="">Selecciona una ubicación autorizada</option>
              {datos.bodegas.map((b) => (
                <option key={b.id_bodega} value={b.id_bodega}>
                  {b.nombre}
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs text-muted">
              FEFO conserva la prioridad de lotes entre las salas autorizadas de
              la misma sucursal.
            </span>
          </label>
        )}
        {!seleccion ? (
          <div className="panel flex min-h-64 flex-col items-center justify-center text-center">
            <ShieldCheck size={36} className="mb-4 text-acento" />
            <h2 className="font-semibold">Selecciona un medicamento</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Te indicaremos el lote que corresponde entregar y su ubicación.
            </p>
          </div>
        ) : pendienteUbicacion ? (
          <div className="panel">
            <h2 className="font-semibold">
              Selecciona una ubicación de salida
            </h2>
          </div>
        ) : sugerido ? (
          <article className="panel border-acento-borde! bg-acento-suave/40!">
            <p className="text-xs font-bold uppercase tracking-widest text-acento">
              Entregar primero · FEFO
            </p>
            <h2 className="mt-3 text-xl font-semibold">
              {sugerido.lote?.producto?.nombre}
            </h2>
            <p className="mt-2 text-2xl font-bold">
              {sugerido.lote?.numero_lote}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <MapPin size={16} />
              {sugerido.bodega?.nombre} · {sugerido.bodega?.ubicacion}
            </p>
            <p className="my-3 text-sm text-muted">
              Vence {fechaVisible(sugerido.lote?.fecha_vencimiento)} ·{" "}
              {sugerido.stock_actual} unidades
            </p>
            <p className="mb-3 text-sm">
              Presentación:{" "}
              {sugerido.lote?.producto?.unidad_medida || "Sin especificar"}. Sin
              conversión automática.
            </p>
            {plan.otraUbicacion && (
              <div
                role="alert"
                className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
              >
                El lote prioritario está en otra sala de la misma sucursal.
                <button
                  type="button"
                  className="boton-secundario mt-3"
                  onClick={() => {
                    setUbicacion(String(sugerido.id_bodega));
                    setCantidad(1);
                  }}
                >
                  Usar ubicación indicada por FEFO
                </button>
              </div>
            )}
            <label className="mb-3 block text-sm">
              Cantidad a entregar
              <input
                type="number"
                min="1"
                max={sugerido.stock_actual}
                step="1"
                className="campo mt-1 max-w-40"
                value={cantidad || ""}
                disabled={ocupado}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>
            <p className="mb-3 text-sm text-muted">
              Saldo previsto del lote:{" "}
              {cantidadValida
                ? sugerido.stock_actual - cantidad
                : "Revisa la cantidad"}
            </p>
            <button
              className="boton-primario"
              disabled={ocupado || plan.otraUbicacion || !cantidadValida}
              onClick={entregar}
            >
              {ocupado ? "Registrando…" : `Confirmar entrega de ${cantidad}`}
            </button>
          </article>
        ) : (
          <div className="panel border-amber-300!">
            <h2 className="font-semibold">{mensajes[plan.estado][0]}</h2>
            <p className="mt-2 text-sm text-muted">
              {mensajes[plan.estado][1]}
            </p>
          </div>
        )}
        {seleccion && !pendienteUbicacion && (
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
                    {fechaVisible(i.lote?.fecha_vencimiento)}
                  </p>
                </div>
                <SemaforoBadge estado={i.estado_semaforo} />
              </div>
            ))}
            {!lotes.length && (
              <p className="text-sm text-muted">
                Sin existencias físicas en esta ubicación.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
