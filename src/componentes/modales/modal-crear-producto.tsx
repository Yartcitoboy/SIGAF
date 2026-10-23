"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialogo } from "@/componentes/ui/dialogo";
import { guardarProducto } from "@/lib/servicios/productos";
import { fichaISP, validarFormatoRegistroISP } from "@/lib/servicios/isp";
import type { Categoria, Producto } from "@/tipos/database";
interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso: () => void;
  categorias: Categoria[];
  producto?: Producto;
}
export function ModalCrearProducto(props: Props) {
  return props.abierto ? (
    <Formulario key={props.producto?.id_producto || "nuevo"} {...props} />
  ) : null;
}
function Formulario({
  alCerrar,
  alGuardarExitoso,
  categorias,
  producto,
}: Props) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registro, setRegistro] = useState(producto?.registro_isp || "");
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (registro && !validarFormatoRegistroISP(registro)) {
      setError("Revisa el formato del registro ISP, por ejemplo F-12345/20.");
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      await guardarProducto(
        {
          nombre: String(f.get("nombre")),
          codigo_barras: String(f.get("codigo")) || null,
          unidad_medida: String(f.get("unidad")) || null,
          id_categoria: Number(f.get("categoria")),
          descripcion: String(f.get("descripcion")) || null,
          principio_activo: String(f.get("principio")) || null,
          registro_isp: registro.trim().toUpperCase() || null,
          vida_util_meses: f.get("meses") ? Number(f.get("meses")) : null,
        },
        producto?.id_producto,
      );
      toast.success("Ficha de producto guardada");
      alGuardarExitoso();
      alCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <Dialogo
      titulo={producto ? "Editar medicamento" : "Nuevo medicamento"}
      cerrar={alCerrar}
      ocupado={ocupado}
    >
      <form onSubmit={guardar} className="space-y-4">
        <label className="block text-sm">
          Nombre comercial
          <input
            name="nombre"
            required
            maxLength={150}
            defaultValue={producto?.nombre}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Principio activo
          <input
            name="principio"
            defaultValue={producto?.principio_activo || ""}
            className="campo mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Categoría
            <select
              name="categoria"
              required
              defaultValue={producto?.id_categoria || ""}
              className="campo mt-1"
            >
              <option value="">Seleccionar</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Presentación
            <input
              name="unidad"
              maxLength={30}
              defaultValue={producto?.unidad_medida || ""}
              className="campo mt-1"
            />
          </label>
        </div>
        <label className="block text-sm">
          Código del envase / GTIN
          <input
            name="codigo"
            maxLength={50}
            defaultValue={producto?.codigo_barras || ""}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Registro sanitario ISP
          <input
            value={registro}
            onChange={(e) => setRegistro(e.target.value)}
            placeholder="F-12345/20"
            className="campo mt-1"
          />
        </label>
        {validarFormatoRegistroISP(registro) && (
          <a
            href={fichaISP(registro)}
            target="_blank"
            rel="noreferrer"
            className="block text-xs font-medium text-acento"
          >
            Consultar ficha en el ISP ↗
          </a>
        )}
        <label className="block text-sm">
          Vida útil autorizada (meses)
          <input
            name="meses"
            type="number"
            min="1"
            step="1"
            defaultValue={producto?.vida_util_meses || ""}
            className="campo mt-1"
          />
          <span className="text-xs text-muted">
            Transcribe el dato confirmado en la resolución o ficha ISP.
          </span>
        </label>
        <label className="block text-sm">
          Descripción / observaciones
          <textarea
            name="descripcion"
            maxLength={250}
            defaultValue={producto?.descripcion || ""}
            className="campo mt-1"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <button className="boton-primario" disabled={ocupado}>
          {ocupado ? "Guardando…" : "Guardar ficha"}
        </button>
      </form>
    </Dialogo>
  );
}
