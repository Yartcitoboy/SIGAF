# Supabase de SIGAF

La aplicación utiliza exclusivamente el proyecto Supabase configurado. Ya no hay base embebida, datos mock, semillas demo, cuentas temporales ni configuración de reemplazo.

- `migrations/001_initial_schema.sql`: esquema inicial, solo para una base nueva.
- `migrations/002_operacion_segura.sql`: operaciones atómicas, configuración y RLS.
- `migrations/003_resumenes_correo.sql`: cola de resúmenes.
- `migrations/004_proteger_administracion.sql`: protecciones administrativas.
- `migrations/005_contexto_y_preferencias.sql`: fecha/hora de PostgreSQL, opciones de formularios y tema por usuario.
- `migrations/006_procedencia_catalogo_isp.sql`: procedencia del catálogo oficial.
- `migrations/20261027065931_seguridad_cuentas_reales.sql`: helpers privados, alertas para cuentas reales, índices y fechas de Chile.
- `migrations/20261027072035_optimizar_politicas_sesion.sql`: optimiza la evaluación de Auth en RLS sin cambiar permisos.
- `migrations/20261027205509_proteger_ultimo_admin_real.sql`: protege al último Admin con cuenta Auth real, sin contar autores históricos como respaldo.
- `functions/sigaf-usuarios/`: administración de cuentas, solo Admin activo, desplegada con autorización expresa; claves administradas por Supabase.
- `importaciones/2026-10-27_catalogo_isp.sql`: 198 registros obtenidos del ISP; no genera lotes ni stock.
- `importaciones/2026-10-27_procedencia_isp.json`: fuente y huellas de integridad.

Estado real al 27-10-2026: migraciones 002–006 y las tres migraciones posteriores aplicadas en `nkqxhpiagkcfvxbytarn`. Catálogo ISP importado: 198 añadidos, 214 productos totales. Se conservaron los 19 lotes y 2.275 unidades, sin crear stock de demostración. Función Usuarios versión 1 activa. Se generaron 14 alertas internas; no se enviaron correos.

La correspondencia entre los archivos locales y las versiones remotas está en `aplicacion-remota-2026-10-27.json`. No ejecutar 001 sobre esta base ni repetir migraciones. No usar `db push` sin conciliar primero el historial: los archivos heredados y las aplicaciones por MCP utilizan identificadores distintos.

Ver [Puesta en marcha](../docs/puesta-en-marcha.md) y [Cambios actuales](../docs/cambios-base-real-e-interfaz-2026-10-27.md).
