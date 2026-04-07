# DIRECTIVA: ENEADISC_EMPLOYEE_TUTORIAL

> **ID:** ENEA-EMPLOYEE-TUTORIAL-001
> **Estado:** Activo — Primera Implementación
> **Propósito:** Mostrar una visita guiada interactiva (Onboarding modular) a los empleados la primera vez que visitan cada sección principal de su dashboard.

---

## 1. Objetivos y Alcance

- Guiar a los empleados para que entiendan las funcionalidades clave de su panel personal: Perfil, Progreso, Tareas, Equipo y Check-ins.
- Dividir la carga cognitiva mediante tours independientes por página, ejecutados sólo cuando el usuario accede por primera vez a dicha sección.
- Ofrecer la opción de saltar el tutorial o repetirlo desde el header de cada sección.

## 2. Implementación Modular

Se utilizan componentes aislados:
- `<EmployeeTutorial />`: Tour del perfil/dashboard principal — clave `tutorial_employee_completed_{id}`
- `<EmployeeProgressTutorial />`: Tour de Mi Progreso — clave `tutorial_employee_progress_{id}`
- `<EmployeeTasksTutorial />`: Tour de Mis Tareas — clave `tutorial_employee_tasks_{id}`
- `<EmployeeTeamTutorial />`: Tour de Mi Equipo — clave `tutorial_employee_team_{id}`

## 3. IDs de Tour por Página

### Página: Mi Perfil (`/dashboard/employee`)
- `#tour-emp-profile-header`: Tarjeta del eneatipo principal (header de color)
- `#tour-emp-profile-motivation`: Card de Motivación Principal
- `#tour-emp-profile-strengths`: Card de Fortalezas
- `#tour-emp-profile-compatibility`: Card "Trabajas Mejor Con"
- `#tour-sidebar`: Menú lateral para navegar al resto del dashboard

### Página: Mi Progreso (`/dashboard/employee/progreso`)
- `#tour-emp-progress-stats`: Grid de 4 tarjetas de métricas (check-ins, tareas, score colaboración, energía)
- `#tour-emp-progress-mood`: Sección Estado Emocional
- `#tour-emp-progress-tasks`: Sección Productividad / Tareas
- `#tour-emp-progress-radar`: Radar chart de distribución de eneatipos
- `#tour-emp-progress-checkin-btn`: Botón "Nuevo Check-in"

### Página: Mis Tareas (`/dashboard/employee/tareas`)
- `#tour-emp-tasks-new-btn`: Botón "Nueva Tarea"
- `#tour-emp-tasks-stats`: Grid de estadísticas (Total, Completadas, En Progreso, Pendientes)
- `#tour-emp-tasks-filters`: Grupo de filtros por tipo (Personal / Equipo) y estado
- `#tour-emp-tasks-list`: Lista de tareas renderizadas

### Página: Mi Equipo (`/dashboard/employee/equipo`)
- `#tour-emp-team-list`: Grid de tarjetas de compañeros con su eneatipo y compatibilidad
- `#tour-emp-team-dynamics`: Sección Dinámica del Equipo
- `#tour-emp-team-compatibility`: Sección Tu Compatibilidad
- `#tour-emp-team-tasks`: Sección Tareas del Equipo

## 4. Restricciones

- No iniciar el tutorial si el rol no es `employee`.
- Usar identificadores `#tour-emp-{page}-{element}` consistentes para evitar conflictos entre páginas con react-joyride.
- Mantener siempre el color `#9333ea` (`purple-600`) en el botón "Siguiente" / "Finalizar".
- Cada tour finaliza en la misma página donde comenzó. No redirigir entre rutas durante el recorrido.
- El componente verifica `user.role === 'employee'` antes de ejecutar.
- El tutorial de progreso y equipo SÓLO se muestra si el usuario ya completó el cuestionario (verificar `hasCompletedQuestionnaire(user.id)`).
