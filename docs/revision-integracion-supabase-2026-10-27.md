# Revisión e integración de la rama Supabase

Fecha: 27 de octubre de 2026.

## Resultado y alcance

Se revisaron los dos commits de `origin/feature/integracion-completa-supabase`, de fcaldep:

- `ff92453`: integración de módulos, formularios de escritura y acceso demo.
- `cc15f89`: Dispensación FEFO, gráficos y navegación por rol.

La rama parte de `4f7d56c`, anterior a la base de `front-isa` (`d744168`) y a sus mejoras actuales sin confirmar. Cambia 29 archivos y no incluye nuevas migraciones SQL. Reemplazar los archivos completos habría recuperado servicios antiguos y sobrescrito mejoras de acceso, permisos, fechas y presentación.

Se realizó una **integración selectiva y adaptada en el directorio de trabajo de `front-isa`**. Se incorporaron las funciones aprovechables sobre la arquitectura actual. No se ejecutó `git merge`, ni se creó un commit, ni se publicó nada. Por tanto, Git todavía no considera fusionada la rama del compañero. Las modificaciones anteriores de frontend permanecen sin confirmar, junto con esta integración.

No se modificaron tablas, datos, RLS ni funciones de Supabase. No se ejecutaron migraciones, recepciones, ventas, traslados o mermas en la base compartida. Los endpoints existentes de datos, los archivos de autenticación, el Login, sus tarjetas de ingreso y las dependencias se conservaron.

## Qué aportó la rama y qué efecto tiene lo integrado

| Área | Resultado integrado | Efecto en el sistema y rol |
| --- | --- | --- |
| Dispensación | Ruta propia `/dispensacion`, accesible desde el menú de los tres roles y protegida por el control de rutas existente. Reutiliza el flujo del Auxiliar. | Auxiliar dispone de una ventana de trabajo dedicada. Admin y Bodeguero pueden acceder al mismo flujo sin recibir otros permisos adicionales. |
| Ubicación y FEFO | Selección explícita de ubicación; recomendación según vencimiento, fecha de ingreso y existencia, dentro de la misma sucursal. Detecta si el lote prioritario está en otra sala autorizada. | Se evita elegir automáticamente una bodega o saltarse otro lote prioritario de la misma sucursal al filtrar. La ubicación puede cambiarse a la recomendada. |
| Confirmación de salida | Adaptador `servicios/dispensacion.ts` que utiliza la única operación de stock existente. Valida cantidad entera positiva y clave de operación. | La identidad se resuelve en el servidor y la operación real conserva la comprobación transaccional existente. No se envían un responsable inventado ni un saldo calculado en el navegador. |
| Borradores | Las tarjetas temporales y la base antigua mantienen el flujo de consulta y validación visual, sin descontar unidades. | Se puede revisar el trabajo del Auxiliar de inmediato sin presentar una simulación como venta registrada. |
| Reportes | Historial real de emisiones accesibles, ordenado por fecha, con búsqueda y estados independientes de carga, error y vacío. | Admin puede consultar quién generó una emisión registrada. Se mantienen las descargas PDF y XLSX actuales. No se habilitó Reportes para Bodeguero. |
| Responsables | Nombres asociados por UUID, usando el directorio que la cuenta puede leer. Si no hay nombre autorizado, se conserva una referencia al identificador. | Movimientos e historial resultan más legibles sin atribuir la actividad de otra persona a una cuenta temporal. No se amplió el acceso al directorio. |
| Etiquetas | Vista e impresión textual de un lote, producto, vencimiento, presentación y stock físico repartido entre todas sus ubicaciones accesibles. | Admin y Bodeguero pueden consultar y preparar una referencia interna. No se modifica el rotulado del medicamento ni se promete un QR o código escaneable inexistente. |
| Paneles, inventario y otros módulos | Se conservaron las consultas reales, sumas de stock, filtros, estados de error, detalles laterales y mejoras de frontend anteriores. | Se evita sustituir una conexión ya existente por otra más antigua. La rama del compañero no constituye por sí sola una conexión nueva o una certificación de que el backend está listo. |

### Comportamiento de Dispensación

1. Buscar y seleccionar un producto del catálogo recibido.
2. Elegir una ubicación autorizada. No se selecciona automáticamente una.
3. Consultar lotes y disponibilidad. Stock cero no genera una recomendación; vencimiento en el día actual y holgura bloquean la entrega conforme a la regla vigente del proyecto.
4. Si hay una sala de ventas identificada y un lote apto, indicar el primero por FEFO de la sucursal. Si está en otra sala, la confirmación queda bloqueada hasta elegirla.
5. Si falta la clasificación de salas, no inventarla. En modo de consulta se permite abrir explícitamente una simulación visual sobre un candidato por fecha. Esa simulación no habilita una salida real.
6. Fechas incompletas o inválidas y ubicaciones fuera del alcance impiden recomendar o simular una salida.
7. Una cuenta real con backend compatible utilizaría el canal existente; el servidor debe volver a comprobar identidad, permisos, FEFO, stock e idempotencia. El estado del navegador no sustituye esas comprobaciones.

