-- Aplicar después de 001. No modifica auth.users ni crea cuentas de demostración.
BEGIN;
ALTER TABLE public.usuario ALTER COLUMN password_hash SET DEFAULT 'AUTH_MANAGED';
ALTER TABLE public.farmacia ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.farmacia ADD COLUMN IF NOT EXISTS director_tecnico text;
ALTER TABLE public.bodega ADD COLUMN IF NOT EXISTS es_sala_ventas boolean NOT NULL DEFAULT false;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS principio_activo text;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS registro_isp text;
ALTER TABLE public.producto ADD COLUMN IF NOT EXISTS vida_util_meses int CHECK (vida_util_meses > 0);
ALTER TABLE public.lote ADD COLUMN IF NOT EXISTS costo_unitario numeric(14,2) CHECK (costo_unitario >= 0);
ALTER TABLE public.lote ADD COLUMN IF NOT EXISTS fecha_fabricacion date;
ALTER TABLE public.movimiento_inventario ADD COLUMN IF NOT EXISTS motivo text;
ALTER TABLE public.movimiento_inventario ADD COLUMN IF NOT EXISTS cumple_fefo boolean;
ALTER TABLE public.movimiento_inventario ADD COLUMN IF NOT EXISTS costo_unitario numeric(14,2);
ALTER TABLE public.movimiento_inventario ADD COLUMN IF NOT EXISTS id_bodega_destino int REFERENCES public.bodega;
ALTER TABLE public.movimiento_inventario ADD COLUMN IF NOT EXISTS clave_operacion uuid UNIQUE;
ALTER TABLE public.merma ADD COLUMN IF NOT EXISTS costo_unitario numeric(14,2);
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS id_lote int REFERENCES public.lote;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS clave_evento text UNIQUE;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS estado_correo text DEFAULT 'PENDIENTE';
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS error_correo text;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS correo_id text;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS destinatario_email text;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS mensaje_correo text;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS intentos_correo int NOT NULL DEFAULT 0;
ALTER TABLE public.notificacion ADD COLUMN IF NOT EXISTS proximo_intento timestamptz DEFAULT now();
CREATE TABLE IF NOT EXISTS public.configuracion (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  dias_critico int NOT NULL DEFAULT 45 CHECK (dias_critico > 0),
  dias_preventivo int NOT NULL DEFAULT 90,
  holgura_dias int NOT NULL DEFAULT 0 CHECK (holgura_dias >= 0),
  CHECK (dias_preventivo > dias_critico)
);
INSERT INTO public.configuracion(id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.hoy_chile() RETURNS date LANGUAGE sql STABLE
SET search_path = public AS $$ SELECT (now() AT TIME ZONE 'America/Santiago')::date $$;
CREATE OR REPLACE FUNCTION public.rol_actual() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
 SELECT p.nombre FROM public.usuario u JOIN public.perfil p USING(id_perfil)
 WHERE u.id_usuario = auth.uid() AND u.activo
$$;
CREATE OR REPLACE FUNCTION public.puede_sucursal(p_id int) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.usuario u JOIN public.perfil p USING(id_perfil)
 WHERE u.id_usuario = auth.uid() AND u.activo AND (p.nombre = 'ADMIN' OR u.id_sucursal = p_id))
$$;
CREATE OR REPLACE FUNCTION public.puede_inventario(p_id int) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.inventario i JOIN public.bodega b USING(id_bodega)
 WHERE i.id_inventario = p_id AND public.puede_sucursal(b.id_sucursal))
$$;
CREATE OR REPLACE FUNCTION public.fn_estado_semaforo(p_fecha_venc date) RETURNS varchar LANGUAGE sql STABLE
SET search_path = public AS $$
 SELECT CASE WHEN p_fecha_venc <= public.hoy_chile() THEN 'VENCIDO'
 WHEN p_fecha_venc - public.hoy_chile() <= dias_critico THEN 'NARANJO'
 WHEN p_fecha_venc - public.hoy_chile() <= dias_preventivo THEN 'AMARILLO' ELSE 'VERDE' END::varchar
 FROM public.configuracion WHERE id = 1
