# Alertas de caducidad y correo Gmail de SIGAF

30 de octubre de 2026. Rama `front-isa`; sin commit ni push.

## Qué está implementado

Se conectaron dos servicios: la API de Gmail de Google para enviar desde una cuenta existente y la API de Alertas de SIGAF/Supabase para revisar lotes, confirmar destinatarios, preparar resúmenes y registrar resultados. El proveedor elegido por el usuario es Gmail; el envío anterior preparado con Resend quedó retirado.

La programación está instalada y activa en Supabase. Funciona sin el computador del usuario ni la web local encendidos. El primer corte configurado es el **31-10-2026 a las 00:00, America/Santiago**. La tarea comprueba el reloj PostgreSQL cada minuto y prepara un corte por fecha local, independientemente de que Chile use UTC−3 o UTC−4. El día en que el horario de verano salta de 23:59 a 01:00, se procesa en el primer minuto válido del nuevo día. Si Supabase está detenido, al reanudarse procesa el día actual; no envía en bloque resúmenes de días anteriores.

El cliente OAuth introducido por el usuario ya quedó guardado en Vault. El envío real todavía requiere la autorización del Gmail remitente y destinatarios confirmados. La instalación no creó un buzón Google ni supone que se haya autorizado una cuenta. No se enviaron correos durante las pruebas.

## Qué recibe cada rol

| Rol | Alcance del resumen |
| --- | --- |
| Admin | Todas las sucursales del proyecto. |
| Bodeguero | Bodegas y salas de su sucursal asignada. |
| Auxiliar | Salas de ventas clasificadas de su sucursal. |

Cada persona recibe un resumen por día cuando existan alertas en su alcance. Incluye producto, registro ISP cuando existe, lote, vencimiento, días restantes, existencias, presentación, sucursal y ubicación. Considera caducados, vencen hoy, críticos y preventivos; excluye existencias en cero y vencimientos fuera del umbral preventivo. Se conserva la política real: 7 días críticos y 30 preventivos. No modifica lotes, ventas, mermas ni cantidades.

Los avisos internos se generan también para cuentas cuyo correo todavía no está confirmado. Leer un aviso no elimina su causa ni cancela el resumen del día siguiente. El correo se calcula con todos los lotes relevantes de ese corte, aunque no haya nuevas notificaciones o algunas ya estén leídas. Los valores del correo son una fotografía del corte; el usuario debe consultar SIGAF para conocer el stock actual.

## Correos reales y confirmación

Escribir `persona@gmail.com` en Usuarios no crea esa cuenta en Google y no prueba que el buzón exista. Un correo `@local.com` usado como acceso de prueba de SIGAF tampoco se transforma en Gmail. Las nuevas altas y cambios de correo rechazan direcciones de prueba y formatos inválidos tanto en el formulario como en la función protegida de Usuarios.

Los accesos existentes con direcciones de prueba se conservan. Admin debe cambiar su correo desde Usuarios por el buzón real de la persona. Los responsables históricos se conservan sin convertirlos en cuentas nuevas. Los correos institucionales, incluido Google Workspace, son admitidos si la persona confirma que los recibe; no se afirma que un dominio pertenezca a Google solo por su formato.

Una vez conectado Gmail, cada persona abre Alertas o Perfil → Correo de alertas, solicita un código y lo introduce en su propia sesión. Admin también puede solicitar el código para una persona del equipo; esa persona lo confirma en su sesión. El código vence en 15 minutos, tiene hasta 5 intentos, un solo uso y un mínimo de un minuto entre solicitudes. Se almacena únicamente su huella, nunca el código en texto. Cambiar el correo invalida su confirmación y los envíos pendientes del destino anterior. Confirmarlo no cambia la contraseña de SIGAF.

## Cómo activar el Gmail remitente

El sistema de correo requiere una conexión de aplicación con Google. Haber iniciado sesión en SIGAF o tener una cuenta Google verificada no sustituye esta conexión.

