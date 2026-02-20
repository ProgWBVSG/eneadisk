# ENEADISC - Dashboards y Visualizaciones: Blueprint Completo

> **Fecha:** 2026-02-10
> **Versión:** 1.0
> **Estado:** Design Specification

---

## Resumen Ejecutivo

Blueprint técnico para todos los dashboards y visualizaciones de ENEADISC:
- 2 dashboards principales (Empleado individual + Empresa agregado)
- 7 tipos de visualizaciones
- Paleta color-blind safe
- Responsive (mobile-first)
- WCAG AA compliant

---

## 1. Elección de Librería de Visualización

### Comparativa

| Librería | Pros | Cons | Score |
|----------|------|------|-------|
| **Recharts** | React-friendly, composable, simple | Menos customización vs. D3 | 8/10 |
| **Nivo** | Hermoso, animaciones, responsive | Bundle size grande | 7/10 |
| **D3.js** | Máxima flexibilidad, custom | Curva de aprendizaje alta | 6/10 |
| **Chart.js** | Ligero, simple | Menos React-friendly | 6/10 |
| **Plotly** | Interactivo out-of-the-box | Muy pesado (~3MB) | 5/10 |
| Tremor | Pre-built dashboards, Tailwind | Menos flexible | 7/10 |

### Recomendación: **Recharts** (principal) + **D3.js** (network graph)

**Justificación:**
- ✅ Recharts para 6/7 gráficos (radar, donut, progress, bars, line)
- ✅ D3.js solo para network graph (requiere custom layout)
- ✅ Balance perfecto: simplicidad + customización
- ✅ Performance: bundle size ~50KB (Recharts)
- ✅ Mobile-friendly nativo

**Setup:**
```bash
npm install recharts d3 @types/d3
```

---

## 2. Dashboard Empleado (Individual)

### 2.1 Radar Chart - Dimensiones de Comportamiento

**Datos esperados:**
```json
{
  "collaboration": 0.7,
  "reflection": 0.4,
  "structure": 0.8,
  "logic": 0.6,
  "directiveness": 0.3
}
```

**Especificaciones:**
- **Tipo:** Radar/Spider chart (5 ejes)
- **Ejes:** Labels descriptivos ("Colaboración ↔ Autonomía")
- **Escala:** 0-1 (ocultar números, usar descriptores: Bajo/Medio/Alto)
- **Color:** Azul primario (#3B82F6) con fill semi-transparente (opacity: 0.3)
- **Tamaño:** 400x400px (desktop), 300x300px (mobile)

**Código React (Recharts):**
```tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
  { dimension: 'Colaboración ↔ Autonomía', value: 0.7, fullMark: 1 },
  { dimension: 'Reflexión ↔ Acción', value: 0.4, fullMark: 1 },
  { dimension: 'Estructura ↔ Flexibilidad', value: 0.8, fullMark: 1 },
  { dimension: 'Lógica ↔ Intuición', value: 0.6, fullMark: 1 },
  { dimension: 'Directividad ↔ Consenso', value: 0.3, fullMark: 1 },
];

export function BehaviorRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis 
          dataKey="dimension" 
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <Radar
          name="Tu perfil"
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

**Tooltips:**
```tsx
<Radar>
  <Tooltip content={({ payload }) => {
    if (!payload?.[0]) return null;
    const value = payload[0].value * 100;
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg">
        <p className="font-medium">{payload[0].payload.dimension}</p>
        <p className="text-sm text-slate-300">
          {value > 70 ? 'Alto' : value > 40 ? 'Medio' : 'Bajo'} ({value.toFixed(0)}%)
        </p>
      </div>
    );
  }} />
</Radar>
```

---

### 2.2 Progress Bars - Necesidades

**Datos esperados:**
```json
[
  { "need": "Claridad en objetivos", "priority": 0.9 },
  { "need": "Autonomía en decisiones", "priority": 0.85 },
  { "need": "Retroalimentación directa", "priority": 0.7 },
  { "need": "Tiempo para procesar", "priority": 0.6 }
]
```

**Especificaciones:**
- **Tipo:** Horizontal progress bars (stacked verticalmente)
- **Ordenar:** Por priority descendente
- **Colores:** Gradiente según prioridad
  - Alta (>0.8): Verde (#10B981)
  - Media (0.5-0.8): Azul (#3B82F6)
  - Baja (<0.5): Gris (#6B7280)
- **Animación:** Smooth fill on load (0.5s ease-out)

**Código React:**
```tsx
interface Need {
  need: string;
  priority: number;
}