$$;
CREATE OR REPLACE FUNCTION public.fn_fefo_siguiente_lote(p_id_producto int,p_id_bodega int)
RETURNS TABLE(id_inventario int,id_lote int,numero_lote varchar,fecha_vencimiento date,stock_actual int)
LANGUAGE sql STABLE SET search_path = public AS $$
 SELECT i.id_inventario,l.id_lote,l.numero_lote,l.fecha_vencimiento,i.stock_actual
 FROM public.inventario i JOIN public.lote l USING(id_lote)
 WHERE l.id_producto=p_id_producto AND i.id_bodega=p_id_bodega AND i.stock_actual>0
 AND l.fecha_vencimiento > public.hoy_chile() + (SELECT holgura_dias FROM public.configuracion WHERE id=1)
 ORDER BY l.fecha_vencimiento,l.fecha_ingreso,i.id_inventario LIMIT 1
$$;

-- RLS: incluso las peticiones directas de un navegador respetan rol, estado y sucursal.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['perfil','usuario','farmacia','sucursal','bodega','categoria','producto','lote','inventario','movimiento_inventario','merma','notificacion','reporte','configuracion'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
REVOKE SELECT ON public.usuario FROM authenticated;
GRANT SELECT(id_usuario,nombre,email,id_perfil,id_sucursal,activo) ON public.usuario TO authenticated;
CREATE POLICY lectura_perfiles ON public.perfil FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY lectura_usuarios ON public.usuario FOR SELECT TO authenticated USING (id_usuario=auth.uid() OR public.rol_actual()='ADMIN');
CREATE POLICY lectura_farmacias ON public.farmacia FOR SELECT TO authenticated USING (public.rol_actual() IS NOT NULL);
CREATE POLICY lectura_sucursales ON public.sucursal FOR SELECT TO authenticated USING (public.puede_sucursal(id_sucursal));
CREATE POLICY lectura_bodegas ON public.bodega FOR SELECT TO authenticated USING (public.puede_sucursal(id_sucursal));
CREATE POLICY lectura_categorias ON public.categoria FOR SELECT TO authenticated USING (public.rol_actual() IS NOT NULL);
CREATE POLICY lectura_productos ON public.producto FOR SELECT TO authenticated USING (public.rol_actual() IS NOT NULL);
CREATE POLICY lectura_lotes ON public.lote FOR SELECT TO authenticated USING (public.rol_actual()='ADMIN' OR EXISTS (
 SELECT 1 FROM public.inventario i JOIN public.bodega b USING(id_bodega) WHERE i.id_lote=lote.id_lote AND public.puede_sucursal(b.id_sucursal)));
CREATE POLICY lectura_stock ON public.inventario FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.bodega b WHERE b.id_bodega=inventario.id_bodega AND public.puede_sucursal(b.id_sucursal)));
CREATE POLICY lectura_movimientos ON public.movimiento_inventario FOR SELECT TO authenticated USING (public.rol_actual() IN ('ADMIN','BODEGUERO') AND public.puede_inventario(id_inventario));
CREATE POLICY lectura_mermas ON public.merma FOR SELECT TO authenticated USING (public.rol_actual() IN ('ADMIN','BODEGUERO') AND public.puede_inventario(id_inventario));
CREATE POLICY lectura_alertas ON public.notificacion FOR SELECT TO authenticated USING (id_usuario=auth.uid() OR public.rol_actual()='ADMIN');
CREATE POLICY lectura_reportes ON public.reporte FOR SELECT TO authenticated USING (public.rol_actual()='ADMIN');
CREATE POLICY lectura_configuracion ON public.configuracion FOR SELECT TO authenticated USING (public.rol_actual() IS NOT NULL);
GRANT INSERT, UPDATE ON public.producto,public.categoria,public.farmacia,public.sucursal,public.bodega,public.configuracion TO authenticated;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['producto','categoria','farmacia','sucursal','bodega','configuracion'] LOOP
  EXECUTE format('CREATE POLICY admin_insert ON public.%I FOR INSERT TO authenticated WITH CHECK(public.rol_actual()=''ADMIN'')',t);
  EXECUTE format('CREATE POLICY admin_update ON public.%I FOR UPDATE TO authenticated USING(public.rol_actual()=''ADMIN'') WITH CHECK(public.rol_actual()=''ADMIN'')',t);
 END LOOP;
