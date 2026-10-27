# Base real e interfaz de SIGAF

Fecha: 27 de octubre de 2026. Rama de trabajo: `front-isa`. Sin commit ni push.

## Estado real

La aplicación utiliza exclusivamente el proyecto Supabase `nkqxhpiagkcfvxbytarn`. Se inspeccionó su esquema existente y se aplicaron ocho migraciones, sin repetir el esquema inicial. Se importaron efectivamente 198 registros del ISP: el catálogo pasó de 16 a **214 productos**, sin registros sanitarios duplicados.

Se conservan 19 lotes, 19 existencias por lote/ubicación, 2.275 unidades físicas, 10 movimientos y 3 mermas. Antes de regenerar alertas se compararon también las huellas de las fichas y del historial original. La regeneración posterior actualizó los semáforos calculados, sin cambiar cantidades. Los umbrales existentes siguen en 7 días críticos, 30 preventivos y 0 de holgura. Todas las tablas públicas tienen RLS habilitada.

El Login conserva el formulario institucional. Se retiraron las tarjetas demo según la instrucción posterior de eliminar el acceso local. Las cuentas Auth existentes `admin@gmail.com` y `admin.sigaf@local.com` se vincularon, con autorización expresa, como Admin general de todas las sucursales. La segunda fue creada por el usuario. No se crearon cuentas desde las pruebas ni se cambiaron contraseñas. Los tres usuarios anteriores conservan su autoría histórica y aparecen como “Histórico · sin acceso”: una fila de usuario no equivale a una cuenta Auth.

La ubicación existente 3, “Sala de Ventas - Vitrina Prioritaria”, descrita como “Punto de Atención al Público”, quedó clasificada como sala de ventas para Dispensación. Las otras dos bodegas conservan su clasificación de almacenamiento; no se trasladó stock. Se generaron 14 alertas internas para los dos Admin reales, llegando a 22 notificaciones totales. No se enviaron correos ni se hicieron ventas, recepciones o bajas de prueba.

## Cambios, motivo y rol

| Cambio | Función y motivo | Roles |
| --- | --- | --- |
| Login institucional | Se eliminaron tarjetas, cuentas, firmas y endpoint temporales. La identidad procede de Supabase Auth y el rol de las tablas del proyecto. | Todos. |
| Una sola fuente de datos | Se retiraron el motor embebido, el catálogo mock, las semillas demo y la carpeta persistida `.sigaf-local`. Las consultas y operaciones utilizan Supabase. | Todos. |
| Configuración y fechas | Se eliminaron los umbrales de reemplazo y el reloj del dispositivo como fuente de fechas operativas. `contexto_sigaf` entrega fecha de Chile, hora PostgreSQL, opciones y tema. | Todos. |
| Filtros de acceso | Se mantienen filtros de rol y sucursal para las cuentas reales, además de RLS. Las consultas de usuarios excluyen hashes; la campana consulta al destinatario autenticado. | Admin, Bodeguero y Auxiliar, cada uno con su alcance. |
| Presentación | Selector con valores de `opcion_formulario` y alternativa Otro para transcribir el envase. Se conserva la presentación previa al editar una ficha. | Admin edita; los demás consultan. |
| Vida útil | Selector de plazos y entrada manual en meses. La ausencia del dato se guarda como NULL. No se inventa un vencimiento ni se confunde el plazo con la fecha del lote. | Admin. |
| Cantidad de recepción | Selector de cantidades y opción personalizada entera positiva. La cantidad se expresa en la presentación registrada; no convierte cajas a comprimidos. | Roles autorizados para recibir lotes. |
| Costo unitario | Formato visual chileno: 1000 → 1.000 y 1000000 → 1.000.000. Se envía el número correcto a Supabase; se admite coma para decimales. | Recepción de lotes. |
| Formularios reales | Se retiró la ventana “Vista previa del formulario”, la validación de borradores y la simulación de salidas/reposición. Guardar, recibir, operar o generar una emisión ejecuta el servicio real y muestra sus errores. | Según permisos existentes. |
| Perfil inferior | Nombre, iniciales, cargo y sucursal aparecen en la parte inferior izquierda. Conserva cierre de sesión y el control de contraseña anterior, cuyo traslado fue autorizado expresamente. | Todos. |
| Tres herramientas superiores | Campana, acceso a Mensajes y claro/oscuro. El tema se guarda en `preferencia_usuario`, sin una preferencia de apariencia local alternativa. | Todos. |
| Mensajes | Interfaz básica con equipos, selección de canal, estado vacío y envío deshabilitado. No inventa conversaciones ni contactos, y no almacena mensajes en el navegador. | Los tres roles actuales. Gerencia es solo una propuesta de canal. |
| Usuarios conectado | La API web llama a la función protegida `sigaf-usuarios`, desplegada en Supabase. Valida Auth y el rol ADMIN activo antes de listar, crear, editar o restablecer contraseñas. La clave privilegiada permanece en Supabase. | Solo Admin. |
| Autores históricos | Distingue registros sin Auth y deshabilita su edición para conservar la identidad de los responsables anteriores. | Admin consulta. |
| Dispensación | FEFO considera sucursal, sala, stock, vencimiento y holgura. Advierte si el lote previo está en otra sala. La confirmación utiliza una única operación real de stock. | Auxiliar y otros roles autorizados. |

