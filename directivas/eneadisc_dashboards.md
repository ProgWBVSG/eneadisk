# Directiva: ENEADISC Dashboards (Empleado y Administrador)

## Objetivo
Implementar los dashboards diferenciados para **Empleados** (colaboradores) y **Administradores** (RRHH/Dueños), basados en las imágenes de inspiración proporcionadas.

## Entrada (Input)
- Usuario autenticado con rol `employee` o `company_admin`
- Datos del usuario almacenados en `localStorage` (mock)
- Información de eneatipo (si el empleado completó el cuestionario)

## Salida (Output)
- Dashboard funcional con navegación lateral
- Para Empleados: Cuestionario inicial + Vista de perfil + Secciones específicas
- Para Administradores: Panel de análisis + Gestión de equipo + Biblioteca

---

## Arquitectura de Componentes

### Componentes Compartidos
1. **Sidebar** (`components/layout/Sidebar.tsx`)
   - Logo ENEADISC arriba
   - Navegación con iconos
   - Avatar + nombre de usuario
   - Botón "Cerrar Sesión"

2. **DashboardLayout** (`layouts/DashboardLayout.tsx`)
   - Sidebar fijo a la izquierda
   - Contenido principal scrolleable

### Employee Dashboard

#### Flujo de Primera Vez
**Cuando el empleado se registra:**
1. Redirigir a `/dashboard/employee/questionnaire`
2. Mostrar cuestionario de Eneagrama (página completa, sin sidebar hasta terminar)
3. Al finalizar: calcular eneatipo, guardar resultado, mostrar mensaje de bienvenida
4. Redirigir a `/dashboard/employee` (perfil principal)

#### Secciones del Dashboard de Empleado
1. **Mi Perfil ENEADISC** (`/dashboard/employee`)
   - Card grande con eneatipo (número + nombre + descripción)
   - Motivación Principal (con icono verde)
   - Miedo Básico (con icono rojo)
   - Fortalezas (chips/tags)
   - Áreas de Desarrollo (lista con iconos)
   - "Trabajas Mejor Con" (chips de eneatipos compatibles)
   - "Mi Información" (nombre, área, email, último test)
   - Botón: "Repetir Test (Próximamente)"

2. **Mi Progreso** (`/dashboard/employee/progreso`)
   - Gráficos de evolución (placeholder por ahora)
   - "Próximamente: Estadísticas de tu progreso"

3. **Mi Asistente Personal** (`/dashboard/employee/asistente`)
   - Chat UI con asistente IA
   - Mensaje de bienvenida contextual según eneatipo
   - Input para escribir preguntas
   - Placeholder: "Próximamente - Chat con recomendaciones personalizadas"

4. **Mis Tareas** (`/dashboard/employee/tareas`)
   - Estado vacío: "No tienes tareas"
   - Botón: "Crear Primera Tarea"
   - Funcionalidad básica de to-do list (opcional para MVP)

5. **Mi Equipo** (`/dashboard/employee/equipo`)
   - Listado de miembros del equipo (mock)
   - Mostrar eneatipos de compañeros
   - Tarjetas con nombre + eneatipo

6. **Check-ins** (`/dashboard/employee/checkins`)
   - Placeholder: "Próximamente - Registro de estados emocionales"

### Admin Dashboard

#### Secciones del Dashboard de Administrador
1. **Panel Principal** (`/dashboard/company`)
   - Placeholder con mensaje de bienvenida
   - "Gestiona tu equipo, visualiza métricas y toma decisiones"

2. **Gestión de Equipos** (`/dashboard/company/equipos`)
   - Tabla de empleados
   - Columnas: Nombre, Área, Eneatipo, Estado (activo/inactivo)
   - Botón: "Invitar Nuevo Miembro" (muestra el código de invitación)
   - Placeholder para acciones (editar, eliminar)

3. **Análisis y Gráficos** (`/dashboard/company/analisis`)
   - Gráfico de distribución de eneatipos en el equipo
   - Placeholder: "Próximamente - Visualizaciones avanzadas"

4. **Asistente IA** (`/dashboard/company/asistente`)
   - Chat UI para consultas sobre gestión de equipos
   - Placeholder: "Pregunta sobre gestión de eneatipos, conflictos, estrategias de liderazgo"

5. **Biblioteca Eneatipos** (`/dashboard/company/biblioteca`)
   - Lista de los 9 eneatipos
   - Tarjetas expandibles con:
     - Descripción
     - Motivación Principal
     - Miedo Básico
     - Fortalezas
     - Áreas de Desarrollo
     - Mejor compatibilidad con (otros eneatipos)

6. **Seguimiento** (`/dashboard/company/seguimiento`)
   - Placeholder: "Próximamente - Evolución del equipo"

7. **Suscripción** (`/dashboard/company/suscripcion`)
   - Información del plan actual
   - Cards con planes: Básico, Premium, Empresarial
   - Botón: "Cambiar a [Plan]" (solo UI, sin integración de pago)

---

## Cuestionario de Eneagrama