El historial representa los metadatos de emisiones que existen en Supabase. No almacena archivos originales ni sus filtros, y no puede filtrarse por la farmacia seleccionada arriba porque esos metadatos no contienen tal relación. Las descargas temporales no generan una emisión nueva. La pantalla declara estas limitaciones.

## Hallazgos en el código del compañero

Estos hallazgos provienen de la revisión del código de la rama. No implican que se haya ejecutado ese código contra la base compartida ni que se haya auditado la configuración actual de Supabase.

| Impacto | Hallazgo concreto | Consecuencia de importar la implementación original | Decisión |
| --- | --- | --- | --- |
| Crítico | `servicios/auth.ts` acepta una contraseña demo común, consulta el registro completo de usuario y lo guarda en `localStorage`. | No crea una sesión institucional de Supabase Auth; el rol puede depender del estado del navegador y la lectura puede incluir campos sensibles. | Mantener Auth y tarjetas temporales actuales, con sus restricciones. No importar ese servicio ni su Login. |
| Crítico | Dispensación, movimientos y recepción realizan varias escrituras separadas y confían en saldos o responsables enviados por el cliente. | Fallos intermedios y concurrencia pueden dejar movimientos sin saldo correspondiente o saldos sin trazabilidad. | Mantener las operaciones atómicas existentes del proyecto. No importar esas escrituras directas. |
| Crítico | El traslado original resta unidades, pero no recibe ni incrementa realmente una ubicación de destino; el selector visual no llega a la operación. | Se puede perder stock sin que aparezca en destino. | Conservar el traslado actual con origen, destino, motivo y operación única. No probar el traslado defectuoso en Supabase. |
| Crítico | Diversas acciones utilizan un UUID de usuario demo fijo; la creación de usuarios escribe un hash ficticio sin crear una cuenta Auth. | Atribución incorrecta e identidades incompletas. Un registro en `usuario` no equivale a una cuenta válida de acceso. | Conservar el alta institucional existente y resolver responsables reales por identificador. |
| Medio | El indicador llamado cumplimiento FEFO cuenta inventario no vencido en vez de verificar salidas auditadas. | Da apariencia de cumplimiento sin demostrar que se dispensó el lote correcto. | Mantener los indicadores actuales basados en los datos disponibles y su estado de evaluación. |
| Medio | Lecturas sin paginación, sumas de lote basadas en una sola fila y mezcla de fechas UTC/locales. | Totales incompletos, stock omitido entre ubicaciones y desfases en vencimiento. | Conservar lectura paginada, agregación completa y calendario de Chile. |
| Medio | Borrado físico de productos, etiquetas mediante HTML interpolado y una apariencia de código sin codificación escaneable verificada. | Riesgos de integridad de referencias, inserción de contenido como HTML y expectativas incorrectas de escaneo. | Conservar ciclo de producto actual; etiquetas de texto renderizadas por React. |
| Bajo | Cambios del archivo de dependencias sin funcionalidad necesaria, CSV presentado como Excel y documentación con estados contradictorios. | Ruido de integración y confusión sobre lo que realmente está terminado. | No importar el lockfile ni los documentos de estado antiguos; mantener XLSX real y esta revisión. |

Filtrar el menú por rol es una mejora de navegación; no sustituye la autorización de rutas, API ni RLS. Del mismo modo, que una consulta devuelva datos no demuestra que las escrituras estén protegidas o listas para producción.

## Archivos principales de esta integración

- `src/app/(dashboard)/dispensacion/page.tsx`: nueva ventana.
- `src/lib/vistas/dispensacion.ts`: planificación visual de FEFO y estados de bloqueo.
- `src/lib/servicios/dispensacion.ts`: adaptación al canal de operación existente.
- `src/componentes/dashboard/dashboard-auxiliar-view.tsx`: ubicación, prioridad entre salas y reutilización del flujo.
- `src/lib/permisos.ts`, `src/proxy.ts`, `src/componentes/layout/sidebar.tsx`: nueva ruta protegida y navegación.
- `src/componentes/reportes/historial-reportes.tsx`, `src/lib/servicios/reportes.ts` y página de Reportes: historial consultable.
- `src/lib/vistas/responsables.ts`, `src/lib/servicios/usuarios.ts` y página de Movimientos: atribución legible según permisos.
- `src/lib/vistas/etiqueta-lote.ts`, `src/componentes/productos/etiqueta-lote.tsx` y página de Lotes: referencia textual e impresión.
- `tests/integracion-rama.test.mjs`: pruebas de las adaptaciones sin modificar la base remota.

