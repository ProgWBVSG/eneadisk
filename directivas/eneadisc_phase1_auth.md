# DIRECTIVA: ENEADISC_PHASE1_AUTH

> **ID:** ENEA-PH1-AUTH-001
> **Script Asociado:** `scripts/phase1_auth.py`
> **Última Actualización:** 2026-01-25
> **Estado:** BORRADOR

---

## 1. Objetivos y Alcance
- **Objetivo Principal:** Implementar el sistema de autenticación completo (Login y Registro) según especificación.
- **Alcance:**
    - Layout de Autenticación (`AuthLayout`).
    - Componentes UI Base: `Button`, `Input`, `Card`, `Badge`.
    - Vistas: Login (Selección de Rol), Registro Admin (Wizard), Registro Colaborador (Código).
    - Estado: Contexto de Auth Mock (guardado en localStorage por ahora).
    - Routing: Configuración de rutas `/login`, `/registro/*`.

## 2. Especificaciones de Entrada/Salida (I/O)

### Entradas
- **Paleta de Colores:** Definida en `tailwind.config.js`.
- **Assets:** Iconos de `lucide-react`.

### Salidas
- **Archivos Modificados/Creados:**
    - `src/components/common/*` (Button.tsx, Input.tsx, etc.)
    - `src/components/layout/AuthLayout.tsx`
    - `src/pages/auth/*`
    - `src/routes.tsx` (o App.tsx actualizado)
    - `src/context/AuthContext.tsx`
- **Funcionalidad:**
    - Usuario puede navegar entre login y registros.
    - Registro de Admin guarda datos en localStorage (simulando DB).
    - Registro de Colaborador valida "código" (mock).

## 3. Flujo Lógico (Algoritmo del Script)

1.  **Validación Previa:** Asegurar que `eneadisc/node_modules` existe.
2.  **Generación de Componentes UI Base:**
    - Crear `Button.tsx`: Soportar variantes (primary, secondary, outline) y estados (loading).
    - Crear `Input.tsx`: Integrado con `react-hook-form` (forwardRef).
    - Crear `Card.tsx`: Contenedor genérico con estilos "Glassmorphism" opcionales.
3.  **Implementación de AuthLayout:**
    - Diseño centrado con fondo suave (posiblemente degradado dorado/azul suave).
    - Contenedor para el logo y el contenido variable (Outlet).
4.  **Implementación de Vistas:**
    - `LoginSelection.tsx`: Cards grandes para elegir Admin vs Colaborador.
    - `RegisterAdmin.tsx`: Implementar Wizard de 4 pasos (Empresa, Admin, Seguridad, Confirmación).
    - `RegisterCollaborator.tsx`: Flujo de código de invitación + datos.
5.  **Configuración de Rutas:**
    - Actualizar `App.tsx` con `react-router-dom` defininedo las rutas.

## 4. Herramientas y Librerías
- `react-cornerstone`: No usamos esto, escribimos componentes desde cero con Tailwind.
- `react-hook-form` + `zod`: Para validación de formularios complejos (Wizard).
- `framer-motion`: Para transiciones entre pasos del wizard.

## 5. Restricciones y Casos Borde
- **Responsive:** Verificar que el Wizard se vea bien en mobile.
- **Validación:** El código de empresa debe tener formato específico (ej: ENEA-XXXX).

## 6. Protocolo de Errores
| Fecha | Error Detectado | Causa Raíz | Solución |
|-------|-----------------|------------|----------|
| N/A | N/A | N/A | N/A |

## 7. Ejemplos de Uso
```bash
python scripts/phase1_auth.py
```