### Estructura
- **Cantidad de preguntas:** 45 preguntas (5 por eneatipo)
- **Formato:** Escala Likert 1-5 (Totalmente en desacuerdo → Totalmente de acuerdo)
- **Diseño:** Una pregunta a la vez (estilo wizard)
- **Progreso:** Barra de progreso arriba mostrando X/45
- **Botones:** "Anterior", "Siguiente", "Finalizar" (solo en la última)

### Cálculo de Resultado
- Sumar puntajes por eneatipo
- El eneatipo con mayor puntaje es el resultado
- Guardar en `localStorage`:
  ```json
  {
    "userId": "emp-xxx",
    "enneagramType": 9,
    "scores": { "1": 15, "2": 12, ... "9": 23 },
    "completedAt": "2026-02-10T03:00:00Z"
  }
  ```

### Preguntas del Cuestionario (Muestra - 45 total)

**Tipo 1 - El Perfeccionista:**
1. Me molesta cuando las cosas no están hechas correctamente.
2. Tengo altos estándares para mí y para los demás.
3. Me considero una persona ética y coherente.
4. Me frustro cuando veo injusticias o errores.
5. Siento que siempre hay margen para mejorar.

**Tipo 2 - El Ayudador:**
6. Me encanta ayudar a los demás sin esperar nada a cambio.
7. Soy muy sensible a las necesidades de otras personas.
8. Me siento realizado cuando puedo ser útil.
9. A veces descuido mis propias necesidades por ayudar.
10. Me gusta que me reconozcan por mi generosidad.

**Tipo 3 - El Triunfador:**
11. El éxito es muy importante para mí.
12. Me motiva alcanzar mis metas y ser reconocido.
13. Me preocupo por mi imagen y cómo me perciben.
14. Soy competitivo y orientado a resultados.
15. Me adapto fácilmente a diferentes situaciones.

**Tipo 4 - El Individualista:**
16. Siento que soy diferente a los demás.
17. Mis emociones son intensas y profundas.
18. Valoro la autenticidad y la expresión personal.
19. A veces me siento incomprendido.
20. Busco significado y belleza en la vida.

**Tipo 5 - El Investigador:**
21. Necesito entender cómo funcionan las cosas.
22. Prefiero observar antes de actuar.
23. Valoro mi privacidad y espacio personal.
24. Me gusta acumular conocimiento.
25. A veces me siento abrumado por las demandas sociales.

**Tipo 6 - El Leal:**
26. Soy leal y comprometido con las personas.
27. Tiendo a anticipar problemas y preparme.
28. Valoro la seguridad y la estabilidad.
29. Busco aprobación y orientación de otros.
30. Puedo ser escéptico y cuestionar las cosas.

**Tipo 7 - El Entusiasta:**
31. Me gusta experimentar cosas nuevas y emocionantes.
32. Evito el aburrimiento y la rutina.
33. Soy optimista y veo el lado positivo.
34. Me cuesta comprometerme con una sola cosa.
35. Disfruto planificar aventuras y proyectos.

**Tipo 8 - El Desafiador:**
36. Soy directo y no tengo miedo al conflicto.
37. Me gusta tener control sobre mi entorno.
38. Defiendo a los que necesitan protección.
39. Soy decidido y tomo acción rápidamente.
40. No me gusta mostrar vulnerabilidad.

**Tipo 9 - El Pacificador:**
41. Busco armonía y evito conflictos.
42. Me adapto fácilmente a los deseos de otros.
43. Soy tranquilo y receptivo.
44. A veces postergo decisiones importantes.
45. Valoro la paz interior y la estabilidad.

---

## Datos de Eneatipos (Para mostrar en dashboards)

