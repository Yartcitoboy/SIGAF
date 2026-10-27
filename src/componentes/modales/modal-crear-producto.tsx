"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Dialogo } from "@/componentes/ui/dialogo";
import { guardarProducto } from "@/lib/servicios/productos";
import { fichaISP, validarFormatoRegistroISP } from "@/lib/servicios/isp";
import { gtinValido } from "@/lib/vistas/presentacion";
import { useRol } from "@/context/rol-context";
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
    <Formulario key={props.producto?.id_producto ?? "nuevo"} {...props} />
  ) : null;
}
function Formulario({
  alCerrar,
  alGuardarExitoso,
  categorias,
  producto,
}: Props) {
  const { perfilActual } = useRol();
  const opciones = perfilActual.sistema.opciones;
  const presentaciones = opciones.filter((o) => o.tipo === "presentacion");
  const vidas = opciones.filter((o) => o.tipo === "vida_util");
  const [unidad, setUnidad] = useState(
    producto?.unidad_medida
      ? presentaciones.some((o) => o.valor === producto.unidad_medida)
        ? producto.unidad_medida
        : "otro"
      : "",
  );
  const [meses, setMeses] = useState(
    producto?.vida_util_meses
      ? vidas.some((o) => o.valor === String(producto.vida_util_meses))
        ? String(producto.vida_util_meses)
        : "otro"
      : "",
  );
  const [registro, setRegistro] = useState(producto?.registro_isp ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get("nombre") ?? "").trim(),
      codigo = String(f.get("codigo") ?? "").trim();
    const presentacion = String(f.get("unidad") ?? "").trim(),
      vida = String(f.get("meses") ?? "");
    if (!nombre || !Number(f.get("categoria")) || !presentacion) {
      setError("Indica nombre, categoría y presentación.");
      return;
    }
    if (
      /^\d+$/.test(codigo) &&
      codigo !== producto?.codigo_barras &&
      !gtinValido(codigo)
    ) {
      setError(
        "El código numérico no tiene longitud o dígito de control GTIN válido. Comprueba el envase.",
      );
      return;
    }
    if (registro && !validarFormatoRegistroISP(registro)) {
      setError("Revisa el formato del registro ISP, por ejemplo F-12345/20.");
      return;
    }
    if (
      vida &&
      (!Number.isInteger(Number(vida)) ||
        Number(vida) < 1 ||
        Number(vida) > 1200)
    ) {
      setError(
        "La vida útil debe ser un número entero de meses entre 1 y 1.200.",
      );
      return;
    }
    setOcupado(true);
    setError(null);
    try {
      await guardarProducto(
        {
          nombre,
          codigo_barras: codigo || null,
          unidad_medida: presentacion,
          id_categoria: Number(f.get("categoria")),
          descripcion: String(f.get("descripcion") ?? "").trim() || null,
          principio_activo: String(f.get("principio") ?? "").trim() || null,
          registro_isp: registro.trim().toUpperCase() || null,
          vida_util_meses: vida ? Number(vida) : null,
        },
        producto?.id_producto,
      );
      toast.success("Ficha guardada en Supabase");
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
      <form onSubmit={guardar} aria-busy={ocupado}>
        <fieldset disabled={ocupado} className="min-w-0 space-y-4">
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
              defaultValue={producto?.principio_activo ?? ""}
              className="campo mt-1"
            />
          </label>
          <label className="block text-sm">
            Categoría
            <select
              name="categoria"
              required
              defaultValue={producto?.id_categoria ?? ""}
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
          <label className="block text-sm">
            Presentación / unidad de conteo
            <select
              required
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="campo mt-1"
            >
              <option value="">Selecciona una presentación</option>
              {presentaciones.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
              <option value="otro">Otro: ingresar manualmente…</option>
            </select>
          </label>
          {unidad === "otro" ? (
            <label className="block text-sm">
              Presentación personalizada
              <input
                name="unidad"
                required
                maxLength={30}
                defaultValue={producto?.unidad_medida ?? ""}
                placeholder="Ej.: Caja x 20 comprimidos"
                className="campo mt-1"
              />
            </label>
          ) : (
            <input type="hidden" name="unidad" value={unidad} />
          )}
          <p className="text-xs text-muted">
            El stock cuenta estas presentaciones. No convierte cajas a
            comprimidos ni mililitros.
          </p>
          <label className="block text-sm">
            Código del envase / GTIN
            <input
              name="codigo"
              maxLength={50}
              defaultValue={producto?.codigo_barras ?? ""}
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
            Vida útil autorizada
            <select
              value={meses}
              onChange={(e) => setMeses(e.target.value)}
              className="campo mt-1"
            >
              <option value="">No informada / no aplica (NULL)</option>
              {vidas.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
              <option value="otro">Otro plazo en meses…</option>
            </select>
          </label>
          {meses === "otro" ? (
            <label className="block text-sm">
              Vida útil personalizada (meses)
              <input
                type="number"
                name="meses"
                min="1"
                max="1200"
                step="1"
                required
                defaultValue={producto?.vida_util_meses ?? ""}
                className="campo mt-1"
              />
            </label>
          ) : (
            <input type="hidden" name="meses" value={meses} />
          )}
          <p className="text-xs text-muted">
            Transcribe solo el plazo confirmado por el fabricante o ISP. NULL no
            crea un vencimiento: los medicamentos requieren la fecha del envase
            en cada lote.
          </p>
          <label className="block text-sm">
            Descripción / observaciones
            <textarea
              name="descripcion"
              maxLength={250}
              defaultValue={producto?.descripcion ?? ""}
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
        </fieldset>
      </form>
    </Dialogo>
  );
}
