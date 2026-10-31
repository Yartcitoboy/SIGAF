BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE TABLE sigaf_privado.vinculo_gmail (
 hash text PRIMARY KEY CHECK(length(hash)=64), id_usuario uuid NOT NULL REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
 vence timestamptz NOT NULL DEFAULT now()+interval '15 minutes'
);
ALTER TABLE sigaf_privado.vinculo_gmail ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON sigaf_privado.vinculo_gmail FROM PUBLIC,anon,authenticated;
GRANT ALL ON sigaf_privado.vinculo_gmail TO service_role;
CREATE INDEX vinculo_gmail_usuario ON sigaf_privado.vinculo_gmail(id_usuario);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_cron_alertas') THEN
  PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'sigaf_cron_alertas','Invocación del trabajador de caducidad');
 END IF;
END $$;
CREATE FUNCTION sigaf_privado.guardar_secreto_alertas(p_nombre text,p_valor text) RETURNS void LANGUAGE plpgsql SET search_path='' AS $$
DECLARE v_id uuid;
BEGIN
 SELECT id INTO v_id FROM vault.secrets WHERE name=p_nombre;
 IF v_id IS NULL THEN PERFORM vault.create_secret(p_valor,p_nombre,'Integración Gmail de SIGAF');
 ELSE PERFORM vault.update_secret(v_id,p_valor); END IF;
