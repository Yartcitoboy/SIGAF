# Códigos de correo — diagnóstico del 9 de noviembre de 2026

La programación remota registró «Google no autorizó el envío. Vuelve a conectar Gmail.» en el corte de 2026-11-09 a las 03:00 UTC (00:00 Chile). Correo activo y conexión almacenada no garantizan autorización vigente en Google. No había códigos en codigo_correo: la renovación de acceso falla antes de preparar el código o llamar al envío Gmail.

Hay dos cuentas Auxiliar nuevas, Auth confirmado y correo de alertas aún sin confirmar. Crear una cuenta no envía automáticamente el código de alertas; Admin debe solicitarlo desde su fila. La dirección no se cambia ni se marca confirmada para sortear la verificación.

El usuario indicó que renovó. La comprobación siguiente todavía mostró el mismo error y la autorización almacenada con fecha 30 de octubre. No se declaró solucionado: se pidió comprobar el mensaje final «Gmail conectado a SIGAF». No se leyó ni publicó ningún token.

Se mejora la interfaz: problema de envío visible fuera del panel, sección de Gmail abierta cuando hay error, texto «Conexión Gmail guardada» y explicación del último paso de autorización. Tras una acción fallida se actualiza el estado para mostrar el diagnóstico disponible. No cambia las cuentas, el esquema ni la política de confirmación.

Para completar: Admin → Alertas → Gmail y envío diario → Conectar o renovar Gmail → Continuar en Google. Completar autorización del remitente hasta el mensaje final; volver y actualizar estado. Solicitar un código nuevo en la fila del destinatario correcto. El código vence en 15 minutos y se introduce solo desde Admin. No compartir contraseñas ni códigos en el chat. La recepción real requiere que la persona revise su buzón y Spam.

No se enviaron correos ni se generaron códigos de prueba durante el diagnóstico. La causa exacta del rechazo OAuth (caducidad, revocación u otra configuración Google) no se ha confirmado; no se presume una política concreta de Google solo por la fecha.

Validación de la mejora visual: lint y compilación de producción con tipos correctos. La última consulta remota aún conservaba el rechazo Google; la renovación y una entrega real siguen pendientes de comprobar. No se presenta esta compilación como solución de la autorización externa.

Prueba posterior autorizada: el usuario indicó ca.apeleo@duocuc.cl como destinatario. Se pulsó una sola vez Enviar código en su fila de Admin. La aplicación respondió «Google no autorizó el envío. Vuelve a conectar la cuenta Gmail en Alertas.»; no se presentó como entrega exitosa. Antes de esa prueba ultimo_error estaba vacío, pero la conexión almacenada no garantizaba una autorización válida. La pestaña de retorno abierta mostraba «No se autorizó la conexión de Gmail. Vuelve a Alertas para intentarlo de nuevo.» y no el mensaje de conexión exitosa. La renovación OAuth sigue pendiente; no se repitió el envío ni se marcó el buzón como confirmado.
