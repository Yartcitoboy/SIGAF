# Espacio de Backend & Supabase (Docker)

Esta carpeta está reservada para el compañero a cargo del Backend e Infraestructura.

## Estructura Sugerida
- `migrations/`: Scripts SQL con las 13 tablas (`001_initial_schema.sql`).
- `seed.sql`: Datos iniciales (perfiles: ADMIN, BODEGUERO, AUXILIAR; categorías base, sucursal piloto).
- `config.toml`: Configuración local de Supabase CLI (`supabase init`).

## Pasos para iniciar en local
```bash
# 1. Instalar Supabase CLI si no lo tienes
# 2. Inicializar y levantar servicios en Docker
supabase start

# 3. Copiar las credenciales generadas (API URL y Anon Key) al archivo .env.local del Frontend
```
