# SIGAF

Inventario farmacéutico, trazabilidad por lotes, dispensación FEFO y alertas de caducidad. Proyecto de portafolio / título.

## Alcance de la candidata a QA

Una farmacia con varias sucursales y tres roles: ADMIN global; BODEGUERO y AUXILIAR con sucursal asignada. Incluye Productos, Recepción/Lotes, Inventario, Movimientos/Mermas/Traslados, Dispensación, Alertas, Reportes, Usuarios y Configuración. Mensajes fue retirado. Gerente y aislamiento entre empresas independientes quedan fuera de esta versión.

Solo Admin gestiona los correos: registra la dirección desde Usuarios, solicita su código y confirma el destinatario con los dígitos que este le comunique. Bodeguero y Auxiliar reciben las alertas de su alcance sin formularios de verificación. Consulta [cuentas y flujo de pruebas](docs/usuarios-y-correos-2026-11-08.md).

El lector USB HID captura el código. El lector del catálogo recupera fichas vinculadas. El ISP se ingresa y comprueba manualmente; no hay consulta automática externa por GTIN. Los lotes requieren producto previo y vencimiento propio. Escanear no guarda.

## Tecnologías

Next.js 16.3.6, React 19, TypeScript, Tailwind CSS 4, componentes propios, Lucide, Sonner y contratos Zod. Supabase Auth, PostgreSQL/RLS y funciones protegidas. PDF con jsPDF/AutoTable; Excel con SheetJS. Fechas mediante utilidades propias e Intl. Correo con Gmail API/OAuth y programación en Supabase. Resend no es el proveedor vigente.

## Preparación

Node 22.18 o posterior compatible y npm. CI fija Node 22.18.0.

1. Ejecutar `npm ci`.
2. Copiar `.env.example` a `.env.local` y configurar URL y clave pública. Nunca poner secretos en Git.
3. Revisar [puesta en marcha](docs/puesta-en-marcha.md) antes de preparar la base. No repetir migraciones sobre la base compartida.
4. Ejecutar `npm run dev` y abrir http://localhost:3000.

`npm run check` ejecuta lint, tipos, pruebas y compilación webpack. `npm run smoke`, después de compilar, comprueba login y rechazo de acceso sin sesión en una instancia temporal, sin escrituras. CI utiliza valores ficticios sin acceso a la base real.

Para medir rendimiento usar `npm run build -- --webpack` y `npm run start`. Productos e Inventario tienen paginación en servidor; otras vistas aún recuperan conjuntos completos. No se promete capacidad de miles de filas sin medición.

## Estructura

- `src/app`: pantallas, rutas API y recuperación de errores.
- `src/componentes`: interfaz y formularios.
- `src/lib`: servicios, permisos, contratos y utilidades.
- `src/tipos`: modelos TypeScript.
- `supabase`: migraciones, importaciones y funciones.
- `tests`: dominio, servicios y PostgreSQL aislado.
- `scripts`: comprobaciones de la candidata.

## Entrega

Para el video, el usuario autorizó el 10 de noviembre una carga DEMO identificada en Supabase: seis productos con códigos internos, costos de referencia y 38 lotes repartidos entre Central y Providencia. No son datos sanitarios/comerciales acreditados. Los registros anteriores se conservaron. Ver [datos y recorrido para el video](docs/datos-video-2026-11-10.md).

Posteriormente se completaron las 198 fichas importadas con códigos internos INT-ISP, categorías operativas y presentaciones marcadas (ref.). Los nombres y registros ISP se conservaron; el contenido del envase requiere confirmación antes de uso real. Ver [catálogo referencial](docs/catalogo-referencial-2026-11-10.md).

- [Plan y casos de QA](docs/qa-candidata-2026-11-03.md).
- [Despliegue y recuperación](docs/despliegue-recuperacion.md).
- [Estado de los ocho pendientes](docs/cierre-pre-qa-2026-11-03.md).
- [Gmail](docs/alertas-gmail-2026-10-30.md).
- [Productos](docs/productos-ingreso-simple-2026-10-31.txt).

Los documentos históricos describen el estado de su fecha. Las pruebas aisladas no alimentan el inventario real. Los reportes incluyen espacio de firma manual, no firma electrónica.
