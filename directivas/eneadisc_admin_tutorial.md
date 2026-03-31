# DIRECTIVA: ENEADISC_ADMIN_TUTORIAL

> **ID:** ENEA-ADMIN-TUTORIAL-001
> **Estado:** En Planificación
> **Propósito:** Mostrar una visita guiada interactiva (Onboarding) a los administradores de la empresa la primera vez que inician sesión. Debe poder ser repetido manualmente.

---

## 1. Objetivos y Alcance
- Guiar a las empresas para que entiendan la propuesta de valor del dashboard inicial.
- Incluir pasos claros que destaquen métricas, acciones rápidas (generar enlace) y opciones del menú lateral.
- Ofrecer la libertad de saltar el tutorial y repetirlo desde un botón en `CompanyPanel`.

## 2. Herramientas Recomendadas
- `react-joyride` (Gestión completa de los modales guiados "ToolTip").
- `localStorage` (Para recordar la confirmación visual de que el tutorial fue finalizado).

## 3. Restricciones
- No iniciar el tutorial si el rol no es `company_admin`.
- Usar un z-index adecuado para que la máscara (overlay) no quede por debajo del Header/Sidebar existente. (El Sidebar suele tener un z-index alto en Tailwind como `z-40` o `z-50`).

## 4. Configuración
- Añadir el componente `<AdminTutorial run={boolean} onFinish={callback} />` directamente en la vista raíz del dashboard empresa.
- Establecer etiquetas de IDs únicas (`#tour-stats`, `#tour-invite`) para garantizar consistencia. 

*(Desarrollo pendiente de aprobación de dependencias)*