END $$;
GRANT UPDATE(estado) ON public.notificacion TO authenticated;
CREATE POLICY atender_alerta ON public.notificacion FOR UPDATE TO authenticated
 USING (id_usuario=auth.uid() OR public.rol_actual()='ADMIN') WITH CHECK (estado='LEIDO' AND (id_usuario=auth.uid() OR public.rol_actual()='ADMIN'));
GRANT INSERT ON public.reporte TO authenticated;
CREATE POLICY registrar_reporte ON public.reporte FOR INSERT TO authenticated WITH CHECK(public.rol_actual()='ADMIN' AND id_usuario=auth.uid());

CREATE OR REPLACE FUNCTION public.recibir_lote(p_datos jsonb) RETURNS int LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_lote int; v_inv int; v_bodega public.bodega; v_cantidad int; v_costo numeric; v_fecha date; v_fabricacion date; v_vida int; v_anterior int;
BEGIN
 IF public.rol_actual() IS NULL OR public.rol_actual() NOT IN ('ADMIN','BODEGUERO') THEN RAISE EXCEPTION 'Recepción no autorizada'; END IF;
 IF p_datos->>'operacion' IS NULL THEN RAISE EXCEPTION 'Falta la clave de operación'; END IF;
 PERFORM pg_advisory_xact_lock(7342001);
 PERFORM pg_advisory_xact_lock(hashtextextended(p_datos->>'operacion',0));
 SELECT id_inventario INTO v_anterior FROM public.movimiento_inventario WHERE clave_operacion=(p_datos->>'operacion')::uuid AND id_usuario=auth.uid();
 IF FOUND THEN
  IF NOT EXISTS(SELECT 1 FROM public.movimiento_inventario m JOIN public.inventario i USING(id_inventario) JOIN public.lote l USING(id_lote)
   WHERE m.id_inventario=v_anterior AND m.clave_operacion=(p_datos->>'operacion')::uuid AND m.cantidad=(p_datos->>'stock_inicial')::int
   AND i.id_bodega=(p_datos->>'id_bodega')::int AND l.id_producto=(p_datos->>'id_producto')::int AND l.numero_lote=trim(p_datos->>'numero_lote')
   AND l.fecha_vencimiento=(p_datos->>'fecha_vencimiento')::date AND l.costo_unitario=(p_datos->>'costo_unitario')::numeric) THEN
   RAISE EXCEPTION 'La operación ya se registró con otros datos. Actualiza el inventario antes de continuar'; END IF;
  RETURN v_anterior;
 END IF;
 v_cantidad := (p_datos->>'stock_inicial')::int; v_costo := (p_datos->>'costo_unitario')::numeric;
 v_fecha := (p_datos->>'fecha_vencimiento')::date; v_fabricacion := NULLIF(p_datos->>'fecha_fabricacion','')::date;
 IF v_cantidad IS NULL OR v_cantidad<=0 OR v_costo IS NULL OR v_costo<0 OR v_fecha IS NULL OR v_fecha<=public.hoy_chile()
 OR nullif(trim(p_datos->>'numero_lote'),'') IS NULL OR (p_datos->>'fecha_ingreso')::date>public.hoy_chile() THEN
  RAISE EXCEPTION 'Revisa cantidad, costo, lote y fechas. No se reciben lotes caducados ni ingresos futuros'; END IF;
 SELECT * INTO v_bodega FROM public.bodega WHERE id_bodega=(p_datos->>'id_bodega')::int;
 IF NOT FOUND OR NOT public.puede_sucursal(v_bodega.id_sucursal) THEN RAISE EXCEPTION 'Bodega no autorizada'; END IF;
 SELECT vida_util_meses INTO v_vida FROM public.producto WHERE id_producto=(p_datos->>'id_producto')::int;
 IF v_fabricacion IS NOT NULL AND (v_fabricacion>public.hoy_chile() OR v_fabricacion>=v_fecha OR
 (v_vida IS NOT NULL AND v_fecha>(v_fabricacion+make_interval(months=>v_vida))::date)) THEN RAISE EXCEPTION 'La vida útil excede la ficha registrada'; END IF;
 -- Evita dos recepciones accidentales del mismo lote/producto con distintas claves.
 PERFORM pg_advisory_xact_lock(hashtextextended((p_datos->>'id_producto')||':'||(p_datos->>'numero_lote'),1));
 IF EXISTS (SELECT 1 FROM public.lote WHERE id_producto=(p_datos->>'id_producto')::int AND numero_lote=trim(p_datos->>'numero_lote')) THEN
  RAISE EXCEPTION 'Ese lote ya existe para el producto. Revisa el inventario antes de recibir nuevamente'; END IF;
 INSERT INTO public.lote(numero_lote,fecha_vencimiento,fecha_ingreso,id_producto,costo_unitario,fecha_fabricacion)
 VALUES(trim(p_datos->>'numero_lote'),v_fecha,(p_datos->>'fecha_ingreso')::date,(p_datos->>'id_producto')::int,v_costo,v_fabricacion) RETURNING id_lote INTO v_lote;
 INSERT INTO public.inventario(id_lote,id_bodega,stock_actual,estado_semaforo)
 VALUES(v_lote,v_bodega.id_bodega,v_cantidad,public.fn_estado_semaforo(v_fecha)) RETURNING id_inventario INTO v_inv;
 INSERT INTO public.movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,costo_unitario,clave_operacion)
 VALUES(v_inv,auth.uid(),'ENTRADA',v_cantidad,v_costo,(p_datos->>'operacion')::uuid);
 RETURN v_inv;
