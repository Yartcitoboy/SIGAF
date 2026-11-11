# Estado de los ocho pendientes — 3 de noviembre de 2026

Se preservan los cambios locales anteriores de Productos. Sin commits, push, migraciones ni escrituras en la base. Las consultas administrativas realizadas fueron exclusivamente de lectura.

| Pendiente | Trabajo realizado | Estado y qué falta |
|---|---|---|
| 1. Gmail | Se revisó la base remota: vinculado, correo activo, cron activo, sin último error; ejecución de 2026-11-03 a las 03:00 UTC (00:00 Chile). Dos destinatarios confirmados. Ocho resúmenes ACEPTADO, último de 2026-11-03; dos registros históricos REVISION sin fecha de resumen. | Configuración y aceptación técnica verificadas. El usuario debe confirmar recepción real y revisar los dos registros históricos desde el flujo existente, sin reenviarlos a ciegas. No se enviaron correos durante este trabajo. |
| 2. Mensajes | Menú y botón superior lo identifican como vista previa. README y plan lo excluyen de la aceptación funcional; se conserva la interfaz solicitada. | Cerrado como alcance de candidata: no se implementó mensajería ni se alteraron roles. |
| 3. Preparación QA | Matriz de 24 escenarios, cuentas y datos necesarios, criterios de entrada/salida; CI y smoke HTTP sin sesión. | Preparación entregada. Faltan entorno separado, cuentas autorizadas y ejecución de casos autenticados. No es una suite E2E de navegador completa. CI solo se ejecutará en GitHub cuando el usuario suba los archivos. |
| 4. Documentación | README reescrito con stack, rutas, Gmail e ISP manual reales; enlaces al plan y recuperación. | Corregido. Documentos antiguos se conservan como evidencia histórica. |
| 5. Rendimiento | Dispensación solicita siete tablas en vez de nueve: excluye movimientos y mermas, conservando stock completo, configuración y reglas FEFO. Permisos y RLS permanecen. Nueva prueba verifica la proyección y la reconstrucción del stock. | Mejora parcial. Dashboard/Lotes/Movimientos/Reportes todavía usan el conjunto completo; medir con volumen objetivo antes de declarar este punto cerrado. No se elimina información de los detalles de Lotes. |
| 6. Catálogo | Auditoría remota: 215 productos, 198 sin código, 198 sin presentación, 16 sin registro ISP; 19 lotes. Archivo SQL de solo lectura identifica incompletos y códigos equivalentes duplicados. | Diagnóstico y procedimiento entregados; completar desde envases las fichas que se usarán. No se inventaron códigos ni se editó información sanitaria. |
| 7. Lector físico | Caso QA23 y procedimiento USB existente conservados. | Requiere al usuario con el dispositivo: lectura HID/Enter, conocido/desconocido/consecutivos y no guardado automático. |
| 8. Despliegue/recuperación | Guía reproducible de build, variables, conciliación de migraciones, versión candidata y ensayo de restauración aislado. | Procedimiento entregado; ensayo real y destino/respaldos requieren responsable. No se creó un proyecto de pago ni se restauró la base compartida. |

Adicional: pantallas de recuperación de errores a nivel de módulo y aplicación, con reintento y recomendación de consultar historial antes de repetir una escritura incierta. No se exponen mensajes internos de excepciones.

## Participación del usuario

1. Confirmar si los resúmenes de Gmail ya llegan y comprobar carpeta de spam, fecha y contenido; no compartir credenciales.
2. Elegir el ambiente de QA separado y autorizar/preparar sus cuentas. No hace falta enviar contraseñas por chat.
3. Completar códigos/presentaciones/ISP de los productos del escenario con sus envases. Un dato no conocido debe seguir vacío.
4. Ejecutar QA23 con el lector físico.
5. Designar responsable del ensayo de restauración y aportar su evidencia. No restaurar producción como prueba.
6. Fijar el volumen y tiempos aceptables para la medición; decidir y subir el commit candidato cuando corresponda.

No se presenta una tarea como terminada solo por documentarla. La entrega final sigue condicionada a la ejecución de QA y las evidencias pendientes.

## Validación del cambio

86 pruebas aprobadas (85 anteriores y una nueva de Dispensación), lint sin errores y build de producción con tipos correcto. Smoke local aprobado: login, redirección de 11 rutas sin sesión, rechazo 401 en APIs de datos/códigos y 403 por origen ajeno. La instancia temporal termina al concluir. La ejecución de GitHub Actions y los 24 casos manuales todavía no se han realizado. No se cambiaron dependencias ni esquema de base de datos.
