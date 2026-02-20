# DIRECTIVA: ENEADISC_ENTRY_FLOW

> **ID:** ENEA-ENTRY-001
> **Script Asociado:** `scripts/implement_entry_flow.py`
> **Dependencias:** `eneadisc_setup.md` (Estructura base)
> **Estado:** ACTIVO

---

## 1. Objetivos y Alcance
- **Objetivo:** Implementar la experiencia de entrada "Zero Friction" con split de roles.
- **Alcance:**
  1.  **Landing Page (`/`)**: Diseño partido (Split Screen) para selección de rol.
  2.  **Flujo Empresa (`/auth/company`)**:
      - Registro Básico.
      - Wizard de Contexto (Industria, Tamaño, Desafíos).
      - Generación de Código de Invitación (Mock).
  3.  **Flujo Empleado (`/auth/employee`)**:
      - Ingreso por Código (6 dígitos).
      - Onboarding Contextual (Rol, Antigüedad).

## 2. Especificaciones de Diseño (UX/UI)
- **Tono Visual:** "Profesional pero accesible".
- **Paleta:**
  - **Empresa (Izquierda):** Tonos Deep Blue / Slate. Serio, estratégico.
  - **Empleado (Derecha):** Tonos Light Gold / Warm Gray. Acogedor, personal.
- **Interacción:** Animaciones suaves al hacer hover sobre cada lado del split.

## 3. Arquitectura de Componentes
### `src/layouts`
- `EntryLayout.tsx`: Layout base para flujos de entrada (sin sidebar de app).

### `src/pages/entry`
- `LandingSplit.tsx`: Componente principal de la home.
  - `RoleCard`: Componente reutilizable para cada lado del split.

### `src/pages/auth/company`
- `CompanyRegisterStep1.tsx` (Datos Cuenta).
- `CompanyRegisterStep2.tsx` (Datos Organización).
- `CompanyRegisterStep3.tsx` (Desafíos/Valores).

### `src/pages/auth/employee`
- `EmployeeJoinCode.tsx`: Input centrado grande para el código.
- `EmployeeOnboarding.tsx`: Formulario breve perfilamiento.

## 4. Estructura de Datos (Mock)
Como no hay backend real aún, usaremos `localStorage` y `Context`.

```typescript
// AuthContext
interface Company {
  id: string;
  name: string;
  industry: string;
  inviteCode: string; // Generado ej: "ENEA-8821"
}

interface Employee {
  id: string;
  companyId: string; // Relación
  role: string;
}
```

## 5. Algoritmo de Implementación (Script)
1.  **Verificación:** Asegurar que las dependencias (`react-router-dom`, `lucide-react`, `@hookform/resolvers`) estén instaladas.
2.  **Scaffolding:** Crear estructura de carpetas `src/pages/entry`, `src/pages/auth`.
3.  **Generación de Componentes:**
    - Crear `LandingSplit.tsx` usando **CSS Transitions** para efectos de hover (Framer Motion eliminado por problemas de build).
    - Crear Wizards de registro usando `react-hook-form` + `zod` para validación.
4.  **Enrutamiento:** Configurar `react-router-dom` en `App.tsx` para manejar las nuevas rutas.

## 6. Restricciones
- **No Backend:** Todo estado debe persistir al recargar (usar hooks de localStorage).
- **Responsive:** El "Split" debe pasar a "Stack" (uno encima de otro) en móviles.

## 7. Checklist de Calidad
- [ ] El split en Landing es fluido y responsivo.
- [ ] El código de empresa se genera y es único (mock).
- [ ] El empleado no puede entrar sin un código válido (validar contra localStorage).
