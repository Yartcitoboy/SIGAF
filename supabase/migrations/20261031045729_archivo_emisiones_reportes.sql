BEGIN;
-- NULL conserva el significado de los registros históricos sin contenido.
ALTER TABLE public.reporte ADD COLUMN contenido jsonb;
ALTER TABLE public.reporte ADD CONSTRAINT reporte_contenido_archivado CHECK (
 contenido IS NULL OR (
  jsonb_typeof(contenido)='object' AND contenido ?& ARRAY['version','tablas','farmacia'] AND contenido->>'version'='1'
  AND jsonb_typeof(contenido->'tablas')='array'
  AND jsonb_typeof(contenido->'farmacia')='object'
  AND octet_length(contenido::text)<=6000000
 )
);
COMMENT ON COLUMN public.reporte.contenido IS 'Contenido de emisión v1 para copia; NULL en históricos. Conserva RLS y permisos existentes; no es certificación ni firma electrónica.';
COMMIT;
