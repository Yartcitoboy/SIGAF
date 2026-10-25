# SIGAF — Pendientes por revisar / validar

Este documento lista el estado de la integración del frontend con Supabase y las tareas que quedan pendientes.

_Última actualización: por el equipo._

---

## ✅ Módulos conectados a Supabase (10 de 10) — COMPLETO

| Módulo | Estado | Tablas que consume | Notas |
|--------|--------|--------------------|-------|
| Login | ✅ Conectado | `usuario`, `perfil` | Validación demo (clave `sigaf2026`). Falta Supabase Auth real. |
| Productos | ✅ Conectado | `producto`, `categoria` | Lectura con búsqueda y filtros. |
| Inventario | ✅ Conectado | `inventario`, `lote`, `producto`, `bodega` | Semáforo calculado en tiempo real. |
| Lotes | ✅ Conectado | `lote`, `producto`, `inventario` | Ordenado por vencimiento (FEFO). |
| Movimientos | ✅ Conectado | `movimiento_inventario`, `usuario`, `sucursal` | Muestra responsable real. |
| Usuarios | ✅ Conectado | `usuario`, `perfil`, `sucursal` | Rol y estado reales. |
| Alertas | ✅ Conectado | `notificacion` | "Marcar atendida" actualiza la BD. |
| Configuración | ✅ Conectado | `farmacia`, `sucursal` | Datos corporativos y sucursales reales. |
| Reportes | ✅ Conectado | `inventario`, `reporte`, `farmacia` | Genera PDF con datos reales, registra en `reporte` y muestra historial. |
| Dashboard | ✅ Conectado | `inventario`, `lote`, `notificacion` | KPIs calculados en tiempo real desde la BD. |

---

## ⏳ Pendiente menor

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Gráficos del Dashboard | ⚠️ Parcial | Los componentes `GraficoDistribucionSemaforo` y `GraficoVencimientosMeses` aún usan su mock interno. Los KPIs, tablas y alertas del dashboard sí están conectados. |

---

## 🔧 Tareas técnicas pendientes (importantes)

### 1. Autenticación real (Supabase Auth)
- **Estado:** el login actual es una validación de demostración (compara email contra la tabla `usuario` y usa una clave común `sigaf2026`).
- **Falta:** integrar **Supabase Auth** para que el login use el sistema seguro de Supabase (verificación real de contraseña, tokens JWT, recuperación de clave).
- **Por qué importa:** es un requisito de seguridad del proyecto (ERS/DAS).

### 2. Row Level Security (RLS)
- **Estado:** las tablas se crearon **SIN RLS** (ejecutamos "Run without RLS").
- **Falta:** activar RLS y crear las **políticas de acceso por rol** (ADMIN, BODEGUERO, AUXILIAR).
- **Por qué importa:** sin RLS, cualquiera con la clave pública puede leer/escribir en la BD. Es crítico antes de dejar el repo público o entregar.

### 3. Operaciones de escritura (crear/editar/eliminar) — ✅ COMPLETADO
- **Estado:** TODAS las operaciones de escritura están implementadas y conectadas a Supabase.
  - Productos: crear, editar, eliminar
  - Usuarios: crear, editar
  - Configuración: actualizar farmacia, crear/editar sucursal
  - Lotes: registrar entrada (crea lote + inventario + movimiento), imprimir etiqueta
  - Movimientos: registrar merma y traslado (descuenta stock y registra en tabla merma)
  - Reportes: exportar PDF y Excel (CSV), con registro en tabla reporte
- Ya no queda ningún boton con `alert()` placeholder.

### 4. Funciones RPC en la BD
- **Estado:** el script `001_initial_schema.sql` incluye las funciones `fn_fefo_siguiente_lote` y `fn_estado_semaforo`, pero el frontend aún calcula el semáforo en JavaScript.
- **Falta:** usar las funciones RPC desde el front para que la lógica crítica (FEFO) viva en el servidor.

### 5. Campo `lote_afectado` en notificaciones
- **Estado:** el front esperaba este campo pero no existe como columna en la tabla `notificacion` (era un dato del mock).
- **Opciones:** agregar la columna a la tabla, o dejarlo fuera (el mensaje ya incluye el número de lote).

### 6. Envío de correos (Resend)
- **Estado:** la pantalla de Alertas menciona el envío por correo, pero no está implementado.
- **Falta:** configurar `RESEND_API_KEY` en el `.env` y crear la Edge Function / cron que envíe los correos de caducidad.

---

## 🧪 Cosas por validar (pruebas)

- [ ] Confirmar que cada módulo conectado lee datos reales (editar un dato en Supabase y verificar que se refleja).
- [ ] Probar el login con los 3 usuarios (admin, bodega, cajero) y clave `sigaf2026`.
- [ ] Verificar que los filtros (por bodega, por semáforo, búsqueda) funcionan con los datos reales.
- [ ] Revisar que el cálculo del semáforo sea correcto según la fecha actual.
- [ ] Validar que "Marcar atendida" en Alertas persiste al recargar la página.

---

## 📁 Archivos nuevos creados en esta integración

**Servicios (capa de acceso a datos):**
- `src/lib/servicios/auth.ts`
- `src/lib/servicios/productos.ts`
- `src/lib/servicios/inventario.ts`
- `src/lib/servicios/lotes.ts`
- `src/lib/servicios/movimientos.ts`
- `src/lib/servicios/usuarios.ts`
- `src/lib/servicios/notificaciones.ts`
- `src/lib/servicios/configuracion.ts`

**Base de datos:**
- `supabase/migrations/001_initial_schema.sql`
- `supabase/seed.sql`
- `supabase/seed_ampliado.sql`

**Página nueva:**
- `src/app/login/page.tsx`

---

## 🎯 Orden sugerido para continuar

1. Conectar **Reportes** (que exporte PDF/Excel con datos reales).
2. Conectar **Dashboard** (KPIs calculados desde la BD).
3. Implementar **Supabase Auth** real (login seguro).
4. Activar **RLS** con políticas por rol.
5. Implementar las operaciones de **escritura** (crear/editar/eliminar) en los mantenedores.
6. Configurar el **envío de correos** con Resend.