END $$;

CREATE OR REPLACE FUNCTION public.operar_stock(p_inventario int,p_cantidad int,p_tipo text,p_operacion uuid,p_motivo text DEFAULT NULL,p_destino int DEFAULT NULL)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_i public.inventario; v_l public.lote; v_b public.bodega; v_otro public.bodega; v_fefo int; v_mov int; v_destino int; v_rol text; v_holgura int;
BEGIN
 v_rol:=public.rol_actual();
 IF v_rol IS NULL OR p_tipo NOT IN ('SALIDA','MERMA','TRASLADO') OR p_cantidad IS NULL OR p_cantidad<=0 OR p_operacion IS NULL THEN RAISE EXCEPTION 'Operación inválida'; END IF;
 IF p_tipo<>'SALIDA' AND v_rol NOT IN ('ADMIN','BODEGUERO') THEN RAISE EXCEPTION 'Operación no autorizada'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_operacion::text,0));
 SELECT id_movimiento INTO v_mov FROM public.movimiento_inventario WHERE clave_operacion=p_operacion AND id_usuario=auth.uid();
 IF FOUND THEN
  IF NOT EXISTS(SELECT 1 FROM public.movimiento_inventario m WHERE m.id_movimiento=v_mov AND m.id_inventario=p_inventario
    AND m.cantidad=p_cantidad AND m.tipo_movimiento=p_tipo AND m.motivo IS NOT DISTINCT FROM p_motivo
    AND m.id_bodega_destino IS NOT DISTINCT FROM (CASE WHEN p_tipo='TRASLADO' THEN p_destino ELSE NULL END)) THEN
    RAISE EXCEPTION 'La operación ya se registró con otros datos. Actualiza el inventario antes de continuar'; END IF;
  RETURN v_mov;
 END IF;
 -- Serializa operaciones de inventario; impide doble descuento y carreras FEFO/traslado.
 PERFORM pg_advisory_xact_lock(7342001);
 SELECT * INTO v_i FROM public.inventario WHERE id_inventario=p_inventario FOR UPDATE;
 IF NOT FOUND OR NOT public.puede_inventario(p_inventario) THEN RAISE EXCEPTION 'Inventario no autorizado'; END IF;
 IF v_i.stock_actual<p_cantidad THEN RAISE EXCEPTION 'Stock insuficiente; actualiza la consulta'; END IF;
 SELECT * INTO v_l FROM public.lote WHERE id_lote=v_i.id_lote;
 SELECT * INTO v_b FROM public.bodega WHERE id_bodega=v_i.id_bodega;
 SELECT holgura_dias INTO v_holgura FROM public.configuracion WHERE id=1;
 IF p_tipo='SALIDA' THEN
  IF NOT v_b.es_sala_ventas THEN RAISE EXCEPTION 'Solicita reposición a sala de ventas antes de dispensar'; END IF;
  IF v_l.fecha_vencimiento<=public.hoy_chile()+v_holgura THEN RAISE EXCEPTION 'BLOQUEADO POR CADUCIDAD o por holgura de dispensación'; END IF;
  SELECT i.id_inventario INTO v_fefo FROM public.inventario i JOIN public.lote l USING(id_lote) JOIN public.bodega b USING(id_bodega)
  WHERE l.id_producto=v_l.id_producto AND b.id_sucursal=v_b.id_sucursal AND b.es_sala_ventas AND i.stock_actual>0
  AND l.fecha_vencimiento>public.hoy_chile()+v_holgura ORDER BY l.fecha_vencimiento,l.fecha_ingreso,i.id_inventario LIMIT 1;
  IF v_fefo IS DISTINCT FROM p_inventario THEN RAISE EXCEPTION 'Entrega primero el lote recomendado por FEFO'; END IF;
 ELSIF p_tipo='MERMA' THEN
  IF p_motivo IS NULL OR p_motivo NOT IN ('VENCIMIENTO','DETERIORO','DEVOLUCION') THEN RAISE EXCEPTION 'Indica un motivo de merma válido'; END IF;
  INSERT INTO public.merma(id_inventario,id_usuario,motivo,cantidad,costo_unitario,fecha_baja)
  VALUES(p_inventario,auth.uid(),p_motivo,p_cantidad,v_l.costo_unitario,public.hoy_chile());
 ELSE
  SELECT * INTO v_otro FROM public.bodega WHERE id_bodega=p_destino;
  IF NOT FOUND OR p_destino=v_i.id_bodega OR NOT public.puede_sucursal(v_otro.id_sucursal) THEN RAISE EXCEPTION 'Bodega destino inválida o no autorizada'; END IF;
  IF nullif(trim(p_motivo),'') IS NULL THEN RAISE EXCEPTION 'Indica el motivo del traslado'; END IF;
  IF v_otro.es_sala_ventas AND v_l.fecha_vencimiento<=public.hoy_chile()+v_holgura THEN RAISE EXCEPTION 'No se trasladan lotes caducados a sala de ventas'; END IF;
  SELECT id_inventario INTO v_destino FROM public.inventario WHERE id_lote=v_i.id_lote AND id_bodega=p_destino ORDER BY id_inventario LIMIT 1 FOR UPDATE;
  IF v_destino IS NULL THEN
   INSERT INTO public.inventario(id_lote,id_bodega,stock_actual,estado_semaforo) VALUES(v_i.id_lote,p_destino,p_cantidad,public.fn_estado_semaforo(v_l.fecha_vencimiento));
  ELSE UPDATE public.inventario SET stock_actual=stock_actual+p_cantidad WHERE id_inventario=v_destino; END IF;
 END IF;
 UPDATE public.inventario SET stock_actual=stock_actual-p_cantidad,estado_semaforo=public.fn_estado_semaforo(v_l.fecha_vencimiento) WHERE id_inventario=p_inventario;
 INSERT INTO public.movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,motivo,cumple_fefo,costo_unitario,id_bodega_destino,clave_operacion)
 VALUES(p_inventario,auth.uid(),p_tipo,p_cantidad,p_motivo,CASE WHEN p_tipo='SALIDA' THEN true ELSE NULL END,v_l.costo_unitario,CASE WHEN p_tipo='TRASLADO' THEN p_destino ELSE NULL END,p_operacion) RETURNING id_movimiento INTO v_mov;
 RETURN v_mov;
