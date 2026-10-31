-- Respeta safeupdate sin desactivar protecciones ni ampliar permisos.
-- Solo se invalidan autorizaciones OAuth vigentes al cambiar el cliente.
BEGIN;
CREATE OR REPLACE FUNCTION public.configurar_correo_alertas(p_actor uuid,p_cliente text,p_secreto text,p_url text,p_activo boolean) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_cliente text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario WHERE u.id_usuario=p_actor AND u.activo AND r.nombre='ADMIN' AND a.deleted_at IS NULL) THEN RAISE EXCEPTION 'Solo Admin puede configurar envíos'; END IF;
 IF p_url !~ '^https://[a-z0-9]+\.supabase\.co$' OR p_cliente !~ '^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$' OR length(p_secreto)>500 THEN RAISE EXCEPTION 'Configuración OAuth inválida'; END IF;
 PERFORM pg_advisory_xact_lock(7342031);
 SELECT decrypted_secret INTO v_cliente FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id';
 IF v_cliente IS DISTINCT FROM p_cliente THEN
  DELETE FROM vault.secrets WHERE name IN('sigaf_google_refresh_token','sigaf_gmail_email','sigaf_google_client_secret');
  DELETE FROM sigaf_privado.vinculo_gmail WHERE vence>now();
 END IF;
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_client_id',p_cliente);
 IF nullif(p_secreto,'') IS NOT NULL THEN PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_client_secret',p_secreto); END IF;
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_client_secret') THEN RAISE EXCEPTION 'Falta el secreto del cliente OAuth'; END IF;
 UPDATE sigaf_privado.programacion_alertas SET correo_activo=p_activo AND EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_refresh_token'),url_worker=p_url,ultimo_error=NULL,
 remitente=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_gmail_email') WHERE id=true;
END $$;

CREATE OR REPLACE FUNCTION public.guardar_vinculo_gmail(p_actor uuid,p_cliente text,p_refresh text,p_email text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) WHERE u.id_usuario=p_actor AND u.activo AND r.nombre='ADMIN') THEN RAISE EXCEPTION 'Admin no autorizado'; END IF;
 IF p_cliente IS DISTINCT FROM (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id') OR nullif(p_refresh,'') IS NULL OR NOT sigaf_privado.correo_admitido(p_email) THEN RAISE EXCEPTION 'Vínculo Gmail inválido'; END IF;
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_refresh_token',p_refresh);
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_gmail_email',p_email);
 UPDATE sigaf_privado.programacion_alertas SET remitente=p_email,correo_activo=true,ultimo_error=NULL WHERE id=true;
END $$;

CREATE OR REPLACE FUNCTION public.error_integracion_gmail(p_error text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE sigaf_privado.programacion_alertas SET ultimo_error=left(p_error,200) WHERE id=true
$$;
CREATE OR REPLACE FUNCTION sigaf_privado.tick_alertas() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v sigaf_privado.programacion_alertas; v_token text;
BEGIN
 PERFORM public.preparar_resumen_diario();
 SELECT * INTO v FROM sigaf_privado.programacion_alertas WHERE id FOR UPDATE;
 IF NOT v.correo_activo OR v.url_worker IS NULL OR v.ultimo_worker>now()-interval '55 seconds' THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.correo_resumen WHERE fecha_resumen=public.hoy_chile() AND estado IN('PENDIENTE','ERROR','PROCESANDO') AND disponible<=now()) THEN RETURN; END IF;
 SELECT decrypted_secret INTO v_token FROM vault.decrypted_secrets WHERE name='sigaf_cron_alertas';
 PERFORM net.http_post(url:=v.url_worker||'/functions/v1/sigaf-alertas',
  headers:=jsonb_build_object('Content-Type','application/json','x-sigaf-cron',v_token),body:='{"accion":"ejecutar"}'::jsonb,timeout_milliseconds:=120000);
 UPDATE sigaf_privado.programacion_alertas SET ultimo_worker=now() WHERE id=true;
END $$;

CREATE OR REPLACE FUNCTION public.preparar_resumen_diario() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_total int;
BEGIN
 PERFORM pg_advisory_xact_lock(7342030);
 IF NOT EXISTS(SELECT 1 FROM sigaf_privado.programacion_alertas WHERE fecha_inicio<=public.hoy_chile() AND ultima_fecha IS DISTINCT FROM public.hoy_chile()) THEN RETURN 0; END IF;
 PERFORM public.generar_alertas();
 INSERT INTO public.correo_resumen(id_usuario,destinatario,mensajes,ids_notificaciones,fecha_resumen,alcance_rol,alcance_sucursal)
 SELECT u.id_usuario,u.email,
 jsonb_agg(jsonb_build_object('producto',p.nombre,'registro_isp',p.registro_isp,'lote',l.numero_lote,
 'vencimiento',l.fecha_vencimiento,'dias',l.fecha_vencimiento-public.hoy_chile(),'estado',public.fn_estado_semaforo(l.fecha_vencimiento),
 'stock',i.stock_actual,'presentacion',p.unidad_medida,'ubicacion',b.nombre,'sucursal',s.nombre)
 ORDER BY l.fecha_vencimiento,p.nombre,i.id_inventario),'{}'::int[],public.hoy_chile(),r.nombre,u.id_sucursal
 FROM public.usuario u JOIN public.perfil r USING(id_perfil)
 JOIN auth.users a ON a.id=u.id_usuario AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false) AND a.email_confirmed_at IS NOT NULL
 JOIN public.correo_destino d ON d.id_usuario=u.id_usuario AND d.email=u.email AND d.confirmado_en IS NOT NULL
 JOIN public.bodega b ON r.nombre='ADMIN' OR (u.id_sucursal=b.id_sucursal AND (r.nombre='BODEGUERO' OR (r.nombre='AUXILIAR' AND b.es_sala_ventas)))
 JOIN public.sucursal s ON s.id_sucursal=b.id_sucursal JOIN public.inventario i USING(id_bodega) JOIN public.lote l USING(id_lote)
 JOIN public.producto p USING(id_producto)
 WHERE u.activo AND sigaf_privado.correo_admitido(u.email) AND i.stock_actual>0
 AND public.fn_estado_semaforo(l.fecha_vencimiento) IN ('AMARILLO','NARANJO','VENCIDO')
 GROUP BY u.id_usuario,u.email,r.nombre,u.id_sucursal ON CONFLICT(id_usuario,fecha_resumen) WHERE fecha_resumen IS NOT NULL DO NOTHING;
 GET DIAGNOSTICS v_total=ROW_COUNT;
 UPDATE sigaf_privado.programacion_alertas SET ultima_fecha=public.hoy_chile(),ultima_ejecucion=now() WHERE id=true;
 RETURN v_total;
END $$;
COMMIT;
