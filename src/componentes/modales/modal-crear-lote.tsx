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
import { fechaChile } from "@/lib/servicios/fechas";
import { leerGS1 } from "@/lib/servicios/gs1";
import { validarVidaUtil } from "@/lib/servicios/isp";

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  productos: Producto[];
  bodegas: Bodega[];
  configuracion: Configuracion;
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
}: Props) {
  const [producto, setProducto] = useState(
    productoInicial ? String(productoInicial) : "",
  );
  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");
  const [escaneo, setEscaneo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operacion = useRef(crypto.randomUUID());
  const ficha = productos.find((p) => p.id_producto === Number(producto));
  function escanear() {
    try {
      if (/^\d{8,14}$/.test(escaneo.trim())) {
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
        setError(null);
        toast.info(
          "Producto identificado. Ingresa el lote y vencimiento del envase.",
        );
        return;
      }
      const datos = leerGS1(escaneo);
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
        costo_unitario: Number(f.get("costo")),
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
      <form onSubmit={guardar} className="space-y-4">
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
            onChange={(e) => setProducto(e.target.value)}
            className="campo mt-1"
          >
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre}
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
              max={fechaChile()}
              required
              defaultValue={fechaChile()}
              className="campo mt-1"
            />
          </label>
          <label className="text-sm">
            Fabricación (opcional)
            <input
              name="fabricacion"
              type="date"
              max={fechaChile()}
              className="campo mt-1"
            />
          </label>
          <label className="text-sm">
            Cantidad
            <input
              name="cantidad"
              type="number"
              min="1"
              step="1"
              required
              className="campo mt-1"
            />
          </label>
        </div>
        <label className="block text-sm">
          Costo unitario (CLP)
          <input
            name="costo"
            type="number"
            min="0"
            step=".01"
            required
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Bodega / ubicación física
          <select name="bodega" required defaultValue="" className="campo mt-1">
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
            estado={calcularSemaforoLote(fecha, configuracion).estado}
            diasRestantes={
              calcularSemaforoLote(fecha, configuracion).diasRestantes
            }
          />
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <button disabled={ocupado} className="boton-primario">
          {ocupado ? "Registrando…" : "Confirmar recepción"}
        </button>
      </form>
    </Dialogo>
  );
}
