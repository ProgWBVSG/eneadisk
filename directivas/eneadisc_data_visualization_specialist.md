# DIRECTIVA: ENEADISC_DATA_VISUALIZATION_SPECIALIST_SOP

> **ID:** ENEADISC_VIZ_001
> **Script Asociado:** `scripts/eneadisc_data_visualization_specialist.py`
> **Última Actualización:** 2026-02-10
> **Estado:** ACTIVO

---

## 1. Objetivos y Alcance

### Contexto
Actuar como Senior Data Visualization Designer especializado en dashboards B2B SaaS, diseñando todas las visualizaciones de datos para ENEADISC.

### Objetivo Principal
Diseñar y documentar completamente los dashboards y visualizaciones de datos para:
1. **Dashboard Empleado (Individual):** Perfil personal, necesidades, recomendaciones
2. **Dashboard Empresa/RRHH (Agregado):** Analytics de equipo, compatibilidad, fricciones

### Criterio de Éxito
Documento técnico markdown completo que incluya:
- Elección de librería de visualización (justificada)
- Diseño detallado de cada gráfico (radar, donut, network, bars, line)
- Configuración visual (colores, ejes, labels, interactividad)
- Responsive strategy (mobile/tablet/desktop)
- Accesibilidad (WCAG AA, color-blind safe)
- Código de ejemplo (React + librería elegida)

## 2. Especificaciones de Entrada/Salida (I/O)

### Entradas (Inputs)
- **Prompt del usuario:** Especificaciones completas de dashboards
- **Tipo de dashboards:**
  - Dashboard Empleado: individual, mobile-friendly
  - Dashboard Empresa: agregado, analytics complejos
- **Tipos de visualizaciones requeridas:**
  - Radar chart (dimensiones de comportamiento)
  - Progress bars (necesidades)
  - Donut chart (distribución de patrones)
  - Network graph (mapa de compatibilidad)
  - Table (alertas de fricción)
  - Grouped bar chart (comparativa por departamento)
  - Line chart (evolución temporal)

### Salidas (Outputs)
- **Artefacto Generado:**
  - `eneadisc_data_visualization_complete.md` - Blueprint de visualizaciones
- **Formato:** Markdown estructurado con:
  - Tablas comparativas (librerías)
  - Paletas de colores (hex codes)
  - Ejemplos de código React
  - Esquemas JSON de datos
  - Diagramas de responsive breakpoints

## 3. Flujo Lógico (Algoritmo)

1. **Selección de Librería:**
   - Evaluar opciones (Recharts, Nivo, D3.js, Chart.js, Plotly, Tremor)
   - Comparar: facilidad de uso, customización, performance, mobile support
   - Recomendar librería principal + justificación

2. **Dashboard Empleado (Individual):**
   - Diseñar Radar Chart (5 dimensiones de comportamiento)
   - Diseñar Progress Bars (necesidades priorizadas)
   - Diseñar Pattern Description (texto + visual)
   - Diseñar Recommendations (checklist interactiva)
   - Especificar interactividad (tooltips, hover, click)

3. **Dashboard Empresa (Agregado):**
   - Diseñar Donut Chart (distribución de patrones)
   - Diseñar Network Graph (compatibilidad entre empleados)
   - Diseñar Table (alertas de fricción)
   - Diseñar Grouped Bar Chart (comparativa por departamento)
   - Diseñar Line Chart (evolución temporal)

4. **Paleta de Colores:**
   - Definir 6-8 colores hex para patrones
   - Validar accesibilidad (color-blind safe, contraste 4.5:1)
   - Asociación semántica (sistemas=azul, personas=naranja, etc.)

5. **Interactividad & UX:**
   - Tooltips (diseño, contenido, posición)
   - Drill-down (filtrar dashboard por patrón/departamento)
   - Exportar (PDF, CSV)
   - Animaciones (on load, on filter)

6. **Responsive Design:**
   - Definir breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px)
   - Adaptar cada gráfico por breakpoint
   - Simplificar network graph en mobile (→ lista)

7. **Accesibilidad:**
   - ARIA labels en SVG
   - Navegación por teclado
   - Descripción textual alternativa
   - Contraste mínimo 4.5:1

8. **Empty States & Errors:**
   - Diseñar estados vacíos (no hay datos)
   - Loading states (skeletons)
   - Mensajes de error (fallo al cargar)

9. **Documentación:**
   - Guía de implementación (setup, componentes React)
   - Ejemplos de código para 2-3 gráficos clave
   - Estructura de datos JSON para cada gráfico