Se conservan las paletas actuales por rol y las mejoras anteriores de inventario, detalles, informes, filtros y accesibilidad.

Los estados transitorios necesarios para escribir un formulario, filtrar una tabla o abrir un menú siguen siendo estados de interfaz. No constituyen una base local ni sustituyen datos persistidos. Las cookies de Supabase transportan la sesión autenticada.

El catálogo ISP puede contener nombres iguales con registros sanitarios diferentes. La selección de producto en recepción y la lista de dispensación muestran también el registro ISP para distinguirlos; la búsqueda de dispensación admite ese registro. No se fusionan fichas por coincidencia de nombre.

## Catálogo oficial importado

Fuente: [Consulta de productos registrados del ISP](https://registrosanitario.ispch.gob.cl/). Se consultó el estado Vigente el 27-10-2026 y se extrajeron los resultados de la primera página de ocho búsquedas por nombre.

| Búsqueda | Registros válidos extraídos |
| --- | ---: |
| Amoxicilina | 24 |
| Cetirizina | 25 |
| Ibuprofeno | 25 |
| Loratadina | 24 |
| Losartán | 25 |
| Metformina | 25 |
| Omeprazol | 25 |
| Paracetamol | 25 |
| Total de registros sanitarios distintos | 198 |

Se conservan nombre, registro sanitario, principio activo, titular y fecha de registro. La procedencia, el estado observado y la fecha de consulta quedaron guardados junto al producto. La fecha de importación fue generada por PostgreSQL al ejecutar el archivo. Los 198 registros se añadieron a los 16 productos anteriores: total real comprobado de 214.

No se obtuvo del listado el GTIN del envase, presentación comercial de conteo, vida útil autorizada, precio, lote o existencias. Esos campos no se fabrican. GTIN, presentación y vida útil quedan NULL; no se insertan filas de inventario o lote. Antes de recibir stock se debe completar la presentación de la ficha.

La importación omite registros sanitarios ya existentes, conserva los productos previos y puede repetirse sin duplicar la selección. No representa todos los medicamentos del ISP ni una verificación continua de vigencia.

Archivos de procedencia y migraciones aplicadas:

- `supabase/importaciones/2026-10-27_catalogo_isp.sql`: incorporación transaccional de los registros que falten.
- `supabase/importaciones/2026-10-27_procedencia_isp.json`: fuente, filtros y huellas de integridad.
- `supabase/migrations/005_contexto_y_preferencias.sql`: reloj PostgreSQL, opciones de formularios y preferencia privada de tema.
- `supabase/migrations/006_procedencia_catalogo_isp.sql`: campos de procedencia del catálogo.
- `supabase/migrations/20261027065931_seguridad_cuentas_reales.sql`: helpers privados, alertas solo a cuentas Auth reales, fechas de Chile e índices de claves foráneas.
- `supabase/migrations/20261027072035_optimizar_politicas_sesion.sql`: evalúa Auth una vez por consulta, conservando los mismos permisos.
- `supabase/migrations/20261027205509_proteger_ultimo_admin_real.sql`: un autor histórico sin cuenta Auth no cuenta como respaldo del último Admin real.
- `supabase/aplicacion-remota-2026-10-27.json`: correspondencia entre archivos locales e historial remoto. No usar `db push` sin conciliar previamente nombres/versiones.

El SQL es material para importar a Supabase. La aplicación no lo lee como catálogo local ni lo utiliza cuando falla una consulta.

## Comprobaciones realizadas

- 52 pruebas automatizadas aprobadas, incluida la importación repetida de los 198 registros sin duplicados, sin GTIN/presentación/vida útil inventados y sin crear stock, y la protección del último Admin real aunque existan autores Admin históricos.
- Pruebas de PostgreSQL para aislamiento de preferencias por usuario, contexto de fechas, RLS, recepción, FEFO, traslados, mermas e idempotencia. Se ejecutan en un entorno aislado de pruebas, no en Supabase.
- Revisión de código, tipos y compilación de producción correctos.
- Función desplegada: sin sesión 401; token inválido 401; método HTTP no permitido 405. No se probaron altas ni cambios de contraseña sobre la base compartida.
- En navegador, Login institucional y dashboard con acceso Admin general y 2.275 unidades reales; el usuario inició sesión con su cuenta nueva.
- Navegación real verificada en Inventario (19 registros), Productos (214), Lotes (19), Movimientos (10), Alertas (7 de la cuenta), Usuarios (2 cuentas y 3 históricos), Configuración (3 sucursales), Dispensación, Reportes y Mensajes, sin errores de lectura. El informe mostró 19 filas al seleccionar la farmacia, con exportación habilitada; no se emitió un informe de prueba.
- Se comprobó en navegador que los campos manuales aparecen, el costo 1000000 se muestra como 1.000.000 y la recepción toma la fecha de PostgreSQL. No se guardaron formularios de prueba.
- El modo oscuro persistió después de recargar y su preferencia se verificó en Supabase; se restauró el modo claro original. El perfil inferior conserva el control de contraseña sin ejecutarlo. Mensajes mantiene el envío deshabilitado.
- No se cambiaron contraseñas ni se crearon cuentas reales durante las comprobaciones.
- Las escrituras operativas y los accesos reales de Bodeguero/Auxiliar deben verificarse con cuentas y datos acordados con el equipo. Las pruebas aisladas ya cubren sus permisos; no se crearon identidades ni saldos de prueba en el servicio compartido.

## Seguridad y funciones externas pendientes

La función `sigaf-usuarios`, versión 1 activa, fue desplegada con autorización expresa. Verifica el JWT con Supabase Auth dentro de la función y consulta el rol/estado actual de la cuenta antes de crear el cliente privilegiado. No confía en user_metadata ni en el rol del navegador. El servidor web también valida sesión y rol. Usuarios no necesita una clave administrativa en `.env.local`.

Las altas validan roles, sucursales, correos y contraseñas; si falla el perfil se compensa únicamente la cuenta recién creada. La edición impide desactivar o cambiar el rol del propio Admin. La protección del último Admin exige otro Admin activo vinculado a una cuenta Auth confirmada; un autor histórico no sirve como respaldo. Los restablecimientos requieren una cuenta Auth perteneciente a SIGAF. Nunca se devuelven hashes o claves.

Los helpers internos se trasladaron a un esquema no expuesto. Los dos RPC de recepción/stock mantienen privilegios elevados deliberadamente para ejecutar operaciones atómicas, con validación de identidad, rol, sucursal y datos. La cola de correo no tiene políticas de cliente porque es exclusiva del servicio.

La revisión de Supabase no muestra errores de RLS ni advertencias de rendimiento por Auth. Permanecen avisos sobre los dos RPC elevados intencionales, la cola exclusiva del servidor e índices todavía sin uso. Auth informa que la protección de contraseñas filtradas está desactivada: revisarla antes de producción en la configuración de Supabase, sin cambiar contraseñas ni contratar planes automáticamente.

Pendientes:

1. Entrega automática de correo: configurar Resend, remitente verificado, secreto y programación de cron mediante el entorno seguro. La cola y las notificaciones internas están conectadas; no se enviaron correos.
2. Mensajes sigue siendo solo interfaz, con envío deshabilitado, según lo solicitado.
3. Completar la presentación y otros atributos verificables del envase antes de operar con las fichas importadas. Catálogo importado no equivale a stock recibido ni disponibilidad comercial.
4. Verificar escrituras operativas con cuentas/datos reales acordados con el equipo.

## Coherencia de los roles

| Rol actual | Alcance | Responsabilidad |
| --- | --- | --- |
| Admin | Todas las sucursales del proyecto. | Configuración general, catálogo, cuentas, reportes y supervisión operativa. |
| Bodeguero | Sucursal asignada. | Recepción, existencias, traslados y bajas justificadas. |
| Auxiliar | Sucursal asignada; salidas desde salas de ventas clasificadas. | Consulta y dispensación con FEFO. No administra cuentas ni configuración. |

Los tres roles son coherentes si la administración central supervisa directamente las sucursales. Para delegar la gestión de cada local conviene un cuarto rol **Gerente de sucursal**, con reportes y supervisión limitados a su sucursal, sin otorgar Admin global. Con el modelo actual no conviene dar Admin a cada encargado local.

“Farmacia principal” puede ser una ubicación física. La autoridad del Admin procede de su permiso global, no de trabajar allí. Un rol informático tampoco acredita por sí mismo una habilitación profesional farmacéutica.

La mensajería queda intencionalmente como interfaz. No se creó un rol Gerente: decidirlo requiere una matriz de permisos y un ámbito de sucursal antes de extenderlo al servidor y a la base.

Las instrucciones de arranque vigentes están en `docs/puesta-en-marcha.md`. Los informes de fases anteriores se mantienen como antecedentes y no describen el acceso actual.
