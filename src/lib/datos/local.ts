import { PGlite, types, type QueryOptions } from "@electric-sql/pglite";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { COLUMNAS_USUARIO, TABLAS, validarCampos } from "./contrato";
import type { ComandoDatos } from "./contrato";

const migraciones = [
  "001_initial_schema.sql",
  "002_operacion_segura.sql",
  "003_resumenes_correo.sql",
  "004_proteger_administracion.sql",
];

// La instancia se comparte entre peticiones y recargas de desarrollo. Ninguna URL remota.
const globalLocal = globalThis as typeof globalThis & {
  sigafDbLocal?: Promise<PGlite>;
};
// Mismo contrato JSON que PostgREST: DATE sin hora; costos numéricos, no cadenas.
const formatoCliente: QueryOptions = {
  parsers: {
    [types.DATE]: (valor) => valor,
    [types.TIMESTAMP]: (valor) => valor.replace(" ", "T"),
    [types.TIMESTAMPTZ]: (valor) => new Date(valor).toISOString(),
    [types.NUMERIC]: (valor) => Number(valor),
  },
};
export async function inicializarBaseLocal(db: PGlite, raiz = process.cwd()) {
  await db.exec(`CREATE TABLE IF NOT EXISTS sigaf_local_migraciones(nombre text PRIMARY KEY);
    DO $$ BEGIN
      IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      END IF;
    END $$;
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth,public TO authenticated,anon,service_role;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated,anon,service_role;`);
  for (const nombre of [...migraciones, "datos-locales-v1"]) {
    if (
      (
        await db.query(
          "SELECT 1 FROM sigaf_local_migraciones WHERE nombre=$1",
          [nombre],
        )
      ).rows.length
    )
      continue;
    const archivo =
      nombre === "datos-locales-v1"
        ? join(raiz, "supabase", "local", "datos-ejemplo.sql")
        : join(raiz, "supabase", "migrations", nombre);
    const sql = (await readFile(archivo, "utf8")).replace(
      /^\s*(BEGIN|COMMIT);\s*$/gm,
      "",
    );
    await db.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query(
        "INSERT INTO sigaf_local_migraciones(nombre) VALUES ($1)",
        [nombre],
      );
    });
  }
  return db;
}
export function obtenerBaseLocal() {
  if (process.env.NODE_ENV !== "development")
    throw new Error("La base local solo está disponible en desarrollo.");
  return (globalLocal.sigafDbLocal ??= (async () => {
    const carpeta = join(process.cwd(), ".sigaf-local");
    await mkdir(carpeta, { recursive: true });
    const db = new PGlite(join(carpeta, "postgres"));
    try {
      return await inicializarBaseLocal(db);
    } catch (error) {
      await db.close().catch(() => undefined);
      throw error;
    }
  })().catch((error) => {
    globalLocal.sigafDbLocal = undefined;
    throw error;
  }));
}

export async function ejecutarLocal(
  db: PGlite,
  actor: string,
  comando: ComandoDatos,
) {
  return db.transaction(async (tx) => {
    await tx.exec("SET LOCAL ROLE authenticated");
    await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [
      actor,
    ]);
    const activo = await tx.query<{ rol: string | null }>(
      "SELECT rol_actual() AS rol",
    );
    if (!activo.rows[0]?.rol) throw new Error("La cuenta local está inactiva.");
    if (comando.accion === "leer") {
      const tabla = comando.tabla;
      const columnas = tabla === "usuario" ? COLUMNAS_USUARIO : "*";
      const orden = [
        "notificacion",
        "movimiento_inventario",
        "merma",
        "reporte",
      ].includes(tabla)
        ? "DESC"
        : "ASC";
      return (
        await tx.query(
          `SELECT ${columnas} FROM public.${tabla} ORDER BY ${TABLAS[tabla]} ${orden}`,
          [],
          formatoCliente,
        )
      ).rows;
    }
    if (comando.accion === "guardar") {
      validarCampos(comando);
      const columnas = Object.keys(comando.campos);
      const valores = Object.values(comando.campos);
      const sql = comando.id
        ? `UPDATE public.${comando.tabla} SET ${columnas.map((c, i) => `${c}=$${i + 1}`).join(",")} WHERE ${TABLAS[comando.tabla]}=$${valores.length + 1} RETURNING *`
        : `INSERT INTO public.${comando.tabla} (${columnas.join(",")}) VALUES (${valores.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`;
      const resultado = await tx.query(
        sql,
        comando.id ? [...valores, comando.id] : valores,
        formatoCliente,
      );
      if (!resultado.rows.length)
        throw new Error("Registro no encontrado o sin permiso de escritura.");
      return resultado.rows;
    }
    if (comando.accion === "recibir")
      return (
        await tx.query("SELECT recibir_lote($1::jsonb) AS id", [
          JSON.stringify(comando.datos),
        ])
      ).rows[0];
    const d = comando.datos;
    return (
      await tx.query("SELECT operar_stock($1,$2,$3,$4,$5,$6) AS id", [
        d.inventario,
        d.cantidad,
        d.tipo,
        d.operacion,
        d.motivo ?? null,
        d.destino ?? null,
      ])
    ).rows[0];
  });
}
