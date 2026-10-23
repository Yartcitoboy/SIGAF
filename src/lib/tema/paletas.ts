import type { RolPerfil } from "@/tipos/database";

export type ModoTema = "claro" | "oscuro";
export const PALETAS: Record<RolPerfil, readonly string[]> = {
  ADMIN: ["#000020", "#171a4a", "#2f2c79", "#5dc1b9", "#9ce0db"],
  BODEGUERO: ["#b7e3ff", "#7cc8ff", "#2f7fc1", "#f8fbff", "#d7e2ea"],
  AUXILIAR: ["#003A40", "#1B806D", "#05868E", "#44499C", "#E5E1E6"],
};

// Los tonos derivados dan profundidad sin perder la identidad de los cinco colores.
export interface ColoresTema {
  lienzo: string;
  superficie: string;
  sutil: string;
  elevado: string;
  tinta: string;
  muted: string;
  borde: string;
  separador: string;
  accion: string;
  "accion-hover": string;
  "sobre-accion": string;
  acento: string;
  "acento-suave": string;
  "acento-borde": string;
  grafico: string;
  barra: string;
  "barra-tinta": string;
  "barra-muted": string;
  "barra-borde": string;
  "barra-hover": string;
  "barra-activa": string;
  "barra-activa-tinta": string;
}
export const TEMAS: Record<RolPerfil, Record<ModoTema, ColoresTema>> = {
  ADMIN: {
    claro: {
      lienzo: "#f2f4fb",
      superficie: "#ffffff",
      sutil: "#f0f1f9",
      elevado: "#e6e9f5",
      tinta: "#171a4a",
      muted: "#555773",
      borde: "#ccd1e4",
      separador: "#e2e5f0",
      accion: "#2f2c79",
      "accion-hover": "#171a4a",
      "sobre-accion": "#ffffff",
      acento: "#2f2c79",
      "acento-suave": "#e4f4f2",
      "acento-borde": "#5dc1b9",
      grafico: "#2f2c79",
      barra: "#171a4a",
      "barra-tinta": "#f2f4fb",
      "barra-muted": "#bdc5e4",
      "barra-borde": "#37396b",
      "barra-hover": "#2f2c79",
      "barra-activa": "#5dc1b9",
      "barra-activa-tinta": "#000020",
    },
    oscuro: {
      lienzo: "#000020",
      superficie: "#171a4a",
      sutil: "#11143b",
      elevado: "#252956",
      tinta: "#f2f4fb",
      muted: "#bdc5e4",
      borde: "#444773",
      separador: "#30345c",
      accion: "#5dc1b9",
      "accion-hover": "#9ce0db",
      "sobre-accion": "#000020",
      acento: "#9ce0db",
      "acento-suave": "#202d4f",
      "acento-borde": "#5dc1b9",
      grafico: "#5dc1b9",
      barra: "#000020",
      "barra-tinta": "#f2f4fb",
      "barra-muted": "#bdc5e4",
      "barra-borde": "#2f2c79",
      "barra-hover": "#171a4a",
      "barra-activa": "#2f2c79",
      "barra-activa-tinta": "#9ce0db",
    },
  },
  BODEGUERO: {
    claro: {
      lienzo: "#f8fbff",
      superficie: "#ffffff",
      sutil: "#f0f6fa",
      elevado: "#d7e2ea",
      tinta: "#0e2a47",
      muted: "#4d6b82",
      borde: "#d7e2ea",
      separador: "#e5eff5",
      accion: "#2f7fc1",
      "accion-hover": "#236399",
      "sobre-accion": "#ffffff",
      acento: "#2f7fc1",
      "acento-suave": "#b7e3ff",
      "acento-borde": "#7cc8ff",
      grafico: "#2f7fc1",
      barra: "#102e48",
      "barra-tinta": "#f8fbff",
      "barra-muted": "#b7e3ff",
      "barra-borde": "#244d70",
      "barra-hover": "#1c4366",
      "barra-activa": "#7cc8ff",
      "barra-activa-tinta": "#0e2a47",
    },
    oscuro: {
      lienzo: "#0a1926",
      superficie: "#112b40",
      sutil: "#0d2335",
      elevado: "#1a3c57",
      tinta: "#f8fbff",
      muted: "#b7e3ff",
      borde: "#2a4f6e",
      separador: "#1c3d59",
      accion: "#7cc8ff",
      "accion-hover": "#b7e3ff",
      "sobre-accion": "#0a1926",
      acento: "#7cc8ff",
      "acento-suave": "#183b57",
      "acento-borde": "#2f7fc1",
      grafico: "#7cc8ff",
      barra: "#071421",
      "barra-tinta": "#f8fbff",
      "barra-muted": "#b7e3ff",
      "barra-borde": "#183b57",
      "barra-hover": "#112b40",
      "barra-activa": "#2f7fc1",
      "barra-activa-tinta": "#f8fbff",
    },
  },
  AUXILIAR: {
    claro: {
      lienzo: "#f6f5f8",
      superficie: "#ffffff",
      sutil: "#edebee",
      elevado: "#E5E1E6",
      tinta: "#003A40",
      muted: "#4e6568",
      borde: "#d8d4dc",
      separador: "#e7e4ea",
      accion: "#1B806D",
      "accion-hover": "#003A40",
      "sobre-accion": "#ffffff",
      acento: "#05868E",
      "acento-suave": "#e4f3f4",
      "acento-borde": "#05868E",
      grafico: "#1B806D",
      barra: "#003A40",
      "barra-tinta": "#f6f5f8",
      "barra-muted": "#8ec4bd",
      "barra-borde": "#0a4d55",
      "barra-hover": "#07484f",
      "barra-activa": "#1B806D",
      "barra-activa-tinta": "#ffffff",
    },
    oscuro: {
      lienzo: "#001e22",
      superficie: "#003A40",
      sutil: "#00282d",
      elevado: "#074850",
      tinta: "#f6f5f8",
      muted: "#8ec4bd",
      borde: "#12545d",
      separador: "#09434b",
      accion: "#05868E",
      "accion-hover": "#1B806D",
      "sobre-accion": "#ffffff",
      acento: "#05868E",
      "acento-suave": "#032e35",
      "acento-borde": "#05868E",
      grafico: "#05868E",
      barra: "#001a1d",
      "barra-tinta": "#f6f5f8",
      "barra-muted": "#8ec4bd",
      "barra-borde": "#09434b",
      "barra-hover": "#003036",
      "barra-activa": "#44499C",
      "barra-activa-tinta": "#ffffff",
    },
  },
};

export function nombreCookieTema(rol: RolPerfil) {
  return `sigaf_tema_${rol.toLowerCase()}`;
}
export function modoValido(valor?: string): ModoTema {
  return valor === "oscuro" ? "oscuro" : "claro";
}
export function alternarModo(modo: ModoTema): ModoTema {
  return modo === "claro" ? "oscuro" : "claro";
}
export function variablesTema(rol: RolPerfil, modo: ModoTema) {
  return Object.fromEntries([
    ...Object.entries(TEMAS[rol][modo]).map(([clave, valor]) => [
      `--${clave}`,
      valor,
    ]),
    ...PALETAS[rol].map((color, i) => [`--paleta-${i + 1}`, color]),
  ]);
}
