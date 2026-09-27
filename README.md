# SIGAF — FarmaVence
### Sistema Inteligente de Gestión de Inventario con Alertas de Caducidad
**Proyecto de Título / Capstone · Duoc UC**

---

## 📌 Descripción del Proyecto
SIGAF es una solución SaaS diseñada para farmacias independientes que optimiza la gestión del inventario farmacéutico mediante el algoritmo **FEFO** (*First Expired, First Out*), control visual tricolor de caducidad (Semáforo de Riesgo), alertas automatizadas de vencimiento y registro de mermas y devoluciones.

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Componentes:** shadcn/ui (Radix UI) + Lucide React
- **Gestión de Formularios:** React Hook Form + Zod
- **Manejo de Fechas & FEFO:** Date-fns
- **Reportes:** jsPDF + jsPDF-AutoTable
- **Feedback:** Sonner (Toasts)

### Backend & Persistencia
- **Motor:** PostgreSQL sobre Supabase (Docker / Local)
- **API Interna:** PostgREST automático de Supabase
- **Autenticación:** Supabase Auth (JWT + RBAC: ADMIN, BODEGUERO, AUXILIAR)

### Integraciones Externas
- **Alertas por Correo:** Resend REST API
- **Cron Jobs:** Planificador nocturno automatizado
- **Catálogo Fármacos:** Integración de consulta ISP / Minsal

---

## 🚀 Inicio Rápido (Desarrollo Frontend)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Ajusta las credenciales según tu instancia de Supabase (Docker o Cloud).

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Repositorio
```text
SIGAF/
├── docs/                 # Documentación del proyecto (Mockups, Casos de Uso, Modelo de Datos)
├── supabase/             # Espacio de migraciones y configuración local de Supabase (Docker)
├── src/
│   ├── app/              # Rutas y páginas de Next.js (App Router)
│   ├── components/       # Componentes de interfaz (UI, Semáforo, Layouts)
│   ├── lib/              # Configuración de clientes (Supabase client/server)
│   ├── services/         # Servicios de llamada a APIs (Supabase, ISP, Resend)
│   └── types/            # Interfaces TypeScript de las 13 tablas de la base de datos
```
