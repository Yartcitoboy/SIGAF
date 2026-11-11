# Candidata de QA

Actualización del 8 de noviembre: Mensajes está retirado y la gestión/confirmación de correos es exclusiva de Admin. Ver [cuentas verificadas y pasos del compañero](usuarios-y-correos-2026-11-08.md). El resto de escenarios permanece pendiente de ejecución manual salvo evidencia registrada.

## Alcance cerrado para preparar la entrega

Una farmacia, varias sucursales, ADMIN global y BODEGUERO/AUXILIAR por sucursal. Mensajes es vista previa sin envío; Gerente, empresas independientes, consulta ISP automática y firma electrónica quedan fuera. Conservar el Login real y permisos actuales.

No confundir preparación con ejecución: todos los casos manuales siguientes están POR EJECUTAR. Las pruebas automáticas usan PostgreSQL aislado; smoke comprueba HTTP sin sesión, no interacción E2E autenticada.

## Entorno y evidencias

El responsable prepara un proyecto de QA separado y configura únicamente su URL/clave pública en un archivo de entorno no versionado. Verificar que no apunta al proyecto compartido antes de cualquier alta. Preparar ADMIN y dos pares BODEGUERO/AUXILIAR asignados a sucursales A/B, bodegas y salas de ventas clasificadas. Las cuentas las crea una persona autorizada; no hay contraseñas de prueba en Git.

Crear fichas de prueba identificables, con presentación y códigos válidos que no colisionen con productos reales, solo dentro de QA. Para vencimientos usar el día actual de Chile y fechas relativas; no hardcodear una fecha pasada como futura. Tener lotes vencidos, vencen hoy, críticos, preventivos, vigentes, agotados y dos lotes aptos con fechas diferentes. Prepararlos por un procedimiento autorizado en QA; no desactivar validaciones de producción para introducirlos. Acordar buzones receptores antes de enviar correos.

Registrar versión/commit, ambiente, navegador/dispositivo, usuario/rol, fecha Chile, pasos, resultado real, evidencia y ticket. No capturar contraseñas, tokens ni datos privados. En cada fila consignar APROBADO/FALLIDO/BLOQUEADO y enlace de evidencia; no marcar aprobado por existir el código.

## Matriz manual

| ID | Rol | Acción / condición | Resultado esperado |
|---|---|---|---|
| QA01 | Todos | Login correcto, incorrecto, cuenta inactiva, sesión caducada | Acceso solo con sesión y perfil vigente; mensajes claros. |
| QA02 | Bodega/Auxiliar A | Abrir rutas y llamar API de Admin y sucursal B | Rechazo sin datos de B ni escrituras. |
| QA03 | Admin | Comparar métricas con stock y cambiar alcance | Totales conciliados y fechas de Chile. |
| QA04 | Admin | Crear producto con presentación e ISP manual | Guardado explícito, listado actualizado; enlace ISP no certifica vigencia. |
| QA05 | Admin | Código existente y equivalente con ceros iniciales | Rechazo de duplicado; edición propia válida. |
| QA06 | Admin | Producto sin presentación | Recepción bloqueada con instrucción de completar ficha. |
| QA07 | Bodega | Recibir lote vigente con cantidad/costo | Un lote, entrada e inventario coherentes; autor de sesión. |
| QA08 | Bodega | Lote vencido/hoy, cantidad 0, costo negativo, fecha incoherente | Rechazo, sin escrituras parciales. |
| QA09 | Bodega | Doble clic y reintento tras corte de red al confirmar recepción | Una operación; consultar historial antes de repetir una operación incierta. |
| QA10 | Todos con acceso | Inventario: búsqueda, filtros, página 2, cero resultados | Consulta global, paginación estable, estado vacío recuperable. |
| QA11 | Bodega | Salida mayor al saldo, merma sin motivo | Rechazo; saldo sin cambios. |
| QA12 | Bodega | Merma válida | Motivo/autor/historial y saldo conciliados. |
| QA13 | Rol autorizado | Traslado entre ubicaciones permitidas | Origen baja, destino sube; total conservado y trazabilidad. |
| QA14 | Auxiliar | Recomendar y confirmar FEFO | Primer lote apto; excluye vencidos, hoy y cero según política. |
| QA15 | Dos operadores | Despachar simultáneamente saldo limitado | Sin saldo negativo ni doble descuento; error recuperable. |
| QA16 | Todos | Alertas por destinatario y marcar leído | Cada usuario ve sus alertas; campana se actualiza. |
| QA17 | Admin/destinatario | Revisar corte diario y buzón Gmail autorizado | Resumen correcto, sin duplicados, evidencia en bandeja. |
| QA18 | Admin | PDF/XLS con fechas/tipo y volver a descargar copia | Valores, autor, membrete y firma manual; copia usa archivo histórico. |
| QA19 | Admin | Crear/inactivar cuenta QA, probar último Admin | Permisos vigentes y protección del último Admin. Restablecer credenciales solo por responsable. |
| QA20 | Admin | Configuración de sucursal/bodega/umbral | Persistencia y efecto coherente; no reclasifica por nombre. |
| QA21 | Todos | Tema claro/oscuro, navegación móvil y teclado | Tema propio, foco visible, diálogo accesible y sin desbordamiento. |
| QA22 | Todos | Error de red y excepción de pantalla | Mensaje, reintento y salida; no expone secretos ni repite escrituras. |
| QA23 | Admin/Bodega | Lector físico: conocido, desconocido, manual, consecutivos, doble Enter | Identificador correcto, sin guardado automático ni mezcla de lotes. |
| QA24 | Responsable | Medir producción con volumen objetivo acordado | Registrar tiempos de navegación/consulta/exportación, filas y bytes. No aprobar con datos pequeños solamente. |

## Entrada y salida

Entrada: entorno aislado preparado, alcance acordado, candidata identificada, check y smoke correctos. CI se ejecutará cuando el usuario suba estos archivos; no se afirma que GitHub Actions ya pasó.

Salida: casos críticos ejecutados por los tres roles; cero defectos críticos/altos abiertos en alcance; limitaciones menores aceptadas, evidencia Gmail/USB y restauración documentadas. El usuario decide el commit; este trabajo no publica ni despliega automáticamente.