END $$;
CREATE FUNCTION public.validar_cron_alertas(p_token text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(length(p_token)=64 AND p_token=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_cron_alertas'),false)
$$;
CREATE FUNCTION public.configurar_correo_alertas(p_actor uuid,p_cliente text,p_secreto text,p_url text,p_activo boolean) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_cliente text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario WHERE u.id_usuario=p_actor AND u.activo AND r.nombre='ADMIN' AND a.deleted_at IS NULL) THEN RAISE EXCEPTION 'Solo Admin puede configurar envíos'; END IF;
 IF p_url !~ '^https://[a-z0-9]+\.supabase\.co$' OR p_cliente !~ '^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$' OR length(p_secreto)>500 THEN RAISE EXCEPTION 'Configuración OAuth inválida'; END IF;
 PERFORM pg_advisory_xact_lock(7342031);
 SELECT decrypted_secret INTO v_cliente FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id';
 IF v_cliente IS DISTINCT FROM p_cliente THEN
  DELETE FROM vault.secrets WHERE name IN('sigaf_google_refresh_token','sigaf_gmail_email','sigaf_google_client_secret');
  DELETE FROM sigaf_privado.vinculo_gmail;
 END IF;
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_client_id',p_cliente);
 IF nullif(p_secreto,'') IS NOT NULL THEN PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_client_secret',p_secreto); END IF;
 IF NOT EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_client_secret') THEN RAISE EXCEPTION 'Falta el secreto del cliente OAuth'; END IF;
 UPDATE sigaf_privado.programacion_alertas SET correo_activo=p_activo AND EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_refresh_token'),url_worker=p_url,ultimo_error=NULL,
 remitente=(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_gmail_email');
END $$;
CREATE FUNCTION public.iniciar_vinculo_gmail(p_actor uuid,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario WHERE u.id_usuario=p_actor AND u.activo AND r.nombre='ADMIN' AND a.deleted_at IS NULL) THEN RAISE EXCEPTION 'Solo Admin puede conectar Gmail'; END IF;
 DELETE FROM sigaf_privado.vinculo_gmail WHERE vence<=now() OR id_usuario=p_actor;
 INSERT INTO sigaf_privado.vinculo_gmail(hash,id_usuario) VALUES(p_hash,p_actor);
END $$;
CREATE FUNCTION public.consumir_vinculo_gmail(p_hash text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_actor uuid;
BEGIN
 DELETE FROM sigaf_privado.vinculo_gmail WHERE hash=p_hash AND vence>now() RETURNING id_usuario INTO v_actor;
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario WHERE u.id_usuario=v_actor AND u.activo AND r.nombre='ADMIN' AND a.deleted_at IS NULL) THEN RETURN NULL; END IF;
 RETURN v_actor;
END $$;
CREATE FUNCTION public.guardar_vinculo_gmail(p_actor uuid,p_cliente text,p_refresh text,p_email text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) WHERE u.id_usuario=p_actor AND u.activo AND r.nombre='ADMIN') THEN RAISE EXCEPTION 'Admin no autorizado'; END IF;
 IF p_cliente IS DISTINCT FROM (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id') OR nullif(p_refresh,'') IS NULL OR NOT sigaf_privado.correo_admitido(p_email) THEN RAISE EXCEPTION 'Vínculo Gmail inválido'; END IF;
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_google_refresh_token',p_refresh);
 PERFORM sigaf_privado.guardar_secreto_alertas('sigaf_gmail_email',p_email);
 UPDATE sigaf_privado.programacion_alertas SET remitente=p_email,correo_activo=true,ultimo_error=NULL;
END $$;
CREATE FUNCTION public.configuracion_envio_alertas() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('activo',p.correo_activo,'remitente',p.remitente,
 'cliente',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id'),
 'secreto',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_secret'),
 'refresh',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_refresh_token'))
 FROM sigaf_privado.programacion_alertas p
$$;
CREATE FUNCTION public.estado_entrega_alertas(p_actor uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE v_admin boolean; v_email text;
BEGIN
 SELECT r.nombre='ADMIN',u.email INTO v_admin,v_email FROM public.usuario u JOIN public.perfil r USING(id_perfil)
 JOIN auth.users a ON a.id=u.id_usuario WHERE u.id_usuario=p_actor AND u.activo AND a.deleted_at IS NULL;
 IF v_email IS NULL THEN RAISE EXCEPTION 'Cuenta no autorizada'; END IF;
 RETURN jsonb_build_object('email',v_email,'correo_admitido',sigaf_privado.correo_admitido(v_email),
 'confirmado',EXISTS(SELECT 1 FROM public.correo_destino WHERE id_usuario=p_actor AND email=v_email AND confirmado_en IS NOT NULL),
 'proveedor_configurado',EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_client_secret'),
 'gmail_conectado',EXISTS(SELECT 1 FROM vault.secrets WHERE name='sigaf_google_refresh_token'),
 'correo_activo',(SELECT correo_activo FROM sigaf_privado.programacion_alertas),
 'fecha_chile',public.hoy_chile(),'fecha_inicio',(SELECT fecha_inicio FROM sigaf_privado.programacion_alertas),
 'ultimo_resumen',(SELECT jsonb_build_object('fecha',fecha_resumen,'estado',estado,'error',error) FROM public.correo_resumen WHERE id_usuario=p_actor AND fecha_resumen IS NOT NULL ORDER BY fecha_resumen DESC LIMIT 1),
 'administracion',CASE WHEN v_admin THEN jsonb_build_object(
  'cliente',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='sigaf_google_client_id'),
  'remitente',(SELECT remitente FROM sigaf_privado.programacion_alertas),
  'error',(SELECT ultimo_error FROM sigaf_privado.programacion_alertas),
  'cron_activo',EXISTS(SELECT 1 FROM cron.job WHERE jobname='sigaf-caducidad-diaria' AND active),
  'ultima_fecha',(SELECT ultima_fecha FROM sigaf_privado.programacion_alertas),
  'ultima_ejecucion',(SELECT ultima_ejecucion FROM sigaf_privado.programacion_alertas),
  'destinatarios',(SELECT coalesce(jsonb_agg(jsonb_build_object('id_usuario',u.id_usuario,'nombre',u.nombre,'email',u.email,'rol',r.nombre,
  'correo_admitido',sigaf_privado.correo_admitido(u.email),'confirmado',d.confirmado_en IS NOT NULL AND d.email=u.email)), '[]'::jsonb)
   FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN auth.users a ON a.id=u.id_usuario AND a.deleted_at IS NULL
   LEFT JOIN public.correo_destino d USING(id_usuario) WHERE u.activo),
  'envios_recientes',(SELECT coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) FROM (
   SELECT fecha_resumen,destinatario,estado,error FROM public.correo_resumen WHERE fecha_resumen IS NOT NULL ORDER BY fecha_resumen DESC,destinatario LIMIT 30)x)
 ) ELSE NULL END);
END $$;
CREATE FUNCTION public.error_integracion_gmail(p_error text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE sigaf_privado.programacion_alertas SET ultimo_error=left(p_error,200)
$$;
CREATE FUNCTION sigaf_privado.tick_alertas() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v sigaf_privado.programacion_alertas; v_token text;
BEGIN
 PERFORM public.preparar_resumen_diario();
 SELECT * INTO v FROM sigaf_privado.programacion_alertas WHERE id FOR UPDATE;
 IF NOT v.correo_activo OR v.url_worker IS NULL OR v.ultimo_worker>now()-interval '55 seconds' THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.correo_resumen WHERE fecha_resumen=public.hoy_chile() AND estado IN('PENDIENTE','ERROR','PROCESANDO') AND disponible<=now()) THEN RETURN; END IF;
 SELECT decrypted_secret INTO v_token FROM vault.decrypted_secrets WHERE name='sigaf_cron_alertas';
 PERFORM net.http_post(url:=v.url_worker||'/functions/v1/sigaf-alertas',
  headers:=jsonb_build_object('Content-Type','application/json','x-sigaf-cron',v_token),body:='{"accion":"ejecutar"}'::jsonb,timeout_milliseconds:=120000);
 UPDATE sigaf_privado.programacion_alertas SET ultimo_worker=now();
END $$;
REVOKE ALL ON FUNCTION sigaf_privado.guardar_secreto_alertas(text,text),public.validar_cron_alertas(text),public.configurar_correo_alertas(uuid,text,text,text,boolean),public.configuracion_envio_alertas(),public.estado_entrega_alertas(uuid),sigaf_privado.tick_alertas(),public.iniciar_vinculo_gmail(uuid,text),public.consumir_vinculo_gmail(text),public.guardar_vinculo_gmail(uuid,text,text,text),public.error_integracion_gmail(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.validar_cron_alertas(text),public.configurar_correo_alertas(uuid,text,text,text,boolean),public.configuracion_envio_alertas(),public.estado_entrega_alertas(uuid),sigaf_privado.tick_alertas(),public.iniciar_vinculo_gmail(uuid,text),public.consumir_vinculo_gmail(text),public.guardar_vinculo_gmail(uuid,text,text,text),public.error_integracion_gmail(text) TO service_role;
SELECT cron.schedule('sigaf-caducidad-diaria','* * * * *','select sigaf_privado.tick_alertas()');
COMMIT;
