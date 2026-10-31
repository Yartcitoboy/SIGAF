BEGIN;
CREATE TABLE public.correo_destino (
 id_usuario uuid PRIMARY KEY REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
 email text NOT NULL, confirmado_en timestamptz, actualizado timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.correo_destino ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.correo_destino FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.correo_destino TO authenticated;
GRANT ALL ON public.correo_destino TO service_role;
CREATE POLICY destino_lectura ON public.correo_destino FOR SELECT TO authenticated
 USING(id_usuario=(SELECT auth.uid()) OR sigaf_privado.rol_actual()='ADMIN');
CREATE TABLE sigaf_privado.codigo_correo (
 id_usuario uuid PRIMARY KEY REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
 email text NOT NULL, nonce uuid NOT NULL, hash text NOT NULL CHECK(length(hash)=64),
 solicitado timestamptz NOT NULL DEFAULT now(), vence timestamptz NOT NULL DEFAULT now()+interval '15 minutes',
 intentos int NOT NULL DEFAULT 0
);
CREATE TABLE sigaf_privado.programacion_alertas (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), fecha_inicio date NOT NULL DEFAULT public.hoy_chile()+1,
 ultima_fecha date, ultima_ejecucion timestamptz, ultimo_worker timestamptz,
 correo_activo boolean NOT NULL DEFAULT false, remitente text, url_worker text, ultimo_error text
);
INSERT INTO sigaf_privado.programacion_alertas(id) VALUES(true);
ALTER TABLE sigaf_privado.codigo_correo ENABLE ROW LEVEL SECURITY;
ALTER TABLE sigaf_privado.programacion_alertas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON sigaf_privado.codigo_correo,sigaf_privado.programacion_alertas FROM PUBLIC,anon,authenticated;
GRANT ALL ON sigaf_privado.codigo_correo,sigaf_privado.programacion_alertas TO service_role;
ALTER TABLE public.correo_resumen ADD COLUMN fecha_resumen date, ADD COLUMN reserva uuid,
 ADD COLUMN alcance_rol text, ADD COLUMN alcance_sucursal int;
CREATE UNIQUE INDEX correo_un_resumen_diario ON public.correo_resumen(id_usuario,fecha_resumen) WHERE fecha_resumen IS NOT NULL;
ALTER TABLE public.notificacion ADD COLUMN generado_en timestamptz;
-- La cola anterior no representa un resumen de hoy. Se conserva para auditoría sin reenviarla.
UPDATE public.correo_resumen SET estado='REVISION',error='Resumen anterior al envío diario; conservado sin reenviar'
 WHERE estado IN ('PENDIENTE','ERROR','PROCESANDO') AND fecha_resumen IS NULL;

CREATE FUNCTION sigaf_privado.correo_admitido(p_email text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT coalesce(length(p_email)<=150 AND p_email ~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,63}$'
 AND split_part(lower(p_email),'@',2) NOT IN ('local.com','example.com','example.org','example.net')
 AND split_part(lower(p_email),'@',2) !~ '(\.|^)(local|localhost|invalid|test|example)$'
 AND p_email !~ '(\.\.|^\.|\.@)',false)
$$;
REVOKE ALL ON FUNCTION sigaf_privado.correo_admitido(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION sigaf_privado.correo_admitido(text) TO service_role;

CREATE FUNCTION sigaf_privado.invalidar_destino_correo() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.email IS DISTINCT FROM OLD.email THEN
  DELETE FROM public.correo_destino WHERE id_usuario=NEW.id_usuario;
  DELETE FROM sigaf_privado.codigo_correo WHERE id_usuario=NEW.id_usuario;
  UPDATE public.correo_resumen SET estado='REVISION',error='Cambió el correo de la cuenta; confirmar el nuevo destino'
   WHERE id_usuario=NEW.id_usuario AND estado IN ('PENDIENTE','ERROR','PROCESANDO');
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER correo_cambiado AFTER UPDATE OF email ON public.usuario FOR EACH ROW EXECUTE FUNCTION sigaf_privado.invalidar_destino_correo();

CREATE FUNCTION public.solicitar_codigo_correo(p_usuario uuid,p_nonce uuid,p_hash text) RETURNS text
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_email text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_usuario::text,30));
 SELECT u.email INTO v_email FROM public.usuario u JOIN auth.users a ON a.id=u.id_usuario
  WHERE u.id_usuario=p_usuario AND u.activo AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false);
 IF v_email IS NULL OR NOT sigaf_privado.correo_admitido(v_email) THEN RAISE EXCEPTION 'Usa un correo real. Las direcciones de prueba no reciben alertas'; END IF;
 IF EXISTS(SELECT 1 FROM sigaf_privado.codigo_correo WHERE id_usuario=p_usuario AND solicitado>now()-interval '1 minute') THEN RAISE EXCEPTION 'Espera un minuto antes de solicitar otro código'; END IF;
 INSERT INTO sigaf_privado.codigo_correo(id_usuario,email,nonce,hash) VALUES(p_usuario,v_email,p_nonce,p_hash)
 ON CONFLICT(id_usuario) DO UPDATE SET email=excluded.email,nonce=excluded.nonce,hash=excluded.hash,solicitado=now(),vence=now()+interval '15 minutes',intentos=0;
 RETURN v_email;
