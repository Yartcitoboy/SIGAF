"use client";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialogo } from "@/componentes/ui/dialogo";
import { SemaforoBadge } from "@/componentes/ui/semaforo-badge";
import type { Producto, Bodega, Configuracion } from "@/tipos/database";
import {
  crearLoteConInventario,
  calcularSemaforoLote,
} from "@/lib/servicios/lotes";
import { SelectorCantidad } from "@/componentes/ui/selector-cantidad";
import { formatearMontoCLP, leerMontoCLP } from "@/lib/vistas/formularios";
import { leerGS1 } from "@/lib/servicios/gs1";
import { validarVidaUtil } from "@/lib/servicios/isp";
import { gtinValido } from "@/lib/vistas/presentacion";
interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  productos: Producto[];
  bodegas: Bodega[];
  configuracion: Configuracion;
  hoy: string;
  productoInicial?: number;
}
export function ModalCrearLote(props: Props) {
  return props.abierto ? <FormularioLote {...props} /> : null;
}
function FormularioLote({
  alCerrar,
  alGuardarExitoso,
  productos,
  bodegas,
  configuracion,
  productoInicial,
  hoy,
}: Props) {
  const [costo, setCosto] = useState("");
  const [producto, setProducto] = useState(
    productoInicial ? String(productoInicial) : "",
  );
  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");
  const [escaneo, setEscaneo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fabricacion, setFabricacion] = useState("");
  const operacion = useRef(crypto.randomUUID());
  const ficha = productos.find((p) => p.id_producto === Number(producto));
  function escanear() {
    try {
      if (/^\d{8,14}$/.test(escaneo.trim())) {
        if (!gtinValido(escaneo.trim()))
          throw new Error(
            "El dígito de control o la longitud del código no es válido. Revisa el envase o ingresa los datos manualmente.",
          );
        const encontrado = productos.find(
          (p) =>
            p.codigo_barras?.padStart(14, "0") ===
            escaneo.trim().padStart(14, "0"),
        );
        if (!encontrado)
          throw new Error("El código no está registrado en el catálogo.");
        setProducto(String(encontrado.id_producto));
        setLote("");
        setFecha("");
        setFabricacion("");
        setError(null);
        toast.info(
          "Producto identificado. Ingresa el lote y vencimiento del envase.",
        );
        return;
      }
      const datos = leerGS1(escaneo);
      if (!datos.gtin)
        throw new Error(
          "El escaneo no identifica el producto. No se aplicó al medicamento anterior; ingresa los datos manualmente.",
        );
      if (datos.gtin) {
        const encontrado = productos.find(
          (p) => p.codigo_barras?.padStart(14, "0") === datos.gtin,
        );
        if (!encontrado)
          throw new Error("El código no está registrado en el catálogo.");
        setProducto(String(encontrado.id_producto));
      }
      setLote(datos.lote || "");
      setFecha(datos.vencimiento || "");
      setFabricacion("");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el código.");
    }
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const fabricacion = String(f.get("fabricacion") || "");
    if (!ficha || !lote.trim() || !fecha || fecha <= hoy) {
      setError(
        "Selecciona medicamento y lote. El vencimiento debe ser posterior a hoy.",
      );
      return;
    }
    if (!ficha.unidad_medida?.trim()) {
      setError(
        "Completa la presentación / unidad de conteo en la ficha del producto antes de recibir stock.",
      );
      return;
    }
    if (fabricacion && fabricacion > String(f.get("ingreso"))) {
      setError("La fabricación no puede ser posterior al ingreso.");
      return;
    }
    if (
      !Number.isInteger(Number(f.get("cantidad"))) ||
      Number(f.get("cantidad")) < 1 ||
      !Number.isFinite(leerMontoCLP(costo)) ||
      leerMontoCLP(costo) < 0 ||
      leerMontoCLP(costo) > 999999999999.99
    ) {
      setError("Revisa cantidad entera positiva y costo no negativo.");
      return;
    }
    if (
      fabricacion &&
      ficha?.vida_util_meses &&
      !validarVidaUtil(fabricacion, fecha, ficha.vida_util_meses)
    ) {
      setError(
        "La fecha de vencimiento excede la vida útil registrada. Revisa la ficha ISP.",
      );
      return;
    }
    setOcupado(true);
    try {
      await crearLoteConInventario({
        id_producto: Number(producto),
        numero_lote: lote,
        fecha_vencimiento: fecha,
        fecha_ingreso: String(f.get("ingreso")),
        id_bodega: Number(f.get("bodega")),
        stock_inicial: Number(f.get("cantidad")),
        costo_unitario: leerMontoCLP(costo),
        fecha_fabricacion: fabricacion || undefined,
        operacion: operacion.current,
      });
      toast.success("Recepción registrada con trazabilidad");
      alGuardarExitoso();
      alCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo recibir el lote.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <Dialogo titulo="Recepción de lote" cerrar={alCerrar} ocupado={ocupado}>
      <form onSubmit={guardar} aria-busy={ocupado}>
        <fieldset disabled={ocupado} className="min-w-0 space-y-4">
          <div className="rounded-xl bg-acento-suave p-3">
            <label className="text-xs font-semibold">
              Escanear GS1 DataMatrix
              <input
                autoFocus
                value={escaneo}
                onChange={(e) => setEscaneo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    escanear();
                  }
                }}
                className="campo mt-2"
                placeholder="Escanea el código o pega su contenido"
              />
            </label>
            <button
              type="button"
              onClick={escanear}
              className="mt-2 text-xs font-semibold text-acento"
            >
              Completar desde escaneo →
            </button>
          </div>
          <label className="block text-sm">
            Medicamento
            <select
              required
              value={producto}
              aria-label="Medicamento"
              onChange={(e) => {
                setProducto(e.target.value);
                setLote("");
                setFecha("");
                setEscaneo("");
                setFabricacion("");
                setError(null);
              }}
              className="campo mt-1"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre}
                  {p.registro_isp ? ` · ISP ${p.registro_isp}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Lote del fabricante
            <input
              required
              maxLength={50}
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              className="campo mt-1"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Vencimiento
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="campo mt-1"
              />
            </label>
            <label className="text-sm">
              Fecha de ingreso
              <input
                name="ingreso"
                type="date"
                max={hoy}
                required
                defaultValue={hoy}
                className="campo mt-1"
              />
            </label>
            <label className="text-sm">
              Fabricación (opcional)
              <input
                name="fabricacion"
                type="date"
                max={hoy}
                value={fabricacion}
                onChange={(e) => setFabricacion(e.target.value)}
                className="campo mt-1"
              />
            </label>
            <SelectorCantidad />
          </div>
          <label className="block text-sm">
            Costo unitario (CLP)
            <input
              name="costo"
              type="text"
              inputMode="decimal"
              value={costo}
              onChange={(e) => setCosto(formatearMontoCLP(e.target.value))}
              maxLength={18}
              placeholder="Ej.: 1.000 o 1.000.000"
              required
              className="campo mt-1"
            />
          </label>
          <label className="block text-sm">
            Bodega / ubicación física
            <select
              name="bodega"
              aria-label="Bodega / ubicación física"
              required
              defaultValue=""
              className="campo mt-1"
            >
              <option value="">Selecciona una ubicación oficial</option>
              {bodegas.map((b) => (
                <option key={b.id_bodega} value={b.id_bodega}>
                  {b.nombre} · {b.ubicacion}
                </option>
              ))}
            </select>
          </label>
          {fecha && (
            <SemaforoBadge
              estado={calcularSemaforoLote(fecha, configuracion, hoy).estado}
              diasRestantes={
                calcularSemaforoLote(fecha, configuracion, hoy).diasRestantes
              }
            />
          )}
          {ficha && (
            <p className="rounded-xl bg-sutil p-3 text-sm">
              <strong>{ficha.nombre}</strong>
              <br />
              Presentación: {ficha.unidad_medida || "Sin especificar"}. Confirma
              que la cantidad corresponda a esta presentación; no se realizan
              conversiones.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <button disabled={ocupado} className="boton-primario">
            {ocupado ? "Registrando…" : "Confirmar recepción"}
          </button>
        </fieldset>
      </form>
    </Dialogo>
  );
}
