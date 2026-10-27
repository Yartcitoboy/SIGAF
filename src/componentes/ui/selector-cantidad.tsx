"use client";
import { useState } from "react";
import { useRol } from "@/context/rol-context";
export function SelectorCantidad({
  nombre = "cantidad",
  etiqueta = "Cantidad",
}: {
  nombre?: string;
  etiqueta?: string;
}) {
  const { perfilActual } = useRol();
  const [valor, setValor] = useState("");
  const opciones = perfilActual.sistema.opciones.filter(
    (o) => o.tipo === "cantidad",
  );
  return (
    <div className="text-sm">
      <label className="block">
        {etiqueta}
        <select
          className="campo mt-1"
          value={valor}
          required
          onChange={(e) => setValor(e.target.value)}
        >
          <option value="">Selecciona una cantidad</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
          <option value="otro">Otra cantidad…</option>
        </select>
      </label>
      {valor === "otro" ? (
        <label className="mt-2 block">
          Cantidad personalizada
          <input
            name={nombre}
            type="number"
            min="1"
            max="2147483647"
            step="1"
            required
            className="campo mt-1"
          />
        </label>
      ) : (
        <input type="hidden" name={nombre} value={valor} />
      )}
    </div>
  );
}