END $$;
CREATE FUNCTION public.confirmar_codigo_correo(p_usuario uuid,p_nonce uuid,p_hash text) RETURNS boolean
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v sigaf_privado.codigo_correo;
BEGIN
 SELECT * INTO v FROM sigaf_privado.codigo_correo WHERE id_usuario=p_usuario FOR UPDATE;
 IF NOT FOUND OR v.vence<=now() OR v.intentos>=5 OR v.email IS DISTINCT FROM (SELECT email FROM public.usuario WHERE id_usuario=p_usuario AND activo) THEN RETURN false; END IF;
 UPDATE sigaf_privado.codigo_correo SET intentos=intentos+1 WHERE id_usuario=p_usuario;
 IF v.nonce<>p_nonce OR v.hash<>p_hash THEN RETURN false; END IF;
 INSERT INTO public.correo_destino(id_usuario,email,confirmado_en) VALUES(p_usuario,v.email,now())
 ON CONFLICT(id_usuario) DO UPDATE SET email=excluded.email,confirmado_en=now(),actualizado=now();
 DELETE FROM sigaf_privado.codigo_correo WHERE id_usuario=p_usuario;
 RETURN true;
END $$;
CREATE FUNCTION public.nonce_codigo_correo(p_usuario uuid) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT nonce FROM sigaf_privado.codigo_correo WHERE id_usuario=p_usuario AND vence>now() AND intentos<5
$$;

CREATE OR REPLACE FUNCTION public.generar_alertas() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_total int;
BEGIN
 PERFORM pg_advisory_xact_lock(7342002);
 INSERT INTO public.notificacion(id_usuario,id_lote,tipo,mensaje,estado,clave_evento,destinatario_email,mensaje_correo,estado_correo,fecha_envio,generado_en)
 SELECT DISTINCT u.id_usuario,l.id_lote,'CADUCIDAD',
 p.nombre||' · Lote '||l.numero_lote||' · '||public.fn_estado_semaforo(l.fecha_vencimiento)||' · Vence '||l.fecha_vencimiento,
 'PENDIENTE',u.id_usuario||':'||l.id_lote||':'||l.fecha_vencimiento||':'||public.fn_estado_semaforo(l.fecha_vencimiento),u.email,
 p.nombre||' · Lote '||l.numero_lote||' · Vence '||l.fecha_vencimiento,'RESUMEN_DIARIO',now() AT TIME ZONE 'America/Santiago',now()
 FROM public.lote l JOIN public.producto p USING(id_producto) JOIN public.inventario i USING(id_lote)
 JOIN public.bodega b USING(id_bodega) JOIN public.usuario u ON u.activo
 JOIN auth.users a ON a.id=u.id_usuario AND a.deleted_at IS NULL AND NOT coalesce(a.is_anonymous,false) AND a.email_confirmed_at IS NOT NULL
 JOIN public.perfil r USING(id_perfil)
 WHERE i.stock_actual>0 AND public.fn_estado_semaforo(l.fecha_vencimiento) IN ('AMARILLO','NARANJO','VENCIDO')
 AND (r.nombre='ADMIN' OR (u.id_sucursal=b.id_sucursal AND (r.nombre='BODEGUERO' OR (r.nombre='AUXILIAR' AND b.es_sala_ventas))))
 ON CONFLICT(clave_evento) DO NOTHING;
 GET DIAGNOSTICS v_total=ROW_COUNT;
 UPDATE public.inventario i SET estado_semaforo=public.fn_estado_semaforo(l.fecha_vencimiento) FROM public.lote l WHERE l.id_lote=i.id_lote;
 RETURN v_total;
END $$;

