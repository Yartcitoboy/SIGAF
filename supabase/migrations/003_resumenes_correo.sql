BEGIN;
CREATE TABLE public.correo_resumen (
 id_envio uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 id_usuario uuid NOT NULL REFERENCES public.usuario,
 destinatario text NOT NULL,
 mensajes jsonb NOT NULL,
 ids_notificaciones int[] NOT NULL,
 estado text NOT NULL DEFAULT 'PENDIENTE',
 intentos int NOT NULL DEFAULT 0,
 primer_intento timestamptz,
 disponible timestamptz NOT NULL DEFAULT now(),
 error text,
 correo_id text
);
ALTER TABLE public.correo_resumen ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.correo_resumen FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.correo_resumen TO service_role;
ALTER TABLE public.notificacion ADD COLUMN id_envio uuid REFERENCES public.correo_resumen;
CREATE INDEX idx_correo_pendiente ON public.correo_resumen(estado,disponible);

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
 JOIN public.bodega b USING(id_bodega) JOIN public.usuario u ON u.activo JOIN public.perfil r ON r.id_perfil=u.id_perfil
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

DROP FUNCTION public.reclamar_correos();
CREATE FUNCTION public.reclamar_correos() RETURNS SETOF public.correo_resumen LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 -- Resend conserva la idempotencia durante 24 h. Fuera de esa ventana no se
 -- reenvía una entrega ambigua automáticamente; requiere revisión humana.
 UPDATE public.correo_resumen c SET estado='REVISION',error='Revisar destinatario o estado de entrega antes de reintentar'
 WHERE c.estado IN ('PENDIENTE','ERROR','PROCESANDO') AND (
  (c.primer_intento IS NOT NULL AND c.primer_intento<now()-interval '23 hours') OR c.intentos>=5 OR
  NOT EXISTS(SELECT 1 FROM public.usuario u WHERE u.id_usuario=c.id_usuario AND u.activo AND u.email=c.destinatario));
 UPDATE public.notificacion n SET estado_correo='REVISION',error_correo=c.error FROM public.correo_resumen c WHERE c.id_envio=n.id_envio AND c.estado='REVISION';
 RETURN QUERY UPDATE public.correo_resumen c SET estado='PROCESANDO',disponible=now()+interval '10 minutes',intentos=intentos+1,primer_intento=coalesce(primer_intento,now())
 WHERE c.id_envio IN (SELECT x.id_envio FROM public.correo_resumen x WHERE x.estado IN ('PENDIENTE','ERROR','PROCESANDO') AND x.disponible<=now() AND x.intentos<5 ORDER BY x.disponible LIMIT 6 FOR UPDATE SKIP LOCKED) RETURNING c.*;
END $$;
CREATE FUNCTION public.finalizar_correo(p_envio uuid,p_correo_id text DEFAULT NULL,p_error text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.correo_resumen SET estado=CASE WHEN p_error IS NULL THEN 'ENVIADO' ELSE 'ERROR' END,
 correo_id=p_correo_id,error=p_error,disponible=now()+interval '15 minutes' WHERE id_envio=p_envio;
 UPDATE public.notificacion SET estado_correo=CASE WHEN p_error IS NULL THEN 'ENVIADO' ELSE 'ERROR' END,
 correo_id=p_correo_id,error_correo=p_error WHERE id_envio=p_envio;
END $$;
REVOKE ALL ON FUNCTION public.generar_alertas(),public.reclamar_correos(),public.finalizar_correo(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.generar_alertas(),public.reclamar_correos(),public.finalizar_correo(uuid,text,text) TO service_role;
COMMIT;
