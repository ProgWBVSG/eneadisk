# Documentación del Cuestionario de Eneagrama para Empleados

Este documento detalla las preguntas realizadas a los nuevos empleados durante el proceso de onboarding y la lógica algorítmica utilizada para determinar su Eneotipo.

## 1. El Cuestionario (Las 5 Preguntas y sus Opciones)

El cuestionario consta de **5 preguntas estratégicas** diseñadas para evaluar diferentes dimensiones del comportamiento profesional y la personalidad. Cada pregunta tiene 9 opciones, y cada opción está mapeada directamente a uno de los 9 eneatipos.

### Pregunta 1: Estilo de Trabajo
**"¿Cuál de estas opciones te describe mejor en el trabajo?"**
*   **Por qué se hace:** Para entender la autoimagen del empleado y su enfoque principal al realizar tareas.
*   **Opciones de Respuesta:**
    *   (Tipo 1) "Busco hacer todo perfectamente y cumplir con altos estándares"
    *   (Tipo 2) "Me gusta ayudar a mis compañeros y crear un ambiente cálido"
    *   (Tipo 3) "Me enfoco en alcanzar metas y obtener resultados exitosos"
    *   (Tipo 4) "Valoro la autenticidad y expresar mi individualidad"
    *   (Tipo 5) "Prefiero analizar información antes de tomar decisiones"
    *   (Tipo 6) "Soy leal y busco la seguridad del equipo"
    *   (Tipo 7) "Me entusiasma explorar nuevas ideas y experiencias"
    *   (Tipo 8) "Tomo el liderazgo y defiendo lo que considero justo"
    *   (Tipo 9) "Busco mantener la armonía y evitar conflictos"

### Pregunta 2: Resolución de Problemas
**"Cuando enfrentas un desafío en el equipo, ¿qué haces primero?"**
*   **Por qué se hace:** Para analizar los mecanismos de respuesta ante la presión y los desafíos.
*   **Opciones de Respuesta:**
    *   (Tipo 1) "Verifico que todo se haga correctamente según los procedimientos"
    *   (Tipo 2) "Ofrezco mi apoyo y ayuda a quien lo necesite"
    *   (Tipo 3) "Busco una solución eficiente que demuestre resultados"
    *   (Tipo 4) "Reflexiono profundamente sobre el significado del problema"
    *   (Tipo 5) "Investigo y analizo todas las opciones disponibles"
    *   (Tipo 6) "Consulto con el equipo y busco orientación"
    *   (Tipo 7) "Veo múltiples posibilidades y pienso en diferentes alternativas"
    *   (Tipo 8) "Tomo acción directa y enfrento el problema de frente"
    *   (Tipo 9) "Busco una solución que satisfaga a todos"

### Pregunta 3: Motivación Intrínseca
**"¿Qué te motiva más en tu día a día laboral?"**
*   **Por qué se hace:** Para identificar el motor interno del empleado.
*   **Opciones de Respuesta:**
    *   (Tipo 1) "Hacer las cosas bien y mantener la integridad"
    *   (Tipo 2) "Sentirme valorado y ser útil para los demás"
    *   (Tipo 3) "Lograr objetivos y ser reconocido por mis logros"
    *   (Tipo 4) "Expresar mi creatividad y ser auténtico"
    *   (Tipo 5) "Aprender cosas nuevas y comprender cómo funcionan"
    *   (Tipo 6) "Tener estabilidad y sentirme parte del equipo"
    *   (Tipo 7) "Disfrutar de variedad y experiencias estimulantes"
    *   (Tipo 8) "Tener autonomía y control sobre mis proyectos"
    *   (Tipo 9) "Trabajar en un ambiente tranquilo y sin tensiones"

### Pregunta 4: Gestión de Conflictos
**"En situaciones de conflicto, tiendes a:"**
*   **Por qué se hace:** Predice cómo reaccionará el empleado bajo estrés interpersonal.
*   **Opciones de Respuesta:**
    *   (Tipo 1) "Evitarlo si es posible o buscar una solución justa"
    *   (Tipo 2) "Intentar mediar y ayudar a ambas partes"
    *   (Tipo 3) "Buscar una resolución rápida para seguir adelante"
    *   (Tipo 4) "Reflexionar sobre las emociones involucradas"
    *   (Tipo 5) "Observar y analizar antes de involucrarme"
    *   (Tipo 6) "Buscar apoyo o consejo de alguien de confianza"
    *   (Tipo 7) "Buscar el lado positivo y distraerme con otra cosa"
    *   (Tipo 8) "Confrontarlo directamente sin rodeos"
    *   (Tipo 9) "Evitar el conflicto y mantener la paz"

### Pregunta 5: Valores Centrales
**"¿Qué valoras más en un ambiente de trabajo?"**
*   **Por qué se hace:** Para determinar el ajuste cultural (culture fit).
*   **Opciones de Respuesta:**
    *   (Tipo 1) "Orden, claridad y procedimientos bien definidos"
    *   (Tipo 2) "Relaciones cálidas y oportunidad de ayudar"
    *   (Tipo 3) "Oportunidades de crecimiento y reconocimiento"
    *   (Tipo 4) "Libertad creativa y autenticidad"
    *   (Tipo 5) "Espacio personal y tiempo para pensar"
    *   (Tipo 6) "Estructura clara y un equipo de confianza"
    *   (Tipo 7) "Variedad, innovación y ambiente dinámico"
    *   (Tipo 8) "Autonomía y respeto por mi autoridad"
    *   (Tipo 9) "Armonía, tranquilidad y cooperación"

---

## 2. Algoritmo de Cálculo (Cómo se saca el Eneotipo)

El sistema utiliza un algoritmo de decisión determinista basado en **frecuencia acumulada**:

1.  **Conteo de Puntos:**
    *   Se inicializan contadores para los 9 tipos en 0.
    *   Por cada respuesta seleccionada por el usuario, se suma **1 punto** al eneatipo correspondiente a esa opción.
    *   Al final de las 5 preguntas, se tiene un perfil de puntuación (ej. Tipo 3: 2 puntos, Tipo 8: 3 puntos, resto: 0).

2.  **Determinación del Tipo Principal:**
    *   El sistema busca el tipo con el **puntaje más alto**.
    *   Ese tipo se designa como el `PrimaryType` (Eneotipo Principal).

3.  **Resolución de Empates (Tie-breaking Rule):**
    *   Si hay dos o más tipos con el mismo puntaje máximo, el sistema favorece al **número de eneatipo menor** (debido a que el recorrido es secuencial del 1 al 9 y solo actualiza si es estrictamente mayor).

4.  **Resultado:**
    *   El resultado final se guarda en el perfil del usuario.