END $$;

-- Bandeja persistente: una alerta por destinatario, lote, vencimiento y transición.
CREATE OR REPLACE FUNCTION public.generar_alertas() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int;
BEGIN
 INSERT INTO public.notificacion(id_usuario,id_lote,tipo,mensaje,estado,clave_evento,destinatario_email,mensaje_correo,estado_correo)
 SELECT DISTINCT u.id_usuario,l.id_lote,'CADUCIDAD',
  p.nombre||' · Lote '||l.numero_lote||' · '||public.fn_estado_semaforo(l.fecha_vencimiento)||' · Vence '||l.fecha_vencimiento,
  'PENDIENTE',u.id_usuario||':'||l.id_lote||':'||l.fecha_vencimiento||':'||public.fn_estado_semaforo(l.fecha_vencimiento),u.email,
  p.nombre||' · Lote '||l.numero_lote||' · '||public.fn_estado_semaforo(l.fecha_vencimiento)||' · Vence '||l.fecha_vencimiento,
  CASE WHEN r.nombre='AUXILIAR' THEN 'NO_APLICA' ELSE 'PENDIENTE' END
 FROM public.lote l JOIN public.producto p USING(id_producto) JOIN public.inventario i USING(id_lote)
 JOIN public.bodega b USING(id_bodega) JOIN public.usuario u ON u.activo
 JOIN public.perfil r ON r.id_perfil=u.id_perfil
 WHERE i.stock_actual>0 AND public.fn_estado_semaforo(l.fecha_vencimiento) IN ('NARANJO','VENCIDO')
 AND (r.nombre='ADMIN' OR (u.id_sucursal=b.id_sucursal AND (r.nombre='BODEGUERO' OR (r.nombre='AUXILIAR' AND b.es_sala_ventas))))
 ON CONFLICT(clave_evento) DO NOTHING;
 GET DIAGNOSTICS v_total=ROW_COUNT;
 UPDATE public.inventario i SET estado_semaforo=public.fn_estado_semaforo(l.fecha_vencimiento) FROM public.lote l WHERE l.id_lote=i.id_lote;
 RETURN v_total;
END $$;
CREATE OR REPLACE FUNCTION public.reclamar_correos() RETURNS SETOF public.notificacion LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 RETURN QUERY UPDATE public.notificacion n SET estado_correo='PROCESANDO',proximo_intento=now()+interval '10 minutes',intentos_correo=intentos_correo+1
 WHERE n.id_notificacion IN (SELECT x.id_notificacion FROM public.notificacion x JOIN public.usuario u USING(id_usuario)
 WHERE u.activo AND x.estado_correo IN ('PENDIENTE','ERROR','PROCESANDO') AND x.proximo_intento<=now() AND x.intentos_correo<5
 ORDER BY x.id_notificacion LIMIT 50 FOR UPDATE OF x SKIP LOCKED) RETURNING n.*;
END $$;
REVOKE ALL ON FUNCTION public.recibir_lote(jsonb),public.operar_stock(int,int,text,uuid,text,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.recibir_lote(jsonb),public.operar_stock(int,int,text,uuid,text,int) TO authenticated;
REVOKE ALL ON FUNCTION public.generar_alertas(),public.reclamar_correos() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.generar_alertas(),public.reclamar_correos() TO service_role;
COMMIT;
