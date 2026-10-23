-- EXCLUSIVO del PostgreSQL local de desarrollo. No aplicar en Supabase.
-- Se ejecuta una sola vez, con fechas relativas y trazabilidad consistente.
INSERT INTO perfil(nombre,descripcion) VALUES
 ('ADMIN','Administración'),('BODEGUERO','Logística e inventario'),('AUXILIAR','Dispensación');
INSERT INTO farmacia(razon_social,rut,direccion,director_tecnico) VALUES
 ('Farmacia SIGAF · Ejemplo local','LOCAL-DEMO','Dirección de ejemplo','Responsable de ejemplo');
INSERT INTO sucursal(nombre,direccion,id_farmacia) VALUES ('Sucursal Central','Ubicación de ejemplo',1);
INSERT INTO bodega(nombre,ubicacion,id_sucursal,es_sala_ventas) VALUES
 ('Sala de ventas','Estantería principal',1,true),('Bodega general','Almacén A',1,false),('Refrigerados','Cámara de frío',1,false);
INSERT INTO usuario(id_usuario,nombre,email,id_perfil,id_sucursal) VALUES
 ('10000000-0000-4000-8000-000000000001','Administrador local','admin@sigaf.local',1,NULL),
 ('10000000-0000-4000-8000-000000000002','Bodeguero local','bodega@sigaf.local',2,1),
 ('10000000-0000-4000-8000-000000000003','Auxiliar local','auxiliar@sigaf.local',3,1);
INSERT INTO categoria(nombre,descripcion) VALUES
 ('Analgésicos','Catálogo de ejemplo'),('Cuidado digestivo','Catálogo de ejemplo'),('Primeros auxilios','Catálogo de ejemplo');
INSERT INTO producto(nombre,descripcion,unidad_medida,id_categoria,principio_activo) VALUES
 ('Paracetamol 500 mg','Producto ilustrativo; no constituye ficha sanitaria','caja',1,'Paracetamol'),
 ('Ibuprofeno 400 mg','Producto ilustrativo; no constituye ficha sanitaria','caja',1,'Ibuprofeno'),
 ('Omeprazol 20 mg','Producto ilustrativo; no constituye ficha sanitaria','caja',2,'Omeprazol'),
 ('Suero fisiológico','Producto de ejemplo','unidad',3,NULL),
 ('Gasas estériles','Producto de ejemplo','paquete',3,NULL),
 ('Sales de rehidratación','Producto de ejemplo','sobre',2,NULL);
DO $$ DECLARE
  ejemplo record; lote_id int; inv_id int; mes int;
  actor uuid := '10000000-0000-4000-8000-000000000002';
BEGIN
 FOR ejemplo IN SELECT * FROM (VALUES
   (1,1,12,140,650),(1,2,120,220,650),(2,1,35,85,980),(2,2,75,160,980),
   (3,1,65,95,1200),(3,2,180,180,1200),(4,3,210,70,750),
   (5,2,150,110,450),(6,1,85,60,380),(6,2,-8,25,380)
 ) AS x(producto,bodega,dias,stock,costo) LOOP
   INSERT INTO lote(numero_lote,fecha_vencimiento,fecha_ingreso,id_producto,costo_unitario)
    VALUES ('LOCAL-'||ejemplo.producto||'-'||ejemplo.bodega,hoy_chile()+ejemplo.dias,hoy_chile()-180,ejemplo.producto,ejemplo.costo) RETURNING id_lote INTO lote_id;
   INSERT INTO inventario(id_lote,id_bodega,stock_actual,estado_semaforo)
    VALUES(lote_id,ejemplo.bodega,ejemplo.stock,fn_estado_semaforo(hoy_chile()+ejemplo.dias)) RETURNING id_inventario INTO inv_id;
   -- 6 entradas y salidas + 6 mermas: suma auditada = stock disponible.
   INSERT INTO movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,fecha,costo_unitario,motivo)
    VALUES(inv_id,actor,'ENTRADA',ejemplo.stock+42,(hoy_chile()-180)::timestamp,ejemplo.costo,'Saldo inicial · ejemplo local');
   FOR mes IN 0..5 LOOP
     INSERT INTO movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,fecha,costo_unitario,cumple_fefo,motivo)
      VALUES(inv_id,actor,'SALIDA',5,(hoy_chile()-make_interval(months=>mes))::timestamp,ejemplo.costo,true,'Salida histórica · ejemplo local');
     INSERT INTO movimiento_inventario(id_inventario,id_usuario,tipo_movimiento,cantidad,fecha,costo_unitario,motivo)
      VALUES(inv_id,actor,'MERMA',2,(hoy_chile()-make_interval(months=>mes))::timestamp,ejemplo.costo,'DETERIORO');
     INSERT INTO merma(id_inventario,id_usuario,motivo,cantidad,fecha_baja,costo_unitario)
      VALUES(inv_id,actor,'DETERIORO',2,(hoy_chile()-make_interval(months=>mes))::date,ejemplo.costo);
   END LOOP;
 END LOOP;
END $$;
-- Alertas in-app de ejemplo: nunca se envían correos desde esta base local.
INSERT INTO notificacion(id_usuario,tipo,mensaje,estado,id_lote,estado_correo,clave_evento)
 SELECT u.id_usuario,'CADUCIDAD',
  'Ejemplo local · '||p.nombre||' · Lote '||l.numero_lote||' · vence '||l.fecha_vencimiento,
  'PENDIENTE',l.id_lote,'NO_APLICA','local-inicial:'||u.id_usuario||':'||l.id_lote
 FROM usuario u CROSS JOIN lote l JOIN producto p USING(id_producto)
 WHERE l.fecha_vencimiento<=hoy_chile()+90;
