# Migración EneaTeams → Nuevo Proyecto Supabase

## Qué hay en esta carpeta

| Archivo | Contenido |
|---|---|
| `01_schema.sql` | Todas las tablas e índices |
| `02_rls.sql` | Row Level Security (permisos) |
| `03_triggers.sql` | Triggers automáticos (updated_at, crear perfil al signup) |

---

## PASO 1 — Crear nuevo proyecto Supabase

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) con la cuenta nueva
2. **New Project** → poner nombre "eneateams" → elegir región más cercana → guardar la contraseña
3. Esperar que el proyecto termine de provisionar (~2 minutos)

---

## PASO 2 — Ejecutar los SQL en orden

1. Ir a **SQL Editor** en el nuevo proyecto
2. Abrir `01_schema.sql` → copiar todo → pegar → **Run**
3. Abrir `02_rls.sql` → copiar todo → pegar → **Run**
4. Abrir `03_triggers.sql` → copiar todo → pegar → **Run**

Si alguno da error de "ya existe", está bien — podés ignorarlo o agregar `IF NOT EXISTS`.

---

## PASO 3 — Configurar Google OAuth en el nuevo proyecto

1. En el nuevo proyecto Supabase → **Authentication → Providers → Google** → activar
2. Pegar el **Client ID** y **Client Secret** de Google Cloud Console
3. En **Authentication → URL Configuration**:
   - **Site URL**: `https://tu-app.vercel.app`
   - **Redirect URLs** agregar: `https://tu-app.vercel.app/auth/callback`

> Si ya tenés las credenciales de Google del proyecto anterior, las mismas sirven —
> solo actualizá el **Authorized redirect URI** en Google Cloud Console para agregar
> la URL del callback del NUEVO proyecto Supabase:
> `https://NUEVO_PROJECT_ID.supabase.co/auth/v1/callback`

---

## PASO 4 — Obtener las nuevas credenciales

En el nuevo proyecto Supabase → **Project Settings → API**:
- Copiar **Project URL** (algo como `https://xxxxx.supabase.co`)
- Copiar **anon public key**

---

## PASO 5 — Actualizar el código de la app

Abrir el archivo `eneadisc/src/lib/supabase.ts` y reemplazar:

```typescript
const FALLBACK_URL = 'https://NUEVO_PROJECT_ID.supabase.co';
const FALLBACK_KEY = 'NUEVO_ANON_KEY_AQUI';
```

O mejor, crear el archivo `eneadisc/.env.local`:
```
VITE_SUPABASE_URL=https://NUEVO_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=NUEVO_ANON_KEY_AQUI
```

Y en Vercel → **Settings → Environment Variables** agregar las mismas dos variables.

---

## PASO 6 — Re-deployar en Vercel

```bash
cd eneadisc
npm run build
```
Luego push a git → Vercel re-deploya automáticamente.

---

## Notas sobre los datos existentes

Los **usuarios registrados** en el proyecto viejo **NO se migran automáticamente** 
(Supabase no permite exportar contraseñas). Opciones:

- **Si no hay usuarios reales todavía** (solo pruebas): no hace falta migrar nada, 
  empezar de cero con el nuevo proyecto.
- **Si hay usuarios reales con datos**: contactar a soporte de Supabase 
  (support@supabase.io) para solicitar una migración oficial de auth.users,
  o pedir a los usuarios que se re-registren.

Los datos en `companies`, `profiles`, `teams`, `tasks`, `checkins` SÍ se pueden 
exportar desde el proyecto viejo (Table Editor → Export as CSV) e importar en el nuevo.
