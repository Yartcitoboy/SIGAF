-- Ajustes sobre el esquema inspeccionado: conservar autores históricos sin enviarles alertas.
BEGIN;
CREATE SCHEMA IF NOT EXISTS sigaf_privado;
REVOKE ALL ON SCHEMA sigaf_privado FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA sigaf_privado TO authenticated,service_role;
ALTER FUNCTION public.rol_actual() SET SCHEMA sigaf_privado;
ALTER FUNCTION public.puede_sucursal(int) SET SCHEMA sigaf_privado;
ALTER FUNCTION public.puede_inventario(int) SET SCHEMA sigaf_privado;
-- Mantener la interfaz existente mediante envoltorios sin privilegios elevados.
CREATE FUNCTION public.rol_actual() RETURNS text LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT sigaf_privado.rol_actual() $$;
CREATE FUNCTION public.puede_sucursal(p_id int) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT sigaf_privado.puede_sucursal(p_id) $$;
CREATE FUNCTION public.puede_inventario(p_id int) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT sigaf_privado.puede_inventario(p_id) $$;
REVOKE ALL ON FUNCTION public.rol_actual(),public.puede_sucursal(int),public.puede_inventario(int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.rol_actual(),public.puede_sucursal(int),public.puede_inventario(int) TO authenticated,service_role;
REVOKE ALL ON FUNCTION public.proteger_ultimo_admin() FROM PUBLIC,anon,authenticated;
ALTER TABLE public.lote ALTER COLUMN fecha_ingreso SET DEFAULT public.hoy_chile();
ALTER TABLE public.merma ALTER COLUMN fecha_baja SET DEFAULT public.hoy_chile();
CREATE OR REPLACE FUNCTION public.generar_alertas() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int; receptor record; envio uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(7342002);
 INSERT INTO public.notificacion(id_usuario,id_lote,tipo,mensaje,estado,clave_evento,destinatario_email,mensaje_correo,estado_correo)
 SELECT DISTINCT u.id_usuario,l.id_lote,'CADUCIDAD',
  p.nombre||' · Lote '||l.numero_lote||' · '||public.fn_estado_semaforo(l.fecha_vencimiento)||' · Vence '||l.fecha_vencimiento,
  'PENDIENTE',u.id_usuario||':'||l.id_lote||':'||l.fecha_vencimiento||':'||public.fn_estado_semaforo(l.fecha_vencimiento),u.email,
  p.nombre||' · Lote '||l.numero_lote||' · '||public.fn_estado_semaforo(l.fecha_vencimiento)||' · Vence '||l.fecha_vencimiento,
  CASE WHEN r.nombre='AUXILIAR' THEN 'NO_APLICA' ELSE 'PENDIENTE' END
 FROM public.lote l JOIN public.producto p USING(id_producto) JOIN public.inventario i USING(id_lote)
 JOIN public.bodega b USING(id_bodega) JOIN public.usuario u ON u.activo AND EXISTS(SELECT 1 FROM auth.users a WHERE a.id=u.id_usuario AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false) AND a.email_confirmed_at IS NOT NULL) JOIN public.perfil r ON r.id_perfil=u.id_perfil
 WHERE i.stock_actual>0 AND public.fn_estado_semaforo(l.fecha_vencimiento) IN ('NARANJO','VENCIDO')
 AND (r.nombre='ADMIN' OR (u.id_sucursal=b.id_sucursal AND (r.nombre='BODEGUERO' OR (r.nombre='AUXILIAR' AND b.es_sala_ventas))))
 ON CONFLICT(clave_evento) DO NOTHING;
 GET DIAGNOSTICS v_total=ROW_COUNT;
 FOR receptor IN SELECT id_usuario,destinatario_email,array_agg(id_notificacion ORDER BY id_notificacion) ids,
 jsonb_agg(mensaje_correo ORDER BY id_notificacion) mensajes FROM public.notificacion
 WHERE id_envio IS NULL AND estado_correo='PENDIENTE' AND clave_evento IS NOT NULL
 GROUP BY id_usuario,destinatario_email LOOP
  INSERT INTO public.correo_resumen(id_usuario,destinatario,mensajes,ids_notificaciones)
  VALUES(receptor.id_usuario,receptor.destinatario_email,receptor.mensajes,receptor.ids) RETURNING id_envio INTO envio;
  UPDATE public.notificacion SET id_envio=envio WHERE id_notificacion=ANY(receptor.ids);
 END LOOP;
 UPDATE public.inventario i SET estado_semaforo=public.fn_estado_semaforo(l.fecha_vencimiento) FROM public.lote l WHERE l.id_lote=i.id_lote;
 RETURN v_total;
END $$;
CREATE OR REPLACE FUNCTION public.reclamar_correos() RETURNS SETOF public.correo_resumen LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 -- Resend conserva la idempotencia durante 24 h. Fuera de esa ventana no se
 -- reenvía una entrega ambigua automáticamente; requiere revisión humana.
 UPDATE public.correo_resumen c SET estado='REVISION',error='Revisar destinatario o estado de entrega antes de reintentar'
 WHERE c.estado IN ('PENDIENTE','ERROR','PROCESANDO') AND (
  (c.primer_intento IS NOT NULL AND c.primer_intento<now()-interval '23 hours') OR c.intentos>=5 OR
  NOT EXISTS(SELECT 1 FROM public.usuario u WHERE u.id_usuario=c.id_usuario AND u.activo AND u.email=c.destinatario AND EXISTS(SELECT 1 FROM auth.users a WHERE a.id=u.id_usuario AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false) AND a.email_confirmed_at IS NOT NULL)));
 UPDATE public.notificacion n SET estado_correo='REVISION',error_correo=c.error FROM public.correo_resumen c WHERE c.id_envio=n.id_envio AND c.estado='REVISION';
 RETURN QUERY UPDATE public.correo_resumen c SET estado='PROCESANDO',disponible=now()+interval '10 minutes',intentos=intentos+1,primer_intento=coalesce(primer_intento,now())
 WHERE c.id_envio IN (SELECT x.id_envio FROM public.correo_resumen x WHERE x.estado IN ('PENDIENTE','ERROR','PROCESANDO') AND x.disponible<=now() AND x.intentos<5 ORDER BY x.disponible LIMIT 6 FOR UPDATE SKIP LOCKED) RETURNING c.*;
END $$;
REVOKE ALL ON FUNCTION public.generar_alertas(),public.reclamar_correos() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.generar_alertas(),public.reclamar_correos() TO service_role;
-- Índices completos para las claves foráneas usadas en consultas y políticas RLS.
DO $$ DECLARE r record; BEGIN
 FOR r IN SELECT t.relname tabla,a.attname columna FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=c.conkey[1]
 WHERE c.contype='f' AND cardinality(c.conkey)=1 AND n.nspname='public' AND NOT EXISTS(SELECT 1 FROM pg_index i WHERE i.indrelid=t.oid AND i.indisvalid AND i.indkey[0]=c.conkey[1] AND i.indpred IS NULL)
 LOOP EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(%I)',left('idx_'||r.tabla||'_'||r.columna,63),r.tabla,r.columna); END LOOP;
END $$;
COMMIT;
