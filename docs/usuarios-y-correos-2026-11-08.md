# Usuarios y correos de prueba — 8 de noviembre de 2026

## Flujo vigente

Solo ADMIN registra o edita las direcciones desde Usuarios. Desde Alertas o Perfil → Correo de alertas puede solicitar el código para un destinatario e introducir los seis dígitos que este le comunique. La verificación sigue usando las funciones existentes y sus datos reales: código de un uso, 15 minutos, máximo cinco intentos y un minuto entre solicitudes. No crea buzones ni convierte una dirección local en Gmail.

BODEGUERO y AUXILIAR conservan notificaciones y resúmenes de su alcance. Ya no ven el panel ni el acceso de perfil para gestionar correos. La API web y la función desplegable rechazan esa gestión para empleados, incluso si intentan invocarla directamente. Las operaciones del cron y el callback Google mantienen sus verificaciones separadas.

No se ha cambiado ninguna contraseña ni el rol de cuentas existentes. Por indicación del usuario se deja pendiente agregar un Gmail de Auxiliar. No se envían nuevos códigos ni correos como parte de las comprobaciones automáticas.

## Cuentas encontradas en la base

| Uso | Cuenta exacta | Rol y alcance | Estado observado |
|---|---|---|---|
| Administración / pruebas generales | yartcito.boy@gmail.com | ADMIN, todas las sucursales | Auth activo y correo de alertas confirmado. |
| Operación de bodega | is.riquelmet@duocuc.cl | BODEGUERO, Sucursal Central (Santiago Centro) | Auth activo y correo de alertas confirmado. |
| Pantallas de Auxiliar | marcela.sigaf@local.com | AUXILIAR, Sucursal Central | Cuenta Auth existente; no recibe correo real. Solo prueba UI/permisos. |
| Bodega alternativa | victoria.sigaf@local.com | BODEGUERO, Sucursal Central | Cuenta Auth existente; no recibe correo real. |

No se encontró una cuenta gamer2000 en los usuarios consultados. No se adivinó ni sustituyó ninguna dirección. Los usuarios históricos sin cuenta Auth no sirven para iniciar sesión y se conservan por trazabilidad.

## Instrucciones para el compañero

1. Utilizar las cuentas existentes con las contraseñas que ya conocen; no incluir contraseñas en documentos, commits o chat. Si alguien no las recuerda, coordinar su recuperación con el responsable.
2. Revisar a qué proyecto apunta el entorno. Para altas, salidas, mermas o pruebas de concurrencia usar el ambiente de QA acordado. Estas cuentas reales no son una autorización para crear stock ficticio en la base compartida.
3. Para una futura Auxiliar con Gmail, Admin abre Usuarios, crea o edita la cuenta con el correo exacto, asigna AUXILIAR y su sucursal. Evitar cambiar el correo de un empleado existente sin confirmar su identidad.
4. Admin entra a Alertas, localiza el destinatario y pulsa Enviar código. La persona revisa su buzón y comunica los dígitos al Admin por el canal acordado. Admin los escribe en la fila correcta y confirma. No pedir contraseñas de Google.
5. Verificar que el destinatario figura confirmado. No reutilizar códigos ni dar por confirmado un buzón solo porque Auth lo esté: son estados distintos.
6. Entrar como Bodeguero/Auxiliar y comprobar que no aparece la gestión de correos en Alertas ni Perfil; las notificaciones sí permanecen.
7. Revisar el próximo resumen diario si hay existencias con alerta en su alcance. La ausencia de un correo sin alertas no prueba un fallo. Auxiliar solo recibe el alcance configurado para salas de ventas.

## Limpieza y pruebas

Se retiraron la página Mensajes, sus enlaces, icono, permisos de módulo y matcher. La URL devuelve 404. El campo mensajes de correo_resumen y los textos de notificaciones son datos operativos y se conservan.

Los servicios siguen consultando Supabase; no se añadió un almacén de usuarios local ni un acceso de demostración. El formulario y sus estados temporales en React no sustituyen la base. Los documentos previos que describen Mensajes como vista previa o confirmación por el propio empleado son históricos; este documento define el flujo nuevo.

Casos a ejecutar: empleado intenta estado/solicitar/confirmar → 403; Admin confirma código de otra cuenta → validación contra ese destinatario, no contra Admin; código incorrecto/vencido → rechazo; editar el correo → exige nueva confirmación; correo ya confirmado → no requiere otro código; notificaciones siguen visibles para cada rol; Mensajes → 404.

## Evidencia de esta implementación

87 pruebas automáticas aprobadas, lint y compilación de producción con tipos correctos. La nueva prueba ejecuta el handler real con Auth/RPC aislados: empleado no puede gestionar, Admin selecciona el destinatario correcto, UUID inválido y código incorrecto/vencido se rechazan. Las pruebas anteriores de base cubren uso único, caducidad, límite de intentos e invalidación al cambiar correo.

Smoke HTTP local: login, diez rutas protegidas, API sin sesión y origen ajeno correctos; /mensajes devuelve 404. No sustituye las pruebas manuales con sesión de cada empleado.

Se desplegó sigaf-alertas versión 2 y se volvió a leer su código remoto: coincide con la versión probada. Su endpoint real respondió 401 sin sesión. Se verificó que los RPC de códigos siguen restringidos al servicio, sin ejecución para anon/authenticated. Se conservaron los dos destinatarios confirmados. No se enviaron códigos nuevos, no se cambiaron cuentas, contraseñas ni tablas. La interfaz web queda en el repositorio local; no se hizo commit ni push.