1. En [Google Cloud](https://console.cloud.google.com/), seleccionar o crear el proyecto de SIGAF y habilitar **Gmail API** en APIs y servicios.
2. Configurar Google Auth Platform/pantalla de consentimiento. Durante las pruebas, añadir la cuenta remitente como usuario de prueba si la aplicación es externa y está en modo Testing.
3. Crear un cliente OAuth de tipo **Aplicación web**. Registrar exactamente esta URI de redirección autorizada:

   `https://nkqxhpiagkcfvxbytarn.supabase.co/functions/v1/sigaf-alertas?oauth=callback`

4. En SIGAF, entrar como Admin y abrir Alertas → Gmail y envío diario · Administración. Introducir el **ID del cliente** y el **secreto del cliente** en ese formulario. No pegarlos en el chat ni añadir el secreto a Git. Guardar la configuración.
5. Pulsar **Conectar o renovar Gmail** y después **Continuar en Google**. La persona dueña del Gmail debe seleccionar la cuenta remitente y autorizar el envío en Google. SIGAF no solicita su contraseña.
6. Al recibir el mensaje de conexión completada, cerrar esa pestaña y volver a Alertas. Debe mostrarse el Gmail remitente vinculado y el envío activo. La pantalla vuelve a consultar el estado cada 30 segundos.
7. Sustituir las direcciones de prueba de los empleados por sus correos reales y confirmar los buzones con el código. Recibirán los siguientes cortes diarios cuando tengan alertas.

El permiso solicitado es `gmail.send`, junto a `openid` y `email` para identificar la cuenta remitente. No se solicitan permisos para leer el buzón. Google confirma el correo remitente mediante su API de identidad; SIGAF no confía en un remitente escrito manualmente. Se utiliza acceso sin conexión para obtener una autorización renovable que permita el envío nocturno.

En aplicaciones OAuth externas que permanecen en Testing, las autorizaciones renovables con permisos Gmail pueden caducar a los siete días. Para funcionamiento estable en producción hay que completar la publicación y los requisitos de verificación que Google aplique. Si la persona revoca el acceso o Google rechaza la renovación, Alertas muestra el error y permite reconectar. [Documentación OAuth de Google](https://developers.google.com/identity/protocols/oauth2), [autorización de aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server), [permisos Gmail](https://developers.google.com/workspace/gmail/api/auth/scopes).

## Seguridad y resultados de entrega

El ID/secreto OAuth, la autorización renovable y la clave de cron se guardan en Supabase Vault. No se entregan al navegador, no se guardan en almacenamiento local ni aparecen en las respuestas de estado. El cliente OAuth público puede mostrarse solo a Admin; el secreto guardado no se vuelve a mostrar. Solo Admin activo puede guardar la configuración o iniciar la conexión. El retorno de Google usa un estado aleatorio con huella, vencimiento y consumo único vinculado a ese Admin.

La función `sigaf-alertas` verifica la identidad con Supabase Auth y consulta el rol actual en la base. El cron usa una clave aleatoria privada de Vault. El retorno OAuth es público para recibir la redirección de Google, pero exige el estado válido y el código de autorización intercambiado con Google. No se desactiva la comprobación de identidad para las operaciones de la aplicación.

Antes de enviar, se vuelve a comprobar que la cuenta siga activa, el correo esté confirmado y coincida, y el rol/sucursal sean los mismos que al preparar el contenido. Esto evita que una degradación de rol deje accesible un resumen anterior con mayor alcance.

Gmail devuelve un identificador cuando acepta el mensaje. El estado se muestra como **Aceptado por Gmail**, no como entrega garantizada en la bandeja principal. Puede aparecer en Spam o ser rechazado después por el destinatario. Las cuotas de Gmail y la disponibilidad del servicio pueden retrasar un envío.

La cola reserva cada envío de forma exclusiva. Los errores explícitos de cuota pueden reintentarse. Si una llamada se interrumpe, devuelve un resultado ambiguo o el proceso no alcanza a registrar la respuesta, el envío pasa a **Requiere revisión**. No se repite automáticamente: hay que comprobar Enviados en Gmail para evitar duplicados, porque Gmail Send no proporciona una clave de idempotencia como Resend. Un identificador MIME estable ayuda a la trazabilidad, pero no se presenta como garantía de deduplicación de Gmail.

Los correos pendientes de la cola anterior se conservaron como revisión, sin enviarlos automáticamente. El endpoint antiguo del cron local devuelve 410 para evitar dos planificadores distintos.

## Archivos y verificación

- `supabase/functions/sigaf-alertas/`: autorización Google, confirmación de destinatarios, envío Gmail y trabajador de cola. Versión 1 desplegada.
- `supabase/functions/sigaf-usuarios/`: versión 2 desplegada; valida direcciones reales en altas/cambios, conservando la identidad y permisos existentes.
- `src/app/api/alertas/route.ts`: puente con sesión real hacia la función protegida.
- `src/componentes/alertas/gestion-entrega.tsx`: configuración Admin, confirmación personal, destinatarios y seguimiento.
- Migraciones `alertas_diarias_y_destinatarios`, `cron_alertas_y_correo_vault`, `coherencia_estado_correos_historicos` y `corregir_guardado_configuracion_gmail`: aplicadas al proyecto. Su correspondencia con los archivos locales se registra en `supabase/aplicacion-remota-2026-10-30.json`.

67 pruebas automatizadas aprobadas: flujo PostgreSQL aislado con alcance de los tres roles, fechas de Chile/verano/invierno, repetición diaria, exclusión de stock cero y correos sin confirmar, códigos con límite/caducidad, permisos, OAuth de un solo uso, MIME UTF-8, HTML seguro y errores Gmail simulados sin enviar correo. Se conservaron los tests operativos anteriores. Tipos, revisión de código, comprobación Deno y compilación de producción correctos.

Pruebas remotas sin efectos de correo: sin sesión 401, token inválido 401, cron inválido 401, retorno Google incompleto 400, método no permitido 405. El cron instalado ya registró ejecuciones correctas. Se generaron 35 avisos internos al actualizar el alcance preventivo y considerar las cuentas reales que el usuario añadió durante la revisión; no se enviaron correos ni se verificó ficticiamente ningún buzón. En navegador se comprobaron la pantalla Admin, el cron activo, las direcciones de prueba diferenciadas y el control de conexión habilitado tras guardar el cliente Google real. La sesión actual del usuario utiliza un Gmail real; esto todavía no autoriza el envío desde ese buzón.

Los asesores mantienen los dos RPC de stock elevados intencionales y la protección de contraseñas filtradas desactivada, que ya existían. Las tablas privadas de correo tienen RLS sin políticas de cliente deliberadamente. `pg_net` tiene su metadato de extensión asociado a public y no admite traslado directo; se verificó que no creó funciones públicas en ese esquema. El aviso de extensión se mantiene documentado para revisar su instalación con Supabase, sin alterar manualmente catálogos del sistema. [Aviso de extensiones](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [protección de contraseñas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

La autorización real en Google y la entrega a un buzón real quedan pendientes hasta completar el consentimiento y confirmar los destinatarios. Las credenciales del cliente ya están guardadas. Las pruebas no se presentan como evidencia de una entrega real en Gmail.

La apertura asistida de Google Cloud fue bloqueada por revisión automática al detectar una redirección a `login.microsoftonline.com`, un origen no autorizado para esta tarea. No se intentó eludir el bloqueo. El usuario completó manualmente el cliente OAuth y se comprobó su guardado mediante el formulario de Alertas. No fue necesario acceder a esa redirección institucional.

## Corrección del botón de conexión (30-10-2026)

El botón permanecía deshabilitado porque el guardado fallaba con «DELETE requires a WHERE clause». La protección safeupdate de Supabase rechazaba una eliminación sin filtro y revertía toda la operación, incluidos el ID y el secreto. El aviso aparecía debajo de la lista de destinatarios, lejos del formulario. Era un error de implementación; no faltaba el rol Admin.

Se añadió una migración correctiva, sin modificar las ya aplicadas. Al cambiar el cliente se invalidan únicamente las autorizaciones OAuth vigentes. Las actualizaciones de configuración, vinculación, registro de errores y corte diario ahora seleccionan la fila única de programación. Se mantienen safeupdate, RLS y los permisos exclusivos del servidor. No se modificaron productos, stock, cuentas ni contraseñas.

La pantalla solo limpia el secreto después de recibir confirmación de guardado. Si falla, conserva el formulario y muestra el error junto al botón. Si falla una consulta posterior, conserva los datos visibles con un aviso de estado sin actualizar y una opción para reconsultar. Esto permite a Admin corregir o reintentar sin perder lo escrito; el formulario nunca se guarda en el almacenamiento local del navegador.

Se verificó el guardado real con las credenciales que el usuario había dejado en el formulario: Vault confirma su presencia sin revelar sus valores y el botón Conectar o renovar Gmail queda habilitado. Guardar el cliente no concede por sí mismo permisos de envío: el dueño del Gmail debe completar Continuar en Google. No se enviaron correos durante esta corrección.

La regresión aislada comprueba filtros exteriores en las mutaciones (PGlite no incorpora pg_safeupdate), reintento con el mismo cliente y secreto vacío, invalidación de autorizaciones vigentes al cambiar de cliente, conservación del secreto, permisos y estado del proveedor. También se ejecutó la configuración real sobre Supabase con su protección activa.