```javascript
const ENNEAGRAM_DATA = {
  1: {
    name: "El Perfeccionista",
    description: "Ético, dedicado, confiable. Buscan hacer lo correcto y mejorar las cosas.",
    motivation: "Tener integridad, ser correcto y equilibrado",
    fear: "Ser corrupto o malo",
    strengths: ["Organizado", "Ético", "Confiable", "Mejora continua", "Alto estándar de calidad"],
    growthAreas: ["Flexibilidad", "Autocompasión", "Delegación", "Aceptar imperfecciones"],
    compatibleWith: [2, 7, 9]
  },
  2: {
    name: "El Ayudador",
    description: "Cálido, servicial, generoso. Les gusta ayudar a otros y ser necesitados.",
    motivation: "Ser amado y necesitado",
    fear: "Ser no amado o no deseado",
    strengths: ["Empático", "Generoso", "Cálido", "Intuitivo", "Apoyo emocional"],
    growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"],
    compatibleWith: [1, 4, 8]
  },
  3: {
    name: "El Triunfador",
    description: "Exitoso, orientado a logros, adaptable. Enfocados en metas y reconocimiento.",
    motivation: "Tener éxito y ser admirado",
    fear: "Ser un fracaso o sin valor",
    strengths: ["Ambicioso", "Carismático", "Eficiente", "Motivador", "Adaptable"],
    growthAreas: ["Autenticidad", "Balance vida-trabajo", "Vulnerabilidad", "Valorar el proceso"],
    compatibleWith: [1, 6, 9]
  },
  4: {
    name: "El Individualista",
    description: "Creativo, sensible, expresivo. Buscan identidad única y autenticidad.",
    motivation: "Ser único y auténtico",
    fear: "No tener identidad o significado",
    strengths: ["Creativo", "Empático", "Auténtico", "Introspectivo", "Sensible"],
    growthAreas: ["Estabilidad emocional", "Practicidad", "Gratitud", "Conexión con el presente"],
    compatibleWith: [2, 5, 7]
  },
  5: {
    name: "El Investigador",
    description: "Analítico, objetivo, curioso. Buscan conocimiento y comprensión.",
    motivation: "Ser competente y comprender",
    fear: "Ser incompetente o abrumado",
    strengths: ["Analítico", "Objetivo", "Curioso", "Independiente", "Observador"],
    growthAreas: ["Conexión emocional", "Participación activa", "Compartir conocimiento", "Sociabilidad"],
    compatibleWith: [4, 6, 8]
  },
  6: {
    name: "El Leal",
    description: "Comprometido, responsable, previsor. Valoran la seguridad y lealtad.",
    motivation: "Tener seguridad y apoyo",
    fear: "Estar sin apoyo o guía",
    strengths: ["Leal", "Responsable", "Previsor", "Colaborativo", "Comprometido"],
    growthAreas: ["Confianza", "Toma de decisiones", "Reducir ansiedad", "Independencia"],
    compatibleWith: [3, 5, 9]
  },
  7: {
    name: "El Entusiasta",
    description: "Optimista, espontáneo, versátil. Buscan experiencias nuevas y diversión.",
    motivation: "Ser feliz y experimentar",
    fear: "Ser privado o sentir dolor",
    strengths: ["Optimista", "Entusiasta", "Versátil", "Creativo", "Energético"],
    growthAreas: ["Compromiso", "Enfoque", "Procesar emociones difíciles", "Paciencia"],
    compatibleWith: [1, 4, 8]
  },
  8: {
    name: "El Desafiador",
    description: "Poderoso, decisivo, protector. Buscan control y autonomía.",
    motivation: "Ser fuerte y autónomo",
    fear: "Ser controlado o vulnerable",
    strengths: ["Decisivo", "Protector", "Directo", "Seguro", "Líder natural"],
    growthAreas: ["Vulnerabilidad", "Escucha activa", "Paciencia", "Moderación"],
    compatibleWith: [2, 5, 7]
  },
  9: {
    name: "El Pacificador",
    description: "Pacífico, receptivo, tranquilo. Buscan armonía y evitan conflictos.",
    motivation: "Tener paz y armonía",
    fear: "Perder conexión y fragmentación",
    strengths: ["Mediador", "Paciente", "Receptivo", "Estable", "Armonizador"],
    growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"],
    compatibleWith: [1, 3, 6]
  }
};
```

---

## Algoritmo de Implementación

### Fase 1: Cuestionario
1. Crear componente `QuestionnaireFlow.tsx`
2. Implementar lógica de navegación entre preguntas
3. Guardar respuestas en estado local
4. Calcular puntajes al finalizar
5. Determinar eneatipo ganador
6. Guardar resultado en `localStorage`
7. Redirigir a dashboard

### Fase 2: Dashboard Empleado
1. Crear `DashboardLayout` + `Sidebar`
2. Implementar rutas para cada sección
3. Crear componente `EmployeeProfile` (perfil principal)
4. Mostrar información de eneatipo desde datos estáticos
5. Implementar secciones placeholder (Progreso, Asistente, Tareas, Equipo)

### Fase 3: Dashboard Admin
1. Reutilizar `DashboardLayout` con sidebar diferente
2. Implementar `CompanyPanel` (panel principal)
3. Crear `TeamManagement` (gestión de equipos - tabla mock)
4. Implementar `EnneagramLibrary` (biblioteca con los 9 tipos)
5. Crear secciones placeholder (Análisis, Asistente, Suscripción)

---

## Herramientas
- React + TypeScript
- React Router (rutas nested para dashboards)
- Tailwind CSS (diseño responsive)
- Lucide React (iconos)
- localStorage (persistencia mock)

---

## Restricciones y Consideraciones
- **No implementar backend real:** Todo mock con `localStorage`
- **Cuestionario obligatorio:** Empleados deben completarlo antes de ver dashboard
- **Rutas protegidas:** Verificar autenticación antes de acceder
- **Diseño mobile-friendly:** Sidebar colapsable en móvil
- **Placeholders claros:** Secciones no implementadas deben decir "Próximamente"
- **Colores:** Usar paleta de ENEADISC (púrpura principal, azules, grises)

---

## Checklist de Calidad
- [ ] Cuestionario funciona correctamente (45 preguntas)
- [ ] Cálculo de eneatipo es preciso
- [ ] Sidebar muestra opciones correctas según rol
- [ ] Perfil de empleado muestra datos del eneatipo
- [ ] Admin puede ver listado de equipo
- [ ] Biblioteca de eneatipos muestra los 9 tipos
- [ ] Navegación fluida entre secciones
- [ ] Diseño responsive (móvil + desktop)
- [ ] Logout funciona correctamente
- [ ] Build sin errores