CREATE FUNCTION public.preparar_resumen_diario() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
 UPDATE sigaf_privado.programacion_alertas SET ultima_fecha=public.hoy_chile(),ultima_ejecucion=now();
 RETURN v_total;
END $$;

CREATE OR REPLACE FUNCTION public.reclamar_correos() RETURNS SETOF public.correo_resumen LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 -- Gmail no tiene una clave de idempotencia para send: no repetir una entrega ambigua.
 UPDATE public.correo_resumen SET estado='REVISION',error='Se interrumpió un envío; comprobar Enviados en Gmail antes de repetir'
 WHERE estado='PROCESANDO' AND disponible<=now();
 UPDATE public.correo_resumen c SET estado='REVISION',error='Destino no confirmado, alcance modificado, resumen antiguo o entrega ambigua; requiere revisión'
 WHERE c.estado IN ('PENDIENTE','ERROR','PROCESANDO') AND (
 c.fecha_resumen IS DISTINCT FROM public.hoy_chile() OR c.intentos>=5 OR c.primer_intento<now()-interval '23 hours' OR
 NOT EXISTS(SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil) JOIN public.correo_destino d USING(id_usuario) JOIN auth.users a ON a.id=u.id_usuario
  WHERE u.id_usuario=c.id_usuario AND u.activo AND r.nombre=c.alcance_rol AND u.id_sucursal IS NOT DISTINCT FROM c.alcance_sucursal AND u.email=c.destinatario AND d.email=u.email AND d.confirmado_en IS NOT NULL AND a.deleted_at IS NULL AND a.email_confirmed_at IS NOT NULL AND NOT coalesce(a.is_anonymous,false)));
 RETURN QUERY UPDATE public.correo_resumen c SET estado='PROCESANDO',disponible=now()+interval '5 minutes',intentos=intentos+1,
 primer_intento=coalesce(primer_intento,now()),reserva=gen_random_uuid()
 WHERE c.id_envio IN(SELECT x.id_envio FROM public.correo_resumen x WHERE x.estado IN('PENDIENTE','ERROR')
 AND x.fecha_resumen=public.hoy_chile() AND x.disponible<=now() ORDER BY x.disponible LIMIT 6 FOR UPDATE SKIP LOCKED) RETURNING c.*;
END $$;
CREATE FUNCTION public.autorizar_resumen_diario(p_envio uuid,p_reserva uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.correo_resumen c JOIN public.usuario u USING(id_usuario)
 JOIN public.perfil r USING(id_perfil) JOIN public.correo_destino d USING(id_usuario) JOIN auth.users a ON a.id=u.id_usuario
 WHERE c.id_envio=p_envio AND c.reserva=p_reserva AND c.estado='PROCESANDO' AND c.fecha_resumen=public.hoy_chile()
 AND u.activo AND r.nombre=c.alcance_rol AND u.id_sucursal IS NOT DISTINCT FROM c.alcance_sucursal
 AND u.email=c.destinatario AND d.email=u.email AND d.confirmado_en IS NOT NULL
 AND a.deleted_at IS NULL AND a.email_confirmed_at IS NOT NULL AND NOT coalesce(a.is_anonymous,false))
$$;
CREATE FUNCTION public.finalizar_resumen_diario(p_envio uuid,p_reserva uuid,p_correo_id text DEFAULT NULL,p_error text DEFAULT NULL,p_reintentar boolean DEFAULT true)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.correo_resumen SET estado=CASE WHEN p_correo_id IS NOT NULL THEN 'ACEPTADO' WHEN p_reintentar THEN 'ERROR' ELSE 'REVISION' END,
 correo_id=p_correo_id,error=left(p_error,200),disponible=now()+interval '5 minutes'
 WHERE id_envio=p_envio AND reserva=p_reserva AND estado='PROCESANDO';
 RETURN FOUND;
END $$;
-- Estas funciones solo se invocan desde la función protegida o el cron del servidor.
REVOKE ALL ON FUNCTION public.solicitar_codigo_correo(uuid,uuid,text),public.confirmar_codigo_correo(uuid,uuid,text),public.nonce_codigo_correo(uuid),public.preparar_resumen_diario(),public.finalizar_resumen_diario(uuid,uuid,text,text,boolean),public.autorizar_resumen_diario(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.solicitar_codigo_correo(uuid,uuid,text),public.confirmar_codigo_correo(uuid,uuid,text),public.nonce_codigo_correo(uuid),public.preparar_resumen_diario(),public.finalizar_resumen_diario(uuid,uuid,text,text,boolean),public.autorizar_resumen_diario(uuid,uuid) TO service_role;
COMMIT;
