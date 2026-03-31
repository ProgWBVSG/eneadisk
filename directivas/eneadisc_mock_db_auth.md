# DIRECTIVA: ENEADISC_MOCK_DB_AUTH

> **ID:** ENEA-MOCK-DB-001
> **Estado:** Implementado (Temporal/Bypass)
> **Motivo:** Backend de Supabase Pausado
> **Propósito:** Permitir el logueo instantáneo de una Empresa y Empleado conectados sin depender de Supabase, usando una Mini Base de Datos en `localStorage`.

---

## 1. Cuentas Creadas en Modo Demo

Se creó un sistema de intercepción en `AuthContext.tsx` que detecta el password específico **"vercel123"**. 
Si se utiliza este password, el sistema omite Supabase por completo (evitando consultas a la API que fallan cuando el proyecto está inactivo) y carga los siguientes perfiles desde código y los persiste en el navegador:

### A) Cuenta Empresa (Administrador)
- **Correo:** `admin@eneadisk.com`
- **Contraseña:** `vercel123`
- **Datos Inyectados:**
  - Nombre: "Empresa Demo (Vercel)"
  - Código de Invitación: `ENEA-DEMO`
  - ID Empresa Mock: `mock-company-1`

### B) Cuenta Empleado (Colaborador)
- **Correo:** `empleado@eneadisk.com`
- **Contraseña:** `vercel123`
- **Datos Inyectados:**
  - Nombre: "Empleado Demo (Vercel)"
  - Eneatipo: 3
  - ID Empresa Mock: `mock-company-1` (conectado a la Empresa Demo)

## 2. Detalles Técnicos Implementados
1.  **Intercepción de `login()`**: Si `password === 'vercel123'`, se retorna el perfil predefinido y guarda un string en `localStorage` (clave: `eneadisk_mock_session`).
2.  **Omisión de Supabase (`useEffect` y `refreshUser`)**: Al recargar la página, React lee primero la cookie del mock. Si existe, obvia la llamada a `supabase.auth.getSession()` lo que garantiza que nunca se mostrará la pantalla de carga infinita cuando Supabase está pausado.
3.  **Logout Seguro**: Se alteró `logout()` para que pueda borrar la sesión del navegador local si está usando el modo Demo, o borrar Supabase si está en producción original.

## 3. Retiro del Entorno
Cuando el dashboard de Supabase se reactive y se quieran usar las cuentas reales de producción, basta con NO usar la contraseña "vercel123", o si se prefiere, eliminar el bloque "Mini-DB Vercel Intercept" en `AuthContext.tsx`.
