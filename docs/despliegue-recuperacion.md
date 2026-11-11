# Despliegue y recuperación de SIGAF

## Preparar la candidata

1. Elegir commit y archivo de bloqueo, Node compatible (CI: 22.18.0) y ambiente de destino.
2. Instalar con npm ci; ejecutar npm run check y luego npm run smoke. Un error de permisos de archivos no se soluciona eliminando datos de la base.
3. Configurar URL y clave pública del proyecto correcto. Secretos de Google y de las funciones permanecen fuera de Git y del navegador.
4. Comparar migraciones remotas con los archivos y registros de aplicación del repositorio. No ejecutar de nuevo 001 ni todo el directorio en una base existente. Conciliar también versiones de funciones Usuarios/Alertas. Las importaciones ISP son datos, no un requisito de cada despliegue.
5. Configurar URL pública, redirecciones de Auth y OAuth correspondientes al destino. Comprobar login, permisos, zona Chile y acceso a las funciones sin publicar credenciales.
6. Compilar y arrancar con npm run start, o usar un alojamiento compatible con rutas servidor de Next.js. No exportar como sitio puramente estático.
7. Registrar fecha, versión, destino, persona responsable y resultado de comprobaciones. Verificar métricas, reportes y programación diaria tras el despliegue.

## Copia y restauración: requiere responsable

Antes de cambiar esquema o desplegar, identificar la política de respaldo disponible en el proyecto y obtener una copia recuperable por el mecanismo autorizado. Custodiarla fuera de Git con acceso restringido. Confirmar qué incluye: datos, esquema, Auth, archivos de Storage si existen, funciones, cron y configuración. No asumir que una copia SQL recupera secretos externos o consentimientos Google.

Ensayar la restauración SOLO en un destino aislado: conciliar migraciones, restaurar por el procedimiento de la plataforma y recrear configuración externa desde el gestor autorizado. Nunca copiar tokens reales a un entorno de QA. Mantener desactivados los envíos de correo y el cron en el destino restaurado hasta que el responsable autorice su uso.

Validar integridad: cantidades por tabla y claves foráneas, suma de existencias por lote/ubicación, historial de entradas/salidas/mermas, autenticación y permisos de los tres roles, archivos de reportes. Registrar inicio/fin, tiempo real de recuperación y punto de recuperación. Declarar aprobado solo con evidencias.

Ante un fallo de interfaz, revertir a una versión compatible conocida. No revertir datos operativos a ciegas ni ejecutar SQL inverso sobre movimientos. Revisar si la operación incierta ya se registró antes de repetirla. La restauración de la base compartida es una acción separada que requiere autorización concreta.

Estado: procedimiento preparado; no se creó un proyecto de pago, no se copió la base compartida ni se ensayó una restauración durante este cambio. El responsable debe completar destino, responsable, ubicación del respaldo, versión restaurada, duración, conciliación y evidencia.
