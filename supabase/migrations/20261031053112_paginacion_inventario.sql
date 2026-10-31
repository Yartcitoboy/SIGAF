BEGIN;
-- Consulta de solo lectura: ejecuta con los permisos y RLS del usuario.
CREATE FUNCTION public.pagina_inventario(p_pagina int DEFAULT 1,p_texto text DEFAULT '',p_bodega int DEFAULT NULL,p_estado text DEFAULT '',p_orden text DEFAULT 'vencimiento')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE resultado jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para consultar inventario'; END IF;
 IF p_pagina IS NULL OR p_pagina<1 OR p_pagina>100000 OR length(p_texto)>150 OR p_estado NOT IN ('','VERDE','AMARILLO','NARANJO','VENCIDO') OR p_orden NOT IN ('vencimiento','stock','nombre') THEN RAISE EXCEPTION 'Filtros de inventario inválidos'; END IF;
 WITH filtrado AS MATERIALIZED (
  SELECT i.*,l AS datos_lote,p AS datos_producto,b AS datos_bodega,public.fn_estado_semaforo(l.fecha_vencimiento) AS riesgo
  FROM public.inventario i JOIN public.lote l USING(id_lote) JOIN public.producto p USING(id_producto) JOIN public.bodega b USING(id_bodega)
  WHERE (p_bodega IS NULL OR i.id_bodega=p_bodega)
  AND (coalesce(p_texto,'')='' OR strpos(lower(concat_ws(' ',p.nombre,p.codigo_barras,p.principio_activo,l.numero_lote)),lower(p_texto))>0)
  AND (p_estado='' OR public.fn_estado_semaforo(l.fecha_vencimiento)=p_estado)
 ), pagina AS (
  SELECT * FROM filtrado ORDER BY
   CASE WHEN p_orden='stock' THEN stock_actual END ASC,
   CASE WHEN p_orden='nombre' THEN (datos_producto).nombre END ASC,
   CASE WHEN p_orden='vencimiento' THEN (datos_lote).fecha_vencimiento END ASC NULLS LAST,
   id_inventario ASC LIMIT 25 OFFSET (p_pagina-1)*25
 ) SELECT jsonb_build_object(
  'total',(SELECT count(*) FROM filtrado),'ahora',now(),'hoy',public.hoy_chile(),
  'bodegas',(SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY b.nombre),'[]'::jsonb) FROM public.bodega b),
  'inventario',coalesce((SELECT jsonb_agg(
    (to_jsonb(p)-'datos_lote'-'datos_producto'-'datos_bodega'-'riesgo') || jsonb_build_object(
      'estado_semaforo',riesgo,'bodega',to_jsonb(datos_bodega),
      'lote',to_jsonb(datos_lote)||jsonb_build_object('producto',to_jsonb(datos_producto),'dias_restantes',(datos_lote).fecha_vencimiento-public.hoy_chile())
    )) FROM pagina p),'[]'::jsonb)
 ) INTO resultado;
 RETURN resultado;
END $$;
REVOKE ALL ON FUNCTION public.pagina_inventario(int,text,int,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.pagina_inventario(int,text,int,text,text) TO authenticated;
COMMIT;
