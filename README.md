# SIGAF — Sistema de Gestión de Almacén Farmacéutico

Aplicación web para gestionar medicamentos, lotes, inventario, movimientos, dispensación FEFO, alertas de caducidad y reportes PDF/Excel en una farmacia con varias sucursales.

Esta entrega contiene el código necesario para ejecutar la web conectada al **proyecto Supabase existente**. La base de datos, las cuentas, las funciones de Usuarios/Alertas y la programación de correos permanecen en Supabase.

## Instalación para la profesora

### Requisitos

- Node.js 22.18 o posterior compatible y npm, incluido con Node.js.
- Navegador actualizado y conexión a Internet.
- URL y clave pública del proyecto Supabase, más una cuenta de evaluación proporcionada por el equipo por un canal privado.

No se necesita instalar PostgreSQL, Docker ni Supabase CLI. Visual Studio Code es opcional para ejecutar la aplicación.

### 1. Instalar dependencias

Descargar y descomprimir el repositorio. En Visual Studio Code, abrir esa carpeta y su terminal integrada. Ejecutar los comandos dentro de la carpeta que contiene `package.json`:

```sh
node --version
npm --version
npm ci
```

`npm ci` instala las versiones de `package-lock.json`; necesita Internet, incluido el acceso a `cdn.sheetjs.com` para la exportación Excel.

### 2. Conectar Supabase

Copiar la plantilla a `.env.local` en la raíz. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En macOS/Linux: `cp .env.example .env.local`.

Editar `.env.local` y reemplazar ambos valores con los del mismo proyecto entregado por el equipo:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

Estas variables contienen la URL y la clave pública `anon`. La sesión y las políticas RLS controlan el acceso. Nunca colocar una clave `service_role`, contraseñas o secretos de Google en ellas. `.env.local` no se publica en Git.

La descarga del código no copia la base ni crea cuentas. La cuenta de evaluación debe existir en Supabase Auth y tener perfil activo, rol y sucursal en SIGAF. La preparación o restauración de otra base corresponde al responsable del proyecto y queda fuera de esta entrega de la web.

### 3. Ejecutar la web

Para evaluar con compilación de producción:

```sh
npm run build -- --webpack
npm run start
```

Abrir [http://localhost:3000/login](http://localhost:3000/login) y utilizar la cuenta de evaluación. Mantener la terminal abierta; `Ctrl+C` detiene el servidor.

Para editar el código: `npm run dev`. Este modo compila durante la navegación y puede tardar más al abrir una pantalla por primera vez. Revisar el puerto indicado en la terminal si el 3000 está ocupado. Después de modificar `.env.local`, reiniciar el servidor y recompilar si se utiliza producción.

## Uso y roles

| Rol | Alcance |
|---|---|
| ADMIN | Todas las sucursales, usuarios, configuración, reportes y conexión Gmail. |
| BODEGUERO | Productos, recepción/lotes, inventario, movimientos, dispensación y alertas según los permisos de su sucursal. |
| AUXILIAR | Inventario, dispensación y alertas de su sucursal. |

Recorrido principal: **Productos → Lotes/Recepción → Inventario → Movimientos o Dispensación → Alertas → Reportes**. Primero se registra el producto; cada lote tiene su propio vencimiento y requiere confirmación antes de guardarse. FEFO prioriza el lote apto que vence antes.

El lector USB HID introduce códigos como un teclado y su Enter no guarda el formulario. El buscador recupera fichas con códigos vinculados; «Nuevo medicamento» captura el código y permite completar los demás datos manualmente. La comprobación del registro ISP es manual.

Solo Admin configura el Gmail remitente y confirma los correos de empleados. Bodeguero y Auxiliar reciben avisos sin esa ventana de configuración. Los correos necesitan un buzón real y una autorización vigente del remitente en Google; sus secretos se custodian en Supabase. El proceso diario reside en la nube y no requiere mantener abierta esta web.

La base compartida conserva datos identificados como DEMO, códigos internos `INT-ISP-*` y presentaciones `(ref.)`. Son referencias de presentación: los códigos internos no equivalen a un EAN/GTIN del fabricante y las presentaciones estimadas requieren comprobar el envase antes de uso real. Las alertas dependen de la fecha actual de Chile. Retirar sus archivos de carga no elimina esos registros remotos.

## Estructura de la entrega

- `src/app`: pantallas, rutas API y autenticación de la web.
- `src/componentes`: interfaz, tablas, formularios y paneles.
- `src/lib`: conexión a Supabase, consultas, validaciones, permisos y servicios utilizados por los módulos.
- `src/context` y `src/tipos`: estado de sesión/tema y tipos del modelo.
- Archivos de configuración, dependencias, `.env.example` y este README.

`node_modules`, `.next`, `next-env.d.ts` y `*.tsbuildinfo` se generan al instalar o compilar y quedan fuera de Git. `.env.local` es la configuración privada de conexión, no una base local. El directorio `.git` conserva el historial del repositorio y no se incluye al descargar un ZIP desde GitHub.

## Comprobaciones

`npm run check` ejecuta lint, revisión de tipos y compilación de producción. También pueden ejecutarse `npm run lint` y `npm run typecheck` por separado. La entrega no incluye la suite de pruebas ni herramientas de carga de datos.

Ante errores de conexión, revisar ambas variables y el proyecto destino. Ante un perfil o permiso inválido, contactar al equipo para revisar la cuenta y su asignación. Si falla Usuarios o Gmail, el responsable debe revisar las funciones protegidas ya desplegadas y la autorización del remitente, sin introducir claves administrativas en el navegador.

## Registro de limpieza — 12 de noviembre de 2026

Se retiraron del directorio y de los archivos de entrega: `AGENTS.md`/`CLAUDE.md`, documentación adicional, pruebas y scripts de QA, configuración de CI que dependía de esas pruebas, migraciones, importaciones, SQL y archivos de demostración, copias locales de funciones remotas, plantillas gráficas y configuración Docker obsoleta. También se retiraron PGlite, Prettier sin uso y dos componentes que no utilizaba ninguna pantalla.

Se trasladó la validación de correo a `src/lib/vistas/correo.ts` para que la web no dependa de una carpeta retirada. Se actualizaron comandos, dependencias y archivo de bloqueo. Se conservaron los servicios que consultan Supabase porque son necesarios para el funcionamiento de los módulos.

Esta limpieza no modifica tablas, políticas, usuarios, datos ni funciones desplegadas en Supabase. Los archivos retirados quedan reflejados como eliminaciones en Git al registrar el commit; no se reescribe el historial anterior. Se mantiene este README como única guía de instalación y registro de cambios.

Verificación de esta entrega: lint, TypeScript y compilación de producción correctos; arranque, diez rutas protegidas y rechazo de peticiones sin sesión/origen ajeno comprobados. La validación de correo trasladada supera ocho casos de comprobación. No se registraron operaciones ni se enviaron correos durante estas verificaciones.
