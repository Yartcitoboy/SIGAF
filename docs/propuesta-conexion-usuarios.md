# Conexión de Usuarios: autorizada y desplegada

Destino: función `sigaf-usuarios` del proyecto Supabase `nkqxhpiagkcfvxbytarn`.

Estado al 27-10-2026: función `sigaf-usuarios` versión 1 ACTIVA. El usuario autorizó expresamente su despliegue. La API web delega en ella las operaciones de Usuarios y la clave privilegiada permanece exclusivamente en el entorno administrado de Supabase. Este módulo ya no requiere una clave administrativa en el servidor local.

La función desplegada:

- Valida el token de sesión con Supabase Auth y consulta el estado y rol actuales del usuario.
- Rechaza cualquier solicitud sin una cuenta activa con rol ADMIN.
- Permite listar registros y distinguir cuentas Auth reales de autores históricos sin acceso.
- Permite las altas, ediciones y restablecimientos de contraseña solicitados por un Admin mediante los formularios existentes.
- Valida roles, sucursales, correos y contraseñas y conserva la protección contra desactivar o cambiar el rol del propio administrador.
- Nunca devuelve contraseñas, hashes, tokens o claves privilegiadas.
- No envía mensajes de prueba, no crea cuentas de ejemplo y no cambia contraseñas durante las comprobaciones.

No se añadirán permisos a Bodeguero o Auxiliar para administrar cuentas. La API web conserva además su propia comprobación de sesión y rol.

La verificación JWT del gateway está desactivada porque la función verifica explícitamente el JWT con Supabase Auth antes de crear el cliente privilegiado. No concede acceso anónimo: sin sesión devuelve 401; un token inválido devuelve 401; un método HTTP distinto de POST devuelve 405. La petición interna indica la operación GET, POST o PATCH.

No se ejecutaron altas, ediciones ni cambios de contraseña durante las pruebas. Código con dependencias fijadas y comprobación estricta Deno en `supabase/functions/sigaf-usuarios/`; puente web en `src/app/api/usuarios/route.ts`.
