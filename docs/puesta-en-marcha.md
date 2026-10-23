# Activación de SIGAF

La aplicación consulta la base Supabase existente, sin exigir las migraciones nuevas. El acceso institucional obtiene el rol desde `public.usuario`. Las tres tarjetas temporales también consultan Supabase, pero solo en lectura.

## Acceso local temporal

En este checkout está activado en `.env.local`. Iniciar con `npm run dev` y abrir `http://localhost:3000/login`: las tarjetas **Admin**, **Bodega** y **Auxiliar** completan el formulario; después se pulsa **Iniciar sesión**. No se crean usuarios en Supabase. La sesión local se firma en el servidor, dura ocho horas y permite navegar según los permisos del perfil seleccionado.

Las tarjetas ya no consultan ni crean datos de ejemplo en `.sigaf-local`. Los datos locales anteriores se conservan sin borrarlos, pero la aplicación no los utiliza. El catálogo se obtiene de `public.producto` mediante la clave pública ya configurada; no se usa `service_role`, no se omiten políticas RLS y no se cambian credenciales.

La sesión temporal se valida en el servidor y solo admite comandos de lectura. Los perfiles operativos se limitan a su sucursal; el catálogo es común. No se puede modificar stock, marcar alertas, editar productos ni cambiar usuarios con estas tarjetas. Los informes pueden descargarse sin insertar registros de emisión. Las consultas usan únicamente los permisos existentes de la clave pública: si Supabase restringe una lectura, la web no eleva privilegios ni vuelve a datos locales.

Si falta únicamente `configuracion` (`PGRST205`/`42P01`), la vista usa los umbrales originales de `001_initial_schema.sql`: 7 y 30 días, sin holgura. Se indica con `esquema_original`, un metadato de la vista, no una columna SQL. No se crea ninguna tabla ni se simula una configuración guardada. Los errores de permisos, red u otras tablas se muestran y no se ocultan. Los campos ausentes (costos, ISP, clasificación de salas) no se inventan. Las operaciones de stock que requieren las funciones nuevas permanecen deshabilitadas en el esquema original.

Si Turbopack falla al iniciar los procesos de estilos en Windows, utilizar `npm run dev -- --webpack`; la compilación alternativa se ejecuta con `npm run build -- --webpack`.

Para retirarlo al pasar a pruebas, cambiar `SIGAF_ACCESO_LOCAL=false` en `.env.local` y reiniciar desarrollo. Las tarjetas desaparecen y las sesiones locales dejan de admitirse. En una compilación de producción el acceso local siempre está deshabilitado, incluso si la variable está en `true`.

El secreto `SIGAF_LOCAL_SESSION_SECRET` se conserva solo en `.env.local`, fuera de Git. Si se prepara otro checkout, generar uno aleatorio de al menos 32 caracteres y activar `SIGAF_ACCESO_LOCAL=true`. Las tarjetas y credenciales ficticias están centralizadas en `src/lib/auth/cuentas-locales.ts` para su futura eliminación.

## Apariencia por rol

Cada perfil tiene su paleta propia, aplicada a todas sus pantallas, formularios y diálogos. El botón de sol/luna del encabezado alterna claro y oscuro sin recargar. La elección se guarda durante un año en una cookie de preferencia independiente por rol (`sigaf_tema_admin`, `sigaf_tema_bodeguero`, `sigaf_tema_auxiliar`) y se aplica desde el primer renderizado; el modo inicial es claro. Las cookies de apariencia no otorgan permisos. Los colores están centralizados en `src/lib/tema/paletas.ts`; los colores sanitarios del semáforo se conservan.

## Migraciones opcionales (no necesarias para consultar la base existente)

La comprobación de solo lectura del 23 de octubre de 2026 confirmó 16 productos en la base configurada y la ausencia de `configuracion`. No se aplicaron cambios al servicio remoto. La consulta del esquema actual funciona sin aplicar los archivos siguientes. Solo deben evaluarse si ambos colaboradores deciden ampliar el esquema y sus políticas.

En una base que ya tiene las tablas de `001_initial_schema.sql`, aplicar en el SQL Editor de Supabase, en este orden:

1. `supabase/migrations/002_operacion_segura.sql`
2. `supabase/migrations/003_resumenes_correo.sql`
3. `supabase/migrations/004_proteger_administracion.sql`

En una base nueva ejecutar primero `001_initial_schema.sql`. No volver a ejecutar la migración inicial sobre tablas existentes. Los archivos 002-004 se ejecutan una sola vez y dentro de transacciones; se probaron contra PostgreSQL aislado con PGlite. En un proyecto ya administrado por Supabase CLI, conciliar el historial de migraciones antes de utilizar `supabase db push`.

Los archivos `seed.sql` y `seed_ampliado.sql` son antecedentes de demostración: no ejecutarlos en producción ni usarlos para crear cuentas de acceso. Los movimientos históricos no se reasignan automáticamente a cuentas nuevas.

### Primera cuenta administradora

Crear la cuenta real en Supabase **Authentication > Users**. Usar el mismo UUID de Auth en `public.usuario`; una fila de usuario con UUID aleatorio no puede iniciar sesión. Para un correo real nuevo, después de crear la cuenta en Auth, adaptar y ejecutar:

```sql
DO $$
DECLARE
  correo text := 'reemplazar-por-correo-real';
  identidad uuid;
  perfil_admin int;
BEGIN
  SELECT id INTO identidad FROM auth.users WHERE email=correo;
  IF identidad IS NULL THEN RAISE EXCEPTION 'Crea primero la cuenta en Supabase Auth'; END IF;
  SELECT id_perfil INTO perfil_admin FROM public.perfil WHERE nombre='ADMIN' ORDER BY id_perfil LIMIT 1;
  IF perfil_admin IS NULL THEN
    INSERT INTO public.perfil(nombre) VALUES ('ADMIN') RETURNING id_perfil INTO perfil_admin;
  END IF;
  INSERT INTO public.usuario(id_usuario,nombre,email,id_perfil,id_sucursal,activo)
  VALUES(identidad,'Administrador de farmacia',correo,perfil_admin,NULL,true)
  ON CONFLICT(id_usuario) DO UPDATE SET id_perfil=perfil_admin,activo=true;
END $$;
```

Si el correo ya pertenece a un perfil de demostración con otro UUID, resolver esa asociación conservando los autores de la auditoría histórica. No reemplazar UUIDs indiscriminadamente. Las siguientes cuentas se crean desde el módulo Usuarios.

## Variables del servidor

Mantener los valores públicos existentes en `.env.local` y completar los nombres de `.env.example`:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública; los permisos efectivos están en RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor: administración de Auth y cron |
| `RESEND_API_KEY` | Envío de resúmenes |
| `RESEND_FROM` | Remitente de un dominio verificado en Resend |
| `CRON_SECRET` | Secreto aleatorio de al menos 24 caracteres |

La clave de servicio nunca se importa en componentes cliente. No guardar secretos en Git. Reiniciar el servidor después de cambiar variables; las variables `NEXT_PUBLIC_*` requieren una nueva compilación de producción.

## Datos maestros y recepción

Desde Configuración registrar razón social, RUT, dirección, director técnico y logo PNG/JPG. Crear sucursales y bodegas con ubicación física. Marcar explícitamente las vitrinas o estantes habilitados como **sala de ventas**; ninguna bodega se habilita por su nombre automáticamente.

Crear categorías de productos si la base todavía no tiene ninguna. El catálogo permite registrar nombre, principio activo, código real del envase, referencia ISP y vida útil en meses. El personal de bodega puede consultar el catálogo; solo ADMIN puede modificarlo.

En Recepción, GS1 admite AI 01 (GTIN), 10 (lote), 17 (vencimiento) y omite AI 21 (serie). Soporta notación con paréntesis y separador GS transmitido por la pistola. Un EAN/UPC simple identifica el producto y exige transcribir lote y fecha del envase. No se generan códigos ni lotes ficticios. Se rechazan los días de fecha no especificados y los identificadores sin soporte.

## Reglas de stock

