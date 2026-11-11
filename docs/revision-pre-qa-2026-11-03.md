# Revisión previa a QA — 3 de noviembre de 2026

Revisión inicial: las correcciones y comprobaciones posteriores se registran en [Cierre previo a QA](cierre-pre-qa-2026-11-03.md). Consultar ese documento para no tratar los pendientes históricos como estado actual.

## Alcance y dictamen

Inspección del repositorio local, rutas, servicios, documentación y ejecución de comprobaciones. No se revisó la configuración remota actual ni se efectuaron escrituras o envíos reales. Los documentos históricos no prueban el estado actual de Supabase o Gmail. No se asigna un porcentaje de finalización sin criterios de aceptación acordados.

El núcleo permite preparar una candidata a QA para una farmacia con varias sucursales y tres roles. No equivale a una aprobación para producción. La mensajería no forma parte de las funciones terminadas. No se ha demostrado aislamiento entre empresas independientes; no presentar esta versión como SaaS multiempresa validado.

## Hallazgos y prioridades

| Prioridad | Hallazgo y evidencia | Cierre esperado |
|---|---|---|
| Alta | Mensajes solo es interfaz: src/app/(dashboard)/mensajes/page.tsx muestra aviso y envío deshabilitado. Era el alcance solicitado inicialmente. | Excluir explícitamente de la entrega funcional o implementar en una etapa posterior. No es necesario construirlo para comenzar QA del núcleo. |
| Alta | Gmail: docs/puesta-en-marcha.md y alertas-gmail-2026-10-30.md dejan pendiente autorización/entrega real. Esto es una falta de evidencia, no confirmación de fallo actual. | Revisar remitente y destinatarios confirmados; acordar prueba real y demostrar un corte diario, recepción y tratamiento de errores sin duplicados. |
| Alta | README contiene Resend e integración ISP/Minsal y tecnologías como React Hook Form, date-fns y shadcn/Radix que no figuran en package.json. | Alinear documentación con Gmail, ISP manual, componentes reales y alcance final. |
| Alta | No se encontró suite de pruebas E2E ni configuración de CI en .github. Las pruebas actuales incluyen dominio y PostgreSQL aislado; no sustituyen navegador y permisos sobre el despliegue real. | Preparar entorno y cuentas de QA por rol/sucursal, datos controlados y casos con resultados esperados. CI automática recomendable. |
| Alta si se promete multiempresa | Usuarios describe ADMIN global, BODEGUERO/AUXILIAR por sucursal; Gerente no está implementado. | Entregar con los tres roles actuales y alcance explícito. Gerente y aislamiento empresarial requieren diseño y validación propios, no solo otra opción de menú. |
| Media, alta a gran volumen | Dashboard, Lotes, Movimientos, Dispensación y Reportes usan obtenerOperacion; la lectura recupera todas las filas en bloques de 500 y luego arma el conjunto completo. | Medir con volumen objetivo. Paginar tablas no equivale a limitar transferencia total. Reducir consultas por módulo y agregar métricas en servidor si el volumen lo requiere. |
| Media | El catálogo importado no aporta código/presentación/vida útil en todos los productos; existen códigos históricos inválidos con advertencia. | Depurar únicamente los medicamentos del escenario de entrega con el envase y registro oficial, sin inventar GTIN. Comprobar bloqueo de recepción si faltan datos requeridos. |
| Media | Lector probado mediante entrada simulada; falta evidencia con hardware. | Verificar lector HID, Enter, códigos reales, lecturas consecutivas y ausencia de guardado accidental. |
| Media | No se encontraron error.tsx/global-error.tsx específicos de la app. Sí existen estados de error de consultas. | Evaluar recuperación de excepciones no controladas; no reemplaza probar fallos de red de las consultas. |
| Media | No se encontró evidencia de ensayo de restauración y despliegue reproducible en esta revisión. | Documentar entorno, migraciones conciliadas, copia/restauración y responsable del despliegue. No ejecutar migraciones antiguas otra vez. |
| Baja | Las pruebas emiten MODULE_TYPELESS_PACKAGE_JSON al importar TS. | Resolver de forma compatible si se considera necesario; no cambiar todo el proyecto a ESM solo para silenciarlo. |

## Recorrido que debe cubrir QA

- Login: credenciales erróneas, sesión caducada, cuenta inactiva, cierre de sesión y acceso directo a rutas/API sin permiso. Documentación actual describe cuentas reales; no reintroducir acceso temporal automáticamente.
- Dashboard: métricas conciliadas por rol/sucursal, cero registros, fechas de Chile y enlaces a los listados correctos.
- Productos: alta y edición, duplicados de códigos equivalentes, registro ISP manual, presentación de conteo, entrada USB y Enter sin guardar. Verificar longitudes y errores de guardado.
- Lotes/Recepción: producto previo obligatorio, vencimiento, fabricación opcional, cantidades/costos, doble confirmación, lote repetido y fallo de red sin ingreso duplicado.
- Inventario: filtros/búsqueda global, paginación, existencias cero, vencido y vencimiento de hoy; detalle y actualización después de operaciones.
- Movimientos/Mermas/Traslados: saldo insuficiente, motivo y responsable, alcance de sucursal, conservación de existencias entre origen/destino y confirmación repetida.
- Dispensación: FEFO, lote más antiguo, ubicación correcta, concurrencia entre operadores y bloqueo de lotes no aptos. No añadir receta o venta monetaria si no pertenece al alcance acordado.
- Alertas: estados, alcance por destinatario, marcado de lectura, corte diario Chile, destinatarios confirmados y entrega Gmail real autorizada.
- Reportes: PDF/XLS, filtros/fechas, valoración parcial, membrete, historial y copia con datos archivados. La firma actual es un espacio para firma manual, no firma electrónica.
- Usuarios: ADMIN global, restricción de otros roles, cuenta inactiva y protección del último administrador; altas/restablecimientos solo con cuentas de QA autorizadas.
- Configuración: datos de farmacia, sucursal/bodega, clasificación sala de ventas, umbrales y persistencia de apariencia.
- Transversal: móvil/escritorio, teclado y foco de diálogos, contraste, estados de carga/error/vacío, red lenta y navegación reiterada.

## Preparación mínima de la candidata

1. Acordar alcance y exclusiones: tres roles y varias sucursales de una farmacia; Mensajes fuera del cierre funcional.
2. Actualizar README y manual breve de operación. Fijar versión/commit candidato; los cambios recientes de Productos siguen locales.
3. Preparar ambiente de QA separado y datos/cuentas autorizados. Evitar movimientos ficticios en la base compartida.
4. Crear matriz de casos anterior con responsable, resultado esperado, evidencia y severidad de defectos.
5. Revisar configuración remota, entrega Gmail y restauración; completar pruebas físicas USB.
6. Aceptar salida de QA solo sin defectos críticos/altos abiertos en el alcance y con limitaciones menores documentadas.

## Verificaciones

85 pruebas automatizadas aprobadas, sin fallos ni omisiones. Lint correcto. Compilación de producción y tipos correctos: el primer intento tuvo EPERM al crear un directorio temporal de .next; al repetir con permisos suficientes terminó correctamente. No se considera un defecto funcional demostrado. No hubo cambios de lógica ni de base de datos durante esta auditoría.