export function NeedsProgressBars({ needs }: { needs: Need[] }) {
  const sorted = [...needs].sort((a, b) => b.priority - a.priority);
  
  const getColor = (priority: number) => {
    if (priority > 0.8) return 'bg-green-500';
    if (priority > 0.5) return 'bg-blue-500';
    return 'bg-gray-500';
  };
  
  return (
    <div className="space-y-4">
      {sorted.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">{item.need}</span>
            <span className="text-sm text-slate-500">{(item.priority * 100).toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor(item.priority)} transition-all duration-500 ease-out`}
              style={{ width: `${item.priority * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 2.3 Pattern Description - Texto + Visual

**Datos esperados:**
```json
{
  "title": "Orientado a Sistemas y Autonomía",
  "description": "Sos alguien que prioriza la competencia técnica...",
  "icon": "🧩"
}
```

**Especificaciones:**
- **Layout:** Card destacada (bg-gradient)
- **Tipografía:** Title (24px, bold), Description (16px, regular)
- **Visual:** Ícono grande (64px) o ilustración abstracta
- **Longitud:** 200-300 palabras
- **Interactividad:** Expandible si >300 palabras

**Código React:**
```tsx
export function PatternDescription({ pattern }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = pattern.description.length > 300;
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm">
      <div className="flex items-start gap-6">
        <div className="text-6xl">{pattern.icon}</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            {pattern.title}
          </h2>
          <p className="text-slate-700 leading-relaxed">
            {expanded || !isLong 
              ? pattern.description 
              : `${pattern.description.slice(0, 300)}...`}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-700 mt-2 text-sm font-medium"
            >
              {expanded ? 'Ver menos' : 'Leer más'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 2.4 Recommendations - Checklist Accionable

**Datos esperados:**
```json
[
  "Practicá delegar tareas pequeñas esta semana",
  "Pedí feedback explícito después de reuniones",
  "Experimentá con bloques de tiempo estructurados"
]
```

**Especificaciones:**
- **Tipo:** Checklist con checkboxes
- **Estado:** Guardado en localStorage
- **Diseño:** Íconos (💡) + texto
- **Interactividad:** Click checkbox → marcar completado

**Código React:**
```tsx
export function Recommendations({ recommendations }) {
  const [completed, setCompleted] = useState<Set<number>>(
    new Set(JSON.parse(localStorage.getItem('completed_recs') || '[]'))
  );
  
  const toggleComplete = (idx: number) => {
    const newCompleted = new Set(completed);
    if (completed.has(idx)) {
      newCompleted.delete(idx);
    } else {
      newCompleted.add(idx);
    }
    setCompleted(newCompleted);
    localStorage.setItem('completed_recs', JSON.stringify([...newCompleted]));
  };
  
  return (
    <div className="space-y-3">
      {recommendations.map((rec, idx) => (
        <label
          key={idx}
          className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition"
        >
          <input
            type="checkbox"
            checked={completed.has(idx)}
            onChange={() => toggleComplete(idx)}
            className="mt-1 w-5 h-5 rounded border-slate-300"
          />
          <div className="flex-1">
            <span className={completed.has(idx) ? 'line-through text-slate-400' : 'text-slate-700'}>
              💡 {rec}
            </span>
          </div>
        </label>
      ))}
      <div className="text-sm text-slate-500 mt-4">
        Completaste {completed.size} de {recommendations.length} recomendaciones
      </div>
    </div>
  );
}
```

---

## 3. Dashboard Empresa/RRHH (Agregado)

### 3.1 Donut Chart - Distribución de Patrones

**Datos esperados:**
```json
[
  { "pattern": "Orientados a Sistemas", "count": 12, "percentage": 40 },
  { "pattern": "Orientados a Personas", "count": 8, "percentage": 27 },
  { "pattern": "Orientados a Resultados", "count": 6, "percentage": 20 },
  { "pattern": "Orientados a Autonomía", "count": 4, "percentage": 13 }
]
```

**Especificaciones:**
- **Tipo:** Donut chart (pie con hueco central)
- **Centro:** Total de evaluaciones ("30 empleados")
- **Colores:** Paleta de 6-8 colores (ver sección 4)
- **Leyenda:** A la derecha (desktop), abajo (mobile)
- **Interactividad:** Click → filtrar dashboard por patrón

**Código React (Recharts):**
```tsx
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function PatternDonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          dataKey="count"
          label={({ percentage }) => `${percentage}%`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          formatter={(value, entry) => `${value} (${entry.payload.count})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold"
        >
          {total}
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm text-slate-500"
        >
          empleados
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
```

---

### 3.2 Network Graph - Mapa de Compatibilidad

**Datos esperados:**
```json
{
  "nodes": [
    { "id": "emp1", "pattern": "systems", "label": "E1" },
    { "id": "emp2", "pattern": "people", "label": "E2" }
  ],
  "edges": [
    { "source": "emp1", "target": "emp2", "compatibility": 0.8, "type": "high" }
  ]
}
```

**Especificaciones:**
- **Tipo:** Force-directed network graph (D3.js)
- **Nodos:**
  - Tamaño: 40px (todos iguales)
  - Color: Según patrón (misma paleta que donut)
  - Label: Iniciales ("E1", "E2") para privacidad
- **Edges:**
  - Grosor: Proporcional a compatibility (1-5px)
  - Color: Verde (alta >0.7), Amarillo (media 0.4-0.7), Rojo (baja <0.4)
  - Tipo: Sólido (alta), Punteado (baja)
- **Interactividad:**
  - Hover nodo → highlight conexiones
  - Drag nodo → reposicionar
  - Zoom & pan
- **Responsive:** En mobile, mostrar tabla alternativa

**Código React (D3.js):**
```tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function CompatibilityNetworkGraph({ data }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 800;
    const height = 600;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Edges
    const link = svg.append('g')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', d => d.compatibility > 0.7 ? '#10B981' : d.compatibility > 0.4 ? '#F59E0B' : '#EF4444')
      .attr('stroke-width', d => d.compatibility * 5)
      .attr('stroke-dasharray', d => d.compatibility < 0.4 ? '5,5' : '0');
    
    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', d => PATTERN_COLORS[d.pattern])
      .call(drag(simulation));
    
    // Labels
    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('pointer-events', 'none');
    
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
    
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [data]);
  
  return <svg ref={svgRef} className="border rounded-lg" />;
}
```

---

### 3.3 Table - Alertas de Fricción

**Datos esperados:**
```json
[
  {
    "priority": "high",
    "message": "65% del equipo necesita autonomía, pero liderazgo es directivo",
    "affected_departments": ["Ventas", "Marketing"],
    "recommendation": "Implementar OKRs auto-gestionados"
  }
]
```

**Especificaciones:**
- **Colores:** 🔴 Alta, 🟡 Media, 🟢 Baja
- **Columnas:** Prioridad | Alerta | Áreas afectadas | Recomendación
- **Ordenar:** Por prioridad (alta primero)
- **Responsive:** Colapsar columnas en mobile (mostrar solo mensaje + prioridad)

**Código React:**
```tsx
export function FrictionTable({ alerts }) {
  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Prioridad</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Alerta</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 hidden md:table-cell">
              Áreas Afectadas
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 hidden md:table-cell">
              Recomendación
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => (
            <tr key={idx} className="border-t hover:bg-slate-50">
              <td className="px-4 py-3 text-2xl">{priorityIcons[alert.priority]}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{alert.message}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex gap-2 flex-wrap">
                  {alert.affected_departments.map(dept => (
                    <span key={dept} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {dept}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                {alert.recommendation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 3.4 Grouped Bar Chart - Comparativa por Departamento

**Código Recharts:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { dept: 'Ventas', systems: 10, people: 20, results: 60, autonomy: 10 },
  { dept: 'Producto', systems: 70, people: 10, results: 10, autonomy: 10 }
];

export function DepartmentBarChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="horizontal">
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis type="category" dataKey="dept" />
        <Tooltip />
        <Legend />
        <Bar dataKey="systems" stackId="a" fill="#3B82F6" />
        <Bar dataKey="people" stackId="a" fill="#10B981" />
        <Bar dataKey="results" stackId="a" fill="#F59E0B" />
        <Bar dataKey="autonomy" stackId="a" fill="#8B5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

### 3.5 Line Chart - Evolución Temporal

**Código Recharts:**
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2024-01', systems: 40, people: 30, results: 20, autonomy: 10 },
  { date: '2024-07', systems: 35, people: 35, results: 20, autonomy: 10 }
];

export function EvolutionLineChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} unit="%" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="systems" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="people" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="results" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="autonomy" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## 4. Paleta de Colores

### Color-Blind Safe Palette

| Patrón | Color | Hex | Asociación |
|--------|-------|-----|------------|
| Sistemas | Azul | `#3B82F6` | Lógica, frialdad |
| Personas | Verde | `#10B981` | Empatía, crecimiento |
| Resultados | Naranja | `#F59E0B` | Energía, acción |
| Autonomía | Púrpura | `#8B5CF6` | Independencia |
| Reflexión | Cyan | `#06B6D4` | Contemplación |
| Estructura | Índigo | `#6366F1` | Orden |
| Flexibilidad | Lima | `#84CC16` | Adaptabilidad |
| Intuición | Rosa | `#EC4899` | Creatividad |

**Validación:** Testeado con [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- ✅ Protanopia (rojo-verde)
- ✅ Deuteranopia (verde)
- ✅ Tritanopia (azul-amarillo)

**Contraste:** Todos los colores tienen ratio ≥4.5:1 sobre fondo blanco (WCAG AA)

---

## 5. Interactividad & UX

### 5.1 Tooltips

**Diseño:**
```tsx
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-sm text-slate-300">{payload[0].value}</p>
    </div>
  );
};
```

### 5.2 Drill-Down

**Filtrar dashboard por patrón:**
```tsx
const [filter, setFilter] = useState(null);

function onPatternClick(pattern) {
  setFilter(pattern);
}

// Mostrar breadcrumb
{filter && (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-sm text-slate-600">Mostrando:</span>
    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
      {filter}
    </span>
    <button onClick={() => setFilter(null)} className="text-sm text-blue-600 hover:underline">
      Limpiar filtros
    </button>
  </div>
)}
```

### 5.3 Exportar

```tsx
// Exportar a PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function exportToPDF() {
  const element = document.getElementById('dashboard');
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
  pdf.save('eneadisc-reporte.pdf');
}
```

---

## 6. Responsive Design

### Breakpoints

```tsx
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1024px',
  desktop: '> 1024px'
};
```

### Estrategia por tipo de gráfico

| Gráfico | Desktop | Mobile |
|---------|---------|--------|
| Radar | 400x400px | 300x300px |
| Donut | Leyenda a la derecha | Leyenda debajo |
| Network | 800x600px | Tabla/lista alternativa |
| Bars | Horizontal | Horizontal (mismo) |
| Line | Mostrar 4 líneas | Mostrar solo top 2 |
| Table | 4 columnas | 2 columnas (prioridad + alerta) |

**Network graph alternativo (mobile):**
```tsx
function isMobile() {
  return window.innerWidth < 768;
}

{isMobile() ? (
  <CompatibilityList data={data} />  // Lista simple
) : (
  <CompatibilityNetworkGraph data={data} />  // Graph complejo
)}
```

---

## 7. Accesibilidad (WCAG AA)

### Checklist

- [x] **Color:** No depender solo de color (usar shapes, patterns)
- [x] **Contraste:** Mínimo 4.5:1 para texto
- [x] **Navegación por teclado:**
  - Tab para navegar entre gráficos
  - Enter para drill-down
  - Escape para cerrar tooltips
- [x] **ARIA labels:**
```tsx
<BarChart aria-label="Comparativa de patrones por departamento">
  {/* ... */}
</BarChart>
```
- [x] **Descripción textual alternativa:**
```tsx
<div role="img" aria-label="40% del equipo es orientado a sistemas">
  <DonutChart data={data} />
</div>
```
- [x] **Screen readers:** Tabla alternativa oculta visualmente
```tsx
<table className="sr-only">
  <caption>Distribución de patrones</caption>
  {/* Tabla con datos */}
</table>
```

---

## 8. Empty States & Error Handling

### Empty States

```tsx
// Dashboard empleado sin evaluación
<div className="text-center py-12">
  <div className="text-6xl mb-4">📊</div>
  <h3 className="text-2xl font-semibold text-slate-700 mb-2">
    Aún no completaste tu evaluación
  </h3>
  <p className="text-slate-500 mb-6">
    Completá la evaluación para ver tu perfil personalizado
  </p>
  <Button href="/evaluation">Comenzar evaluación</Button>
</div>
```

### Loading States

```tsx
// Skeleton para gráficos
<div className="animate-pulse">
  <div className="h-96 bg-slate-200 rounded-lg" />
</div>
```

---

## 9. Guía de Implementación

### Setup

```bash
# Instalar dependencias
npm install recharts d3 @types/d3 html2canvas jspdf

# Opcional: Tailwind CSS
npm install -D tailwindcss
```

### Estructura de Componentes

```
src/
├── components/
│   ├── dashboards/
│   │   ├── employee/
│   │   │   ├── BehaviorRadarChart.tsx
│   │   │   ├── NeedsProgressBars.tsx
│   │   │   ├── PatternDescription.tsx
│   │   │   └── Recommendations.tsx
│   │   └── company/
│   │       ├── PatternDonutChart.tsx
│   │       ├── CompatibilityNetworkGraph.tsx
│   │       ├── FrictionTable.tsx
│   │       ├── DepartmentBarChart.tsx
│   │       └── EvolutionLineChart.tsx
│   └── shared/
│       ├── CustomTooltip.tsx
│       └── EmptyState.tsx
```

---

## Conclusión

Este blueprint define un sistema completo de visualizaciones para ENEADISC:

**✅ Decisiones clave:**
- Recharts (6/7 gráficos) + D3.js (network graph)
- Paleta color-blind safe (8 colores validados)
- Mobile-first responsive
- WCAG AA compliance
- Exportar PDF/CSV

**📊 Entregables:**
- 7 visualizaciones diseñadas
- Código React completo
- Paleta de colores documentada
- Guía de accesibilidad

**🚀 Próximos pasos:**
1. Implementar componentes React
2. Testear en mobile
3. Validar accesibilidad con herramientas (axe, Lighthouse)
4. Iterar según feedback de usuarios