## 4. Herramientas y Librerías

### Opciones de Visualización
- **Recharts:** Simple, React-friendly, composable
- **Nivo:** Hermoso, animaciones, responsive
- **D3.js:** Máxima flexibilidad, custom charts (complejidad alta)
- **Chart.js:** Simple, ligero, menos customizable
- **Plotly:** Interactivo, pesado
- **Tremor:** Pre-built para dashboards, Tailwind-based

### Stack Recomendado (a decidir en documentación)
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS o CSS modules
- **Build:** Vite
- **Icons:** Lucide React o Heroicons

## 5. Restricciones y Casos Borde (Edge Cases)

### Restricciones
- **Mobile-friendly:** Empleados pueden ver desde celular
- **Accesibilidad:** WCAG AA compliance
- **Performance:** Gráficos deben cargar en <2 segundos
- **Privacidad:** NO mostrar datos individuales en dashboard de empresa (solo agregados)

### Casos Borde
- **Empty States:**
  - Dashboard Empleado: usuario no completó evaluación
  - Dashboard Empresa: no hay evaluaciones del equipo
  - Line Chart: solo 1 evaluación (necesita ≥2 para evolución)
- **Datos Extremos:**
  - 1 solo patrón en equipo → donut chart con 1 segmento
  - Equipo muy grande (100+ personas) → network graph ilegible
- **Mobile:**
  - Network graph complejo → mostrar vista alternativa (tabla/lista)
  - Tooltips con tap (no hover)
- **Color-blind:**
  - Usuarios con daltonismo → paleta safe

## 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución/Parche Aplicado |
|-------|-----------------|------------|--------------------------|
| 10/02 | N/A - Directiva inicial | Setup | Establecer estructura base |

> **Nota de Implementación:** Tras implementar visualizaciones, documentar problemas de performance, accesibilidad o mobile rendering.

## 7. Ejemplos de Uso

### Ejecución del script de documentación
```bash
# Generar documento de visualizaciones completo
python scripts/eneadisc_data_visualization_specialist.py --output-dir ./docs --format markdown

# Generar ejemplos de código React
python scripts/eneadisc_data_visualization_specialist.py --generate-code --library recharts
```

### Output esperado
```
✅ Documento generado: docs/eneadisc_data_visualization_complete.md
📊 Gráficos diseñados: 7 tipos
🎨 Paleta de colores definida (8 colores, color-blind safe)
💻 Ejemplos de código: Radar, Donut, Network Graph
```

## 8. Checklist de Pre-Ejecución
- [ ] Prompt completo del usuario disponible
- [ ] Estructura de datos JSON de ejemplo comprendida
- [ ] Acceso a referencias de diseño (Dribbble, Behance)
- [ ] Herramientas de testing de accesibilidad (Coblis, WebAIM Contrast Checker)

## 9. Checklist Post-Ejecución
- [ ] Documento markdown generado con 8 secciones completas
- [ ] Librería de visualización elegida y justificada
- [ ] Diseño de 7 tipos de gráficos documentado
- [ ] Paleta de colores definida (hex codes + test de accesibilidad)
- [ ] Responsive strategy por breakpoint
- [ ] Accesibilidad checklist completa
- [ ] Ejemplos de código React incluidos
- [ ] Empty states y error handling diseñados

## 10. Notas Adicionales

### Filosofía de Diseño
- **Claridad > Complejidad:** Preferir gráficos simples y legibles
- **Mobile-first:** Diseñar primero para mobile, escalar a desktop
- **Accesibilidad by design:** No es "nice to have", es obligatorio
- **Interactividad estratégica:** Solo si añade valor (no por decoración)

### Referencias de Diseño
- **Dashboards B2B:** Mixpanel, Amplitude, Linear
- **Color Palettes:** Tailwind colors, Material Design
- **Accesibilidad:** WCAG 2.1 AA, WebAIM best practices
- **D3.js Gallery:** https://observablehq.com/@d3/gallery
- **Recharts Examples:** https://recharts.org/en-US/examples

### Consideraciones de UX
- **Tooltips:** Mostrar contexto, no solo valores numéricos
- **Loading states:** Skeleton screens, no spinners genéricos
- **Drill-down:** Breadcrumbs claros para volver atrás
- **Exportar:** PDF optimizado para impresión, CSV para análisis

### Privacidad
- **Dashboard Empresa:** NUNCA mostrar nombres de empleados en públicos
- **Anonimización:** Usar "Empleado 1", "E1" en network graph
- **Permiso de acceso:** Validar rol antes de mostrar analytics agregados
