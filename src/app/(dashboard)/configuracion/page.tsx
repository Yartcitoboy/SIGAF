"use client";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Header } from "@/componentes/layout/header";
import { EstadoDatos } from "@/componentes/ui/estado-datos";
import { TransicionPagina } from "@/componentes/animaciones/transicion-pagina";
import { useConsulta } from "@/lib/hooks/use-consulta";
import {
  obtenerOperacion,
  type DatosOperacion,
} from "@/lib/servicios/operacion";
import {
  guardarConfiguracion,
  guardarFarmacia,
} from "@/lib/servicios/configuracion";
import { guardarFila } from "@/lib/servicios/datos";
import type { Farmacia } from "@/tipos/database";
import { useRol } from "@/context/rol-context";
export default function ConfiguracionPage() {
  const consulta = useConsulta(obtenerOperacion);
  const { soloLectura } = useRol();
  return (
    <TransicionPagina>
      <Header
        titulo="Configuración"
        subtitulo="Política de vencimiento, identidad de la farmacia y ubicaciones oficiales."
      />
      <EstadoDatos {...consulta} />
      {consulta.datos && !consulta.cargando && !consulta.error && (
        <>
          {consulta.datos.configuracion.esquema_original && (
            <p className="panel mb-4 text-sm text-muted">
              La base existente no tiene una tabla de configuración. Se usan los
              umbrales de su esquema original (7 y 30 días) solo para la vista.
              No se ha creado ninguna tabla ni modificado Supabase.
            </p>
          )}
          <fieldset
            className="min-w-0"
            disabled={
              soloLectura || consulta.datos.configuracion.esquema_original
            }
          >
            <Formularios datos={consulta.datos} recargar={consulta.recargar} />
          </fieldset>
        </>
      )}
    </TransicionPagina>
  );
}
function Formularios({
  datos,
  recargar,
}: {
  datos: DatosOperacion;
  recargar: () => Promise<void>;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [empresa, setEmpresa] = useState(datos.farmacias[0]?.id_farmacia || 0);
  const [sucursal, setSucursal] = useState(0);
  const [bodega, setBodega] = useState(0);
  const farmacia = datos.farmacias.find((f) => f.id_farmacia === empresa);
  const s = datos.sucursales.find((s) => s.id_sucursal === sucursal);
  const b = datos.bodegas.find((b) => b.id_bodega === bodega);
  async function ejecutar(accion: () => Promise<void>) {
    setOcupado(true);
    try {
      await accion();
      toast.success("Configuración guardada");
      await recargar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setOcupado(false);
    }
  }
  function umbrales(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void ejecutar(() =>
      guardarConfiguracion({
        id: 1,
        dias_critico: Number(f.get("critico")),
        dias_preventivo: Number(f.get("preventivo")),
        holgura_dias: Number(f.get("holgura")),
      }),
    );
  }
  function identidad(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void ejecutar(async () => {
      let logo = farmacia?.logo_url || null;
      const archivo = f.get("logo") as File;
      if (archivo?.size) {
        if (
          !["image/png", "image/jpeg"].includes(archivo.type) ||
          archivo.size > 250000
        )
          throw new Error("Usa un logo PNG/JPG de hasta 250 KB.");
        logo = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(archivo);
        });
      }
      await guardarFarmacia({
        id_farmacia: empresa,
        razon_social: String(f.get("nombre")),
        rut: String(f.get("rut")),
        direccion: String(f.get("direccion")),
        director_tecnico: String(f.get("director")),
        logo_url: logo,
      } as Farmacia);
    });
  }
  function ubicacion(
    e: FormEvent<HTMLFormElement>,
    tipo: "sucursal" | "bodega",
  ) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void ejecutar(async () => {
      const id = tipo === "sucursal" ? sucursal : bodega;
      await (tipo === "sucursal"
        ? (() => {
            const campos = {
              nombre: String(f.get("nombre")),
              direccion: String(f.get("direccion")),
              id_farmacia: Number(f.get("farmacia")),
            };
            return guardarFila("sucursal", campos, id || undefined);
          })()
        : (() => {
            const campos = {
              nombre: String(f.get("nombre")),
              ubicacion: String(f.get("ubicacion")),
              id_sucursal: Number(f.get("sucursal")),
              es_sala_ventas: f.get("ventas") === "on",
            };
            return guardarFila("bodega", campos, id || undefined);
          })());
    });
  }
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <form onSubmit={umbrales} className="panel space-y-4">
        <h2 className="font-semibold">Semáforo y dispensación</h2>
        <p className="text-xs text-muted">
          Caducado: fecha igual o anterior al día actual en Chile. Verde: por
          encima del umbral preventivo.
        </p>
        <label className="block text-sm">
          Crítico / naranjo: hasta (días)
          <input
            name="critico"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={datos.configuracion.dias_critico}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Preventivo / amarillo: hasta (días)
          <input
            name="preventivo"
            type="number"
            min="2"
            step="1"
            required
            defaultValue={datos.configuracion.dias_preventivo}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Holgura mínima para dispensar (días)
          <input
            name="holgura"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={datos.configuracion.holgura_dias}
            className="campo mt-1"
          />
        </label>
        <button disabled={ocupado} className="boton-primario">
          Guardar política
        </button>
      </form>
      <form
        key={"farmacia" + empresa}
        onSubmit={identidad}
        className="panel space-y-4"
      >
        <h2 className="font-semibold">Identidad y membrete</h2>
        <select
          aria-label="Farmacia a editar"
          value={empresa}
          onChange={(e) => setEmpresa(Number(e.target.value))}
          className="campo"
        >
          <option value="0">Nueva farmacia</option>
          {datos.farmacias.map((f) => (
            <option key={f.id_farmacia} value={f.id_farmacia}>
              {f.razon_social}
            </option>
          ))}
        </select>
        <label className="block text-sm">
          Razón social
          <input
            name="nombre"
            required
            maxLength={150}
            defaultValue={farmacia?.razon_social}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          RUT
          <input
            name="rut"
            required
            maxLength={15}
            defaultValue={farmacia?.rut}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Dirección
          <input
            name="direccion"
            maxLength={200}
            defaultValue={farmacia?.direccion || ""}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Director técnico
          <input
            name="director"
            defaultValue={farmacia?.director_tecnico || ""}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Logo para informes (PNG/JPG, hasta 250 KB)
          <input
            name="logo"
            type="file"
            accept="image/png,image/jpeg"
            className="campo mt-1"
          />
        </label>
        <button disabled={ocupado} className="boton-primario">
          Guardar farmacia
        </button>
      </form>
      <form
        key={"sucursal" + sucursal}
        onSubmit={(e) => ubicacion(e, "sucursal")}
        className="panel space-y-4"
      >
        <h2 className="font-semibold">Sucursales</h2>
        <select
          aria-label="Sucursal a editar"
          value={sucursal}
          onChange={(e) => setSucursal(Number(e.target.value))}
          className="campo"
        >
          <option value="0">Nueva sucursal</option>
          {datos.sucursales.map((s) => (
            <option key={s.id_sucursal} value={s.id_sucursal}>
              {s.nombre}
            </option>
          ))}
        </select>
        <label className="block text-sm">
          Nombre
          <input
            name="nombre"
            required
            maxLength={100}
            defaultValue={s?.nombre}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Dirección
          <input
            name="direccion"
            defaultValue={s?.direccion || ""}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Farmacia
          <select
            name="farmacia"
            required
            defaultValue={s?.id_farmacia || ""}
            className="campo mt-1"
          >
            <option value="">Seleccionar</option>
            {datos.farmacias.map((f) => (
              <option key={f.id_farmacia} value={f.id_farmacia}>
                {f.razon_social}
              </option>
            ))}
          </select>
        </label>
        <button disabled={ocupado} className="boton-primario">
          Guardar sucursal
        </button>
      </form>
      <form
        key={"bodega" + bodega}
        onSubmit={(e) => ubicacion(e, "bodega")}
        className="panel space-y-4"
      >
        <h2 className="font-semibold">Bodegas y estantes</h2>
        <select
          aria-label="Bodega a editar"
          value={bodega}
          onChange={(e) => setBodega(Number(e.target.value))}
          className="campo"
        >
          <option value="0">Nueva ubicación</option>
          {datos.bodegas.map((b) => (
            <option key={b.id_bodega} value={b.id_bodega}>
              {b.nombre}
            </option>
          ))}
        </select>
        <label className="block text-sm">
          Nombre
          <input
            name="nombre"
            required
            maxLength={100}
            defaultValue={b?.nombre}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Pasillo / repisa / refrigerador
          <input
            name="ubicacion"
            required
            maxLength={150}
            defaultValue={b?.ubicacion || ""}
            className="campo mt-1"
          />
        </label>
        <label className="block text-sm">
          Sucursal
          <select
            name="sucursal"
            required
            defaultValue={b?.id_sucursal || ""}
            className="campo mt-1"
          >
            <option value="">Seleccionar</option>
            {datos.sucursales.map((s) => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="ventas"
            type="checkbox"
            defaultChecked={b?.es_sala_ventas}
          />
          Ubicación habilitada para dispensación / sala de ventas
        </label>
        <button disabled={ocupado} className="boton-primario">
          Guardar ubicación
        </button>
      </form>
    </div>
  );
}