- El día se calcula en `America/Santiago`, con diferencias de calendario independientes del horario de verano.
- La fecha de vencimiento igual o anterior a hoy queda bloqueada, según el requisito del proyecto. Por defecto: crítico hasta 45 días, preventivo hasta 90, vigente por encima de 90. Los umbrales se guardan en PostgreSQL.
- La holgura también se verifica en SQL. Solo se dispensa desde ubicaciones de sala de ventas y por el primer lote elegible de la sucursal, desempatando por ingreso e identificador.
- Recepción, merma, traslado y dispensación son funciones transaccionales. Los usuarios autenticados no pueden modificar stock directamente. Cada operación usa una clave UUID para evitar dobles descuentos en reintentos. Reusar una clave con otros datos produce un error.
- El auxiliar no puede registrar mermas ni traslados y no recibe acceso de lectura al libro de movimientos. El personal operativo solo accede a su sucursal.
- Los costos históricos ausentes se muestran como valoración parcial, no como costos conocidos iguales a cero.
- Las vistas actualizan datos al recuperar el foco y cada 30 segundos mientras están visibles. PostgreSQL vuelve a comprobar stock, permisos y FEFO en cada operación.

## Cron de vencimientos

Configurar un planificador externo que haga **GET** a `/api/cron/verificar-vencimientos` con `Authorization: Bearer <CRON_SECRET>`. Una ejecución cada 15 minutos sirve como punto de partida; ajustar a la cantidad de destinatarios. El código no instala un planificador ni envía correos durante las pruebas.

El cron registra una alerta por usuario/lote/fecha/estado. ADMIN recibe todas las alertas; BODEGUERO las de su sucursal; AUXILIAR solo las de sala de ventas y sin correo. Las alertas nuevas de ADMIN/BODEGUERO se agrupan en un resumen persistente por destinatario.

Se reservan hasta 6 resúmenes por ejecución, en tandas de 2. La reserva temporal evita que dos ejecuciones reclamen el mismo trabajo. El destinatario, mensaje y clave de idempotencia permanecen estables durante los reintentos. Los errores quedan visibles en Alertas; se reintenta después de 15 minutos, hasta 5 veces. Un resultado ambiguo con más de 23 horas desde el primer intento, una cuenta inactiva o un correo cambiado pasa a `REVISION`, sin reenviarse automáticamente. Revisar el historial del proveedor antes de intervenir una entrega en ese estado. La atención de una alerta y su estado de correo son datos separados.

El estado `ENVIADO` indica aceptación de Resend, no confirmación de lectura ni entrega final al buzón. Fuente: [idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Reportes e ISP

PDF y Excel usan exclusivamente los registros consultados de Supabase y el alcance seleccionado de farmacia/sucursal/bodega. En inventario, las fechas filtran vencimientos; en movimientos y mermas, la fecha de operación. La exportación conjunta incluye inventario, mermas y movimientos, y registra la emisión. La paginación de consultas evita el recorte silencioso a 1.000 filas de PostgREST.

El PDF incorpora membrete, logo configurado, filtros, paginación y espacio de firma. El acta de merma tiene un campo de disposición final/destrucción por completar: una baja informática no acredita una destrucción realizada ni constituye certificación del ISP.

El servicio `isp.ts` valida el formato, construye el enlace a la ficha pública y coteja fabricación/vencimiento contra los meses registrados. **No confirma automáticamente vigencia ni vida útil con una API del ISP.** Esos valores se transcriben después de comprobar la ficha/resolución oficial. No se inventa un servicio externo ni se afirma cumplimiento legal automático. Fuentes: [registro sanitario ISP](https://www.ispch.gob.cl/anamed/medicamentos/registro-sanitario-de-productos-farmaceuticos/), [identificadores GS1](https://ref.gs1.org/ai/).

## Comprobaciones

```sh
npm test
npm run lint
npm run build
```

Las pruebas usan exclusivamente PostgreSQL en memoria, cuentas y productos de prueba locales, sin modificar Supabase ni enviar correos. Cubren migraciones, RLS, FEFO, vencimiento de hoy, holgura, idempotencia, traslados, mermas, usuario inactivo, último administrador, cola de correo, fechas chilenas, GS1, vida útil, filtros, Excel reabierto y PDF paginado. La prueba visual del informe se generó separadamente; no forma parte del inventario real.

La autenticación de extremo a extremo y las entregas de Resend requieren aplicar las migraciones, completar los secretos y disponer de una cuenta real. No se realizaron commits automáticos.
