# DIRECTIVA: ENEADISC_ADMIN_TUTORIAL

> **ID:** ENEA-ADMIN-TUTORIAL-001
> **Estado:** Extendiéndose a Múltiples Páginas
> **Propósito:** Mostrar una visita guiada interactiva (Onboarding modular) a los administradores de la empresa la primera vez que visitan cada sección principal de la plataforma.

---

## 1. Objetivos y Alcance Expandido
- Guiar a las empresas para que entiendan la propuesta de valor del Dashboard, la Gestión de Equipos, el Asistente IA y la Biblioteca.
- Dividir la carga cognitiva mediante tours independientes por página, ejecutados sólo cuando el usuario accede por primera vez a dicha página.
- Ofrecer la libertad de saltar el tutorial y repetirlo desde botones específicos en el header de cada sección.

## 2. Implementación Modular Activa
- Se utilizarán componentes aislados para mantener limpio el código principal:
  - `<AdminTutorial />`: `localStorage.getItem('tutorial_completed_{id}')`
  - `<TeamsTutorial />`: `localStorage.getItem('tutorial_teams_completed_{id}')`
  - `<AITutorial />`: `localStorage.getItem('tutorial_ai_completed_{id}')`
  - `<LibraryTutorial />`: `localStorage.getItem('tutorial_library_completed_{id}')`

## 3. Restricciones
- No iniciar el tutorial si el rol no es `company_admin`.
- Usar identificadores `#tour-{page}-{element}` consistentes (ej. `#tour-ai-chat`, `#tour-teams-list`) para evitar conflictos de selectores entre páginas si `react-joyride` no los desarma correctamente.
- Mantener siempre consistente el color `#9333ea` (`purple-600`) del botón de "Siguiente" o "Finalizar", salvo indicación contraria para no confundir al usuario.
- Evitar saltar entre pantallas. Cada Tour termina en la página donde comenzó.
