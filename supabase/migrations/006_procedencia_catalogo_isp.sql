BEGIN;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS titular_isp text;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS fecha_registro_isp date;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS estado_registro_isp text;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS fuente_isp text;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS fecha_consulta_isp date;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS importado_isp_en timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS producto_registro_isp_unico ON public.producto(upper(btrim(registro_isp))) WHERE registro_isp IS NOT NULL;
-- La fecha de registro ISP no es la fecha de vencimiento de ningún lote.
COMMIT;
