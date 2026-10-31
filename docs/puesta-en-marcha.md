# Puesta en marcha con Supabase real

Actualizado el 30 de octubre de 2026. Sustituye las instrucciones anteriores de acceso temporal. La integración de correo vigente está en [Alertas y Gmail](alertas-gmail-2026-10-30.md).

## Acceso y configuración obligatorios

El Login requiere una cuenta real de Supabase Auth, activa y vinculada con el mismo UUID a `public.usuario`, y un perfil válido en `public.perfil`. Una fila antigua de usuario no equivale a una cuenta Auth. No se crean identidades, contraseñas o saldos de demostración.

La app conserva la URL y clave pública del proyecto. Se eliminaron las variables, tarjetas, endpoint y firmas del acceso temporal. Las cookies de Supabase siguen transportando la sesión autenticada; no almacenan un catálogo o inventario alternativo.

Si falta una tabla, la política de vencimiento o el contexto operativo, la pantalla informa el error. No inventa umbrales, fechas ni datos para continuar.

## Preparar el esquema

1. Revisar el esquema real y el historial de migraciones con acceso administrativo al proyecto correcto.
2. En una base nueva, aplicar primero `001_initial_schema.sql`. En una base existente no volver a ejecutar el esquema inicial.
3. Aplicar solamente las migraciones pendientes, en orden. Los archivos que crean políticas o tablas se ejecutan una sola vez. No usar un comando de publicación sin conciliar antes el historial. La correspondencia de este proyecto está en `supabase/aplicacion-remota-2026-10-27.json`.
4. Crear o verificar la primera cuenta Auth y su perfil ADMIN en `public.usuario`. Conservar los autores históricos; no cambiar UUIDs o correos de registros existentes para simular una vinculación.
5. Revisar las sucursales y marcar explícitamente las salas de ventas desde Configuración. No se clasifica una bodega por su nombre.
6. Abrir el Login con esa cuenta y verificar cada módulo con el alcance autorizado.

En el proyecto `nkqxhpiagkcfvxbytarn` ya se aplicaron 002–006 y las migraciones `seguridad_cuentas_reales`, `optimizar_politicas_sesion` y `proteger_ultimo_admin_real`, después de comparar el esquema existente. No repetirlas ni ejecutar 001 en esta base. Todas las tablas públicas tienen RLS. Las cuentas existentes `admin@gmail.com` y `admin.sigaf@local.com` tienen acceso Admin global por autorización expresa. Los tres autores históricos siguen conservados sin acceso Auth y no cuentan como respaldo del último Admin real.

La ubicación existente “Sala de Ventas - Vitrina Prioritaria”, descrita como punto de atención al público, está clasificada como sala de ventas. No se movieron existencias. Los umbrales existentes se conservaron: 7 días críticos, 30 preventivos, holgura 0.

## Importar el catálogo oficial

En este proyecto ya se ejecutó `supabase/importaciones/2026-10-27_catalogo_isp.sql`: 198 productos añadidos, 214 totales, sin registros sanitarios duplicados. Procede del [registro sanitario oficial del ISP](https://registrosanitario.ispch.gob.cl/), filtrado por Vigente, consultado el 27-10-2026. El SQL se conserva para trazabilidad y futuras bases; no hace falta repetir la importación en esta base.

La selección contiene 198 registros sanitarios distintos de ocho búsquedas por nombre: paracetamol, ibuprofeno, amoxicilina, loratadina, losartán, omeprazol, metformina y cetirizina. No representa todo el registro nacional.

La importación añade los registros que faltan y omite un registro sanitario ya existente. No sobrescribe fichas, elimina productos o modifica existencias. Los datos que el listado no aporta quedan NULL: GTIN, presentación y vida útil. La presentación debe completarse desde el envase antes de recibir stock.

La fecha de registro ISP, la fecha de consulta y la fecha de importación son datos separados. Ninguna se utiliza como vencimiento de un lote. La vigencia es la observada al consultar el ISP, no una supervisión continua de alertas o retiros.

Se verificaron 19 lotes, 19 existencias y 2.275 unidades, iguales que antes de importar; se conservaron los 10 movimientos y las 3 mermas.

## Conexión de módulos

| Módulo | Fuente u operación real |
| --- | --- |
| Login y sesión | Supabase Auth, usuario y perfil. |
| Dashboard e Inventario | Tablas operativas, configuración y contexto PostgreSQL. |
| Productos | Lectura y guardado del catálogo en producto y categoría. |
| Lotes y recepción | RPC transaccional recibir_lote. |
| Movimientos, mermas y traslados | RPC operar_stock con responsable autenticado. |
| Dispensación | FEFO sobre datos autorizados; confirmación con operar_stock. |
| Alertas y campana | Notificaciones del usuario real; marcado de lectura con alcance de destinatario. |
| Reportes | Datos de Supabase; emisión con autor de la sesión y fecha por defecto de PostgreSQL. |
| Usuarios | API web y función protegida sigaf-usuarios, versión 2 activa en Supabase; comprueba Auth, ADMIN activo y formato de correos reales. |
| Correo de caducidad | Gmail API mediante OAuth; función sigaf-alertas y programación en Supabase. Requiere vincular remitente y confirmar buzones. |
| Configuración | Configuración, farmacia, sucursal y bodega. |
| Apariencia | Preferencia del usuario en preferencia_usuario. |
| Mensajes | Solo interfaz solicitada; envío deshabilitado y sin conversaciones ficticias. |

El servidor exige sesión real y mantiene filtros de rol/sucursal y proyección de usuarios sin hashes, además de RLS. Ocultar enlaces del menú no sustituye estos controles.

## Variables del servidor

Conservar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Usuarios y Alertas usan las claves administradas de sus funciones en Supabase; estos módulos no necesitan una clave administrativa en el servidor local.

El usuario eligió Gmail API. El cliente OAuth ya está guardado; falta autorizar el Gmail remitente desde Alertas. Se corrigió el guardado respetando safeupdate y el botón de conexión ya se habilita al guardar. Los secretos y la autorización renovable se guardan en Vault; no deben añadirse a variables NEXT_PUBLIC, Git o el chat. El cron ya está instalado y activo con corte a las 00:00 de Chile desde el 31-10-2026. El envío permanece pendiente de la vinculación Google y confirmación de destinatarios. No se enviaron correos de prueba. El cron local de Resend se retiró y devuelve 410. Ver [pasos de activación](alertas-gmail-2026-10-30.md).

Mensajes sigue siendo solo interfaz básica con envío deshabilitado.

## Validación y trabajo compartido

Ejecutar revisión de código, tipos, pruebas y compilación antes de confirmar cambios. Las pruebas de PostgreSQL usan un motor aislado en memoria; sus cuentas, fechas y existencias solo pertenecen a las pruebas y no alimentan la aplicación ni se envían a Supabase.

Comprobar después con cuentas reales: acceso por rol, separación de sucursales, lectura del catálogo, altas, recepción, FEFO, traslado conservando stock, merma con motivo, notificaciones y reportes. No usar la base compartida para movimientos de prueba sin acordar el entorno y los datos con el equipo.

Todo el trabajo queda en la rama local actual. No se crean commits ni se publica el repositorio automáticamente.
