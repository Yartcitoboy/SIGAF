-- DATOS DEMO AUTORIZADOS PARA EL VIDEO. No es una migración de esquema.
-- Proyecto revisado: nkqxhpiagkcfvxbytarn. Ejecutar solo con acceso administrativo.
-- Inserta registros nuevos e identificados. Nunca rellena GTIN/costos reales desconocidos.
-- Carga administrativa solicitada por el Admin responsable; no simula una sesión Auth.
-- Idempotente: una segunda ejecución valida las referencias y no repone stock consumido.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SELECT pg_advisory_xact_lock(73421110);
LOCK TABLE public.producto,public.lote,public.inventario,public.movimiento_inventario,public.bodega IN SHARE ROW EXCLUSIVE MODE;

DO $demo_video$
DECLARE
  v_actor uuid := '16da4ad2-f4ce-4e6c-b77b-8f2d78097f87';
  v_ref date := DATE '2026-11-10';
  v_producto int; v_bodega int; v_lote int; v_inventario int;
  v_codigo text; v_clave uuid; v_fecha date; v_cantidad int;
  v_antes jsonb; v_despues jsonb;
  p record; s record; f record; b record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.usuario u JOIN public.perfil r USING(id_perfil)
     JOIN auth.users a ON a.id=u.id_usuario AND a.deleted_at IS NULL
     WHERE u.id_usuario=v_actor AND u.activo AND r.nombre='ADMIN') THEN
    RAISE EXCEPTION 'El responsable de la carga DEMO no es un Admin activo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.sucursal WHERE id_sucursal=1 AND id_farmacia=1)
     OR NOT EXISTS (SELECT 1 FROM public.sucursal WHERE id_sucursal=2 AND id_farmacia=1) THEN
    RAISE EXCEPTION 'Revisar las sucursales Central y Providencia antes de cargar';
  END IF;
  IF public.hoy_chile() < v_ref THEN RAISE EXCEPTION 'No registrar una recepción futura'; END IF;
  IF public.hoy_chile() >= v_ref+5 AND NOT EXISTS (
     SELECT 1 FROM public.lote WHERE numero_lote='DEMO-V261110-DIC-CEN-L00') THEN
    RAISE EXCEPTION 'La primera carga ya incluiría lotes caducados: preparar nuevas fechas';
  END IF;

  -- Huellas de los registros ajenos a esta carga: deben permanecer idénticas.
  SELECT jsonb_build_object(
    'producto',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_producto)::text,'[]')) FROM public.producto x WHERE codigo_barras IS NULL OR codigo_barras NOT LIKE 'DEMO-VIDEO-20261110-%'),
    'lote',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_lote)::text,'[]')) FROM public.lote x WHERE numero_lote NOT LIKE 'DEMO-V261110-%'),
    'inventario',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_inventario)::text,'[]')) FROM public.inventario x JOIN public.lote l USING(id_lote) WHERE l.numero_lote NOT LIKE 'DEMO-V261110-%'),
    'movimiento',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_movimiento)::text,'[]')) FROM public.movimiento_inventario x WHERE motivo IS DISTINCT FROM 'DEMO VIDEO 2026-11-10: carga administrativa autorizada; costos y cantidades referenciales.'),
    'bodega',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_bodega)::text,'[]')) FROM public.bodega x WHERE nombre NOT LIKE 'DEMO VIDEO 20261110%')
  ) INTO v_antes;

  FOR s IN SELECT * FROM (VALUES (1,'CEN'),(2,'PRO')) AS x(id_sucursal,codigo) LOOP
    FOR b IN SELECT * FROM (VALUES (false,'Bodega seca'),(true,'Sala de ventas')) AS x(es_sala,nombre) LOOP
      INSERT INTO public.bodega(nombre,ubicacion,id_sucursal,es_sala_ventas)
      SELECT 'DEMO VIDEO 20261110 - '||s.codigo||' - '||b.nombre,
             'SIMULACION para video y QA; existencias y costos referenciales.',s.id_sucursal,b.es_sala
      WHERE NOT EXISTS (SELECT 1 FROM public.bodega WHERE nombre='DEMO VIDEO 20261110 - '||s.codigo||' - '||b.nombre);
      IF (SELECT count(*) FROM public.bodega WHERE nombre='DEMO VIDEO 20261110 - '||s.codigo||' - '||b.nombre
           AND id_sucursal=s.id_sucursal AND es_sala_ventas=b.es_sala) <> 1 THEN
        RAISE EXCEPTION 'La ubicación DEMO ya existe con otra definición';
      END IF;
    END LOOP;
  END LOOP;

  FOR p IN SELECT * FROM (VALUES
    ('DIC','DEMO - Diclofenaco sodico 100 mg LP','Diclofenaco sodico','Caja x 8 capsulas',1,2500),
    ('PAR','DEMO - Paracetamol 500 mg','Paracetamol','Caja x 16 comprimidos',1,1500),
    ('IBU','DEMO - Ibuprofeno 400 mg','Ibuprofeno','Caja x 20 capsulas',1,1800),
    ('LOR','DEMO - Loratadina 10 mg','Loratadina','Caja x 10 comprimidos',4,1200),
    ('LOS','DEMO - Losartan potasico 50 mg','Losartan potasico','Caja x 30 comprimidos',3,3000),
    ('OME','DEMO - Omeprazol 20 mg','Omeprazol','Caja x 28 capsulas',5,2200)
  ) AS x(codigo,nombre,principio,presentacion,categoria,costo) LOOP
    INSERT INTO public.producto(codigo_barras,nombre,descripcion,unidad_medida,id_categoria,principio_activo)
    VALUES ('DEMO-VIDEO-20261110-'||p.codigo,p.nombre,
      'SIMULACION para video/QA. Codigo interno, cantidades y costos de referencia; no identifica un medicamento comercial ni acredita registro ISP.',
      p.presentacion,p.categoria,p.principio)
    ON CONFLICT(codigo_barras) DO NOTHING;
    SELECT id_producto INTO v_producto FROM public.producto
      WHERE codigo_barras='DEMO-VIDEO-20261110-'||p.codigo
      AND nombre=p.nombre AND unidad_medida=p.presentacion AND id_categoria=p.categoria;
    IF v_producto IS NULL THEN RAISE EXCEPTION 'El código interno DEMO corresponde a otra ficha'; END IF;

    FOR s IN SELECT * FROM (VALUES (1,'CEN'),(2,'PRO')) AS x(id_sucursal,codigo) LOOP
      FOR f IN SELECT * FROM (VALUES
        ('L00',0,5,10,true),
        ('L01',0,20,20,true),
        ('L02',2,20,35,true),
        ('L03',5,20,50,false)
      ) AS x(codigo,meses,dias,cantidad,sala) LOOP
        CONTINUE WHEN f.codigo='L00' AND p.codigo<>'DIC';
        v_fecha := (v_ref+make_interval(months=>f.meses))::date+f.dias;
        v_cantidad := f.cantidad;
        v_codigo := 'DEMO-V261110-'||p.codigo||'-'||s.codigo||'-'||f.codigo;
        v_clave := md5('SIGAF-VIDEO-20261110:'||v_codigo)::uuid;
        SELECT id_bodega INTO STRICT v_bodega FROM public.bodega
          WHERE nombre='DEMO VIDEO 20261110 - '||s.codigo||' - '||CASE WHEN f.sala THEN 'Sala de ventas' ELSE 'Bodega seca' END
          AND id_sucursal=s.id_sucursal AND es_sala_ventas=f.sala;
        SELECT id_lote INTO v_lote FROM public.lote WHERE numero_lote=v_codigo AND id_producto=v_producto;
        IF v_lote IS NOT NULL THEN
          IF NOT EXISTS (SELECT 1 FROM public.lote WHERE id_lote=v_lote AND fecha_vencimiento=v_fecha AND costo_unitario=p.costo)
            OR (SELECT count(*) FROM public.inventario WHERE id_lote=v_lote AND id_bodega=v_bodega) <> 1
            OR NOT EXISTS (SELECT 1 FROM public.movimiento_inventario m JOIN public.inventario i USING(id_inventario)
              WHERE i.id_lote=v_lote AND i.id_bodega=v_bodega AND m.clave_operacion=v_clave AND m.tipo_movimiento='ENTRADA' AND m.cantidad=v_cantidad) THEN
            RAISE EXCEPTION 'El lote DEMO % existe con datos distintos o incompletos; no se repone stock',v_codigo;
          END IF;
          CONTINUE;
        END IF;
        INSERT INTO public.lote(numero_lote,fecha_vencimiento,fecha_ingreso,id_producto,costo_unitario)
          VALUES(v_codigo,v_fecha,v_ref,v_producto,p.costo) RETURNING id_lote INTO v_lote;
        INSERT INTO public.inventario(id_lote,id_bodega,stock_actual,estado_semaforo)
          VALUES(v_lote,v_bodega,v_cantidad,public.fn_estado_semaforo(v_fecha)) RETURNING id_inventario INTO v_inventario;
        INSERT INTO public.movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,fecha,motivo,costo_unitario,clave_operacion)
          VALUES(v_inventario,v_actor,'ENTRADA',v_cantidad,now() AT TIME ZONE 'America/Santiago',
            'DEMO VIDEO 2026-11-10: carga administrativa autorizada; costos y cantidades referenciales.',p.costo,v_clave);
      END LOOP;
    END LOOP;
  END LOOP;

  IF (SELECT count(*) FROM public.producto WHERE codigo_barras LIKE 'DEMO-VIDEO-20261110-%')<>6
     OR (SELECT count(*) FROM public.lote WHERE numero_lote LIKE 'DEMO-V261110-%')<>38 THEN
    RAISE EXCEPTION 'La carga DEMO no tiene los seis productos y treinta y ocho lotes esperados';
  END IF;
  SELECT jsonb_build_object(
    'producto',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_producto)::text,'[]')) FROM public.producto x WHERE codigo_barras IS NULL OR codigo_barras NOT LIKE 'DEMO-VIDEO-20261110-%'),
    'lote',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_lote)::text,'[]')) FROM public.lote x WHERE numero_lote NOT LIKE 'DEMO-V261110-%'),
    'inventario',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_inventario)::text,'[]')) FROM public.inventario x JOIN public.lote l USING(id_lote) WHERE l.numero_lote NOT LIKE 'DEMO-V261110-%'),
    'movimiento',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_movimiento)::text,'[]')) FROM public.movimiento_inventario x WHERE motivo IS DISTINCT FROM 'DEMO VIDEO 2026-11-10: carga administrativa autorizada; costos y cantidades referenciales.'),
    'bodega',(SELECT md5(coalesce(jsonb_agg(to_jsonb(x) ORDER BY id_bodega)::text,'[]')) FROM public.bodega x WHERE nombre NOT LIKE 'DEMO VIDEO 20261110%')
  ) INTO v_despues;
  IF v_antes IS DISTINCT FROM v_despues THEN
    RAISE EXCEPTION 'Se modificaron registros ajenos a la carga DEMO; se cancela';
  END IF;
END $demo_video$;

SELECT p.codigo_barras,p.nombre,s.nombre AS sucursal,l.numero_lote,l.fecha_vencimiento,
  i.stock_actual,l.costo_unitario,public.fn_estado_semaforo(l.fecha_vencimiento) AS semaforo
FROM public.producto p JOIN public.lote l USING(id_producto) JOIN public.inventario i USING(id_lote)
JOIN public.bodega b USING(id_bodega) JOIN public.sucursal s USING(id_sucursal)
WHERE p.codigo_barras LIKE 'DEMO-VIDEO-20261110-%'
ORDER BY p.codigo_barras,s.id_sucursal,l.fecha_vencimiento;
COMMIT;