No se copiaron `PENDIENTES.md` ni `docs/Diagrama_Capa_Servicios.html` de la rama porque describen una arquitectura anterior y mezclan declaraciones de finalización con pendientes del acceso demo y permisos.

## Verificación

- Revisión de tipos: correcta.
- Revisión de código con ESLint: correcta.
- Pruebas automatizadas: 52 aprobadas, incluidas 9 de integración de la rama.
- Las pruebas de PostgreSQL usan una base local de pruebas; no ejecutan las migraciones en Supabase.
- Compilación de producción con webpack: correcta, incluida la nueva ruta protegida de Dispensación.
- Navegador: sin sesión, Dispensación redirige al Login. Las tres tarjetas conservan el acceso existente. Admin, Bodeguero y Auxiliar abren Dispensación; Auxiliar no puede abrir Usuarios y Bodeguero no puede abrir Reportes, incluso mediante URL directa.
- Consulta real de Supabase: 16 productos, 19 lotes y 10 movimientos en el momento de la revisión. Los nombres de responsables se resuelven en Movimientos. El historial de emisiones consultado está vacío y se muestra como tal.
- Dispensación: Loratadina muestra 75 unidades; cantidad cero bloqueada; validar un borrador de 2 unidades muestra saldo previsto 73 y conserva las 75 unidades físicas consultadas. No se registró una salida.
- Etiqueta: se abre con lote, producto, vencimiento, presentación, código textual y stock existentes; cierra con Escape. No se ejecutó una impresión física.

## Respaldo del trabajo local

Al inicio se creó una copia temporal de los 31 archivos previos de frontend modificados o nuevos. Esa carpeta ya no estaba disponible al comprobarla al cierre y no se ofrece como punto de recuperación.

Se deja una copia adicional de los archivos modificados y nuevos del **estado integrado actual**, sin credenciales, dependencias ni base de datos, en:

`C:\Users\yartc\.codex\visualizations\2026\10\19\01a15281-b798-71d2-81d7-6cc62ff4b175\sigaf-front-isa-integrado-2026-10-27.zip`

Esta copia contiene el trabajo de frontend y las adaptaciones de integración tal como quedan ahora. No reconstruye por separado el estado inicial sin confirmar. La base de Git sigue siendo `d744168`; no se descartaron archivos ni se ejecutó un reset para integrar.

## Pendientes para una etapa de backend

| Prioridad | Trabajo pendiente | Condición para darlo por terminado |
| --- | --- | --- |
| Crítico | Verificar Supabase Auth, RLS, ámbitos por farmacia/sucursal y protección de escrituras. | Pruebas con cuentas institucionales y permisos reales en un entorno autorizado. Una sesión temporal no sirve para certificarlo. |
| Crítico | Verificar disponibilidad y contratos de las operaciones atómicas del proyecto en la base existente. | Recepción, salida, merma y traslado consistentes, auditables e idempotentes. No recurrir a varias escrituras desde el navegador para evitar este requisito. |
| Medio | Completar configuración y clasificación de salas con datos acordados por el equipo. | Poder diferenciar explícitamente bodega y sala de ventas y aplicar holgura sin suposiciones. |
| Medio | Historial de informes con filtros y archivo original si se requiere trazabilidad documental completa. | Metadatos y archivo persistente vinculados al responsable y al alcance de la emisión. |
| Medio | Decidir el alcance del Admin y el futuro Gerente de sucursal. | Matriz de permisos aprobada y aplicada también al servidor y a los datos. |
| Bajo | Validar la impresión final con el formato de papel y la impresora de trabajo. | El equipo confirma legibilidad y dimensiones. La vista textual no incorpora QR ni código de barras. |

## Roles

Se mantienen **Admin, Bodeguero y Auxiliar**. No se creó Gerente ni se simuló que un filtro de sucursal limita la autoridad de un Admin.

Para una sola sucursal, los tres roles pueden ser suficientes. Si una farmacia administra varias sucursales con responsables propios, la propuesta sigue siendo: Admin general para toda la organización; Gerente limitado a su sucursal; Bodeguero para recepción, almacenamiento, inventario y movimientos; Auxiliar para consulta y dispensación. El rol informático no acredita por sí solo una habilitación profesional sanitaria.

El detalle de la fase anterior de interfaz, sus motivos y sus límites se conserva en `docs/cambios-frontend-y-roles.txt`.
