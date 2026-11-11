# Datos de demostración para el video — 10 de noviembre de 2026

Actualización posterior: a petición del usuario, las 198 fichas importadas también recibieron identificadores internos, categorías y presentaciones referenciales. El estado actual está en [Catálogo referencial](catalogo-referencial-2026-11-10.md). El apartado de conservación de esta carga describe el estado anterior a esa segunda operación.

## Carga aplicada en Supabase

Autorización del usuario: agregar registros DEMO, códigos internos y costos de referencia, conservando los registros reales. Proyecto nkqxhpiagkcfvxbytarn. Son datos ficticios de presentación, no medicamentos comerciales acreditados, precios de mercado ni una importación ISP.

Se añadieron seis productos, treinta y ocho lotes, treinta y ocho entradas de carga administrativa y cuatro ubicaciones DEMO. La persona responsable indicada es el Admin que solicitó la carga; el motivo de cada entrada identifica que fue una carga administrativa de demostración realizada por el asistente. No se simularon credenciales ni se modificaron roles/RLS.

| Sucursal existente | Productos DEMO | Lotes DEMO | Unidades de conteo | Valor referencial CLP |
|---|---:|---:|---:|---:|
| Central (Santiago Centro) | 6 | 19 | 640 | 1.306.000 |
| Providencia | 6 | 19 | 640 | 1.306.000 |

En cada sucursal hay una Sala de ventas DEMO y una Bodega seca DEMO. Maipú se conserva como estaba. Los productos son comunes al catálogo; no se duplican por sucursal. Cada lote añadido tiene una existencia y una entrada coherente con su cantidad y costo.

| Producto DEMO | Código interno | Presentación de conteo | Costo referencial por presentación CLP |
|---|---|---|---:|
| Diclofenaco sódico 100 mg LP | DEMO-VIDEO-20261110-DIC | Caja x 8 cápsulas | 2.500 |
| Paracetamol 500 mg | DEMO-VIDEO-20261110-PAR | Caja x 16 comprimidos | 1.500 |
| Ibuprofeno 400 mg | DEMO-VIDEO-20261110-IBU | Caja x 20 cápsulas | 1.800 |
| Loratadina 10 mg | DEMO-VIDEO-20261110-LOR | Caja x 10 comprimidos | 1.200 |
| Losartán potásico 50 mg | DEMO-VIDEO-20261110-LOS | Caja x 30 comprimidos | 3.000 |
| Omeprazol 20 mg | DEMO-VIDEO-20261110-OME | Caja x 28 cápsulas | 2.200 |

Son identificadores internos aceptados por el lector/búsqueda, no GTIN/EAN asignados a fabricantes. Un código impreso en una caja comercial real no identificará automáticamente estas fichas DEMO. No se inventó un registro ISP ni una fecha de fabricación; la vida útil autorizada se deja sin informar. El nombre, la descripción, el lote y la ubicación identifican la simulación.

## Fechas y FEFO

| Vencimiento | Distribución total | Estado al 10-11-2026 |
|---|---|---|
| 15-11-2026 | 2 lotes de Diclofenaco, 10 cajas por sucursal, sala de ventas | Crítico (5 días) |
| 30-11-2026 | 12 lotes, 20 cajas por producto/sucursal, sala de ventas | Preventivo (20 días) |
| 30-01-2027 | 12 lotes, 35 cajas por producto/sucursal, sala de ventas | Vigente |
| 30-04-2027 | 12 lotes, 50 cajas por producto/sucursal, bodega seca | Vigente |

Las tres fechas principales tienen separación de dos y tres meses. Recepción: 10-11-2026. El semáforo depende del día actual de Chile, por lo que cambiará con el tiempo; no se congeló el reloj de la web. Para grabar en otra fecha revisar antes la aptitud de los lotes.

## Recorrido recomendado para grabar

1. Entrar como Admin. En Productos buscar DEMO y abrir Diclofenaco; mostrar código interno y presentación.
2. En Inventario buscar DEMO. Se obtienen 38 existencias en dos sucursales. Alternar Bodega entre CEN y PRO para mostrar los dos alcances.
3. En Lotes buscar DEMO-V261110-DIC para comparar las cuatro fechas por sucursal. Mostrar las cantidades y abrir el detalle para ver costos conocidos.
4. En Dispensación seleccionar DEMO - Diclofenaco sodico 100 mg LP y la Sala de ventas DEMO de Providencia. Al 10 de noviembre, FEFO debe recomendar el lote DEMO-V261110-DIC-PRO-L00, que vence el 15 de noviembre, antes que los del 30 de noviembre y 30 de enero. No hace falta confirmar una salida para explicar la recomendación.
5. En Reportes seleccionar la farmacia y Providencia para una valoración íntegramente conocida de los datos nuevos: 640 unidades de conteo y 1.306.000 CLP de referencia, si no se han registrado nuevas operaciones desde la carga. Seleccionar Ver todo si los filtros de fechas excluyen lotes.

Estos datos están en la base conectada y por ello afectan dashboard, inventario, reportes y futuros resúmenes de caducidad. No se invocó el generador de notificaciones ni se enviaron correos manualmente. Los empleados conservan su sucursal asignada: no se amplió su acceso a Providencia; Admin puede mostrar ambas.

## Verificación y conservación

Antes: 215 productos, 19 lotes, 2.275 unidades y 10 movimientos. Después de la carga: 221 productos, 57 lotes, 3.555 unidades y 48 movimientos. Todas las huellas de los productos, lotes, inventarios, movimientos y bodegas anteriores coinciden con las tomadas antes de la carga.

Las 198 fichas ISP sin código y los 19 lotes originales sin costo continúan sin esos datos, por la autorización de conservar datos reales. Para completarlos hacen falta envases y documentos reales. En reportes que mezclen esos lotes antiguos puede seguir apareciendo valoración parcial; Providencia permite mostrar el escenario nuevo completo.

El archivo supabase/datos-demostracion/video-2026-11-10.sql es una carga de datos, no una migración. Incluye transacción, bloqueo breve, comprobaciones de integridad y repetición sin duplicar ni reponer stock. La prueba tests/datos-video.test.mjs verifica el esquema operativo aislado, fechas, cantidades, valoración y conservación de los registros anteriores. No se modificó código de aplicación ni dependencias para mostrar los datos.

No se ejecutó una limpieza ni se añadieron borrados automáticos: si se retiran después, revisar primero salidas, mermas, notificaciones y reportes que hagan referencia a estos registros. No eliminar por coincidencia genérica de nombre.

## Evidencia final

88 pruebas automatizadas aprobadas. En la web con sesión Admin, Inventario filtrado por DEMO mostró 38 existencias; el selector incluyó las cuatro ubicaciones nuevas. En Dispensación se seleccionó el producto 216 (Diclofenaco DEMO) y la Sala de ventas de Providencia (ubicación 7): se recomendó DEMO-V261110-DIC-PRO-L00, con 10 cajas y vencimiento 15/11/2026. Se guardó captura y se dejó abierta esa recomendación. No se confirmó una salida ni se emitió un reporte durante la comprobación visual.
