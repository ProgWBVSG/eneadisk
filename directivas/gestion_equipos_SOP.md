# Directiva: Gestión de Equipos - SOP

## Objetivo
Implementar una sección completa de gestión de equipos en el dashboard del dueño/empresa que permita crear, editar, eliminar equipos y gestionar sus miembros, visualizando las características del eneagrama de cada uno.

## Contexto
- **Problema**: Actualmente el dashboard de empresa tiene placeholders para gestión de equipos
- **Solución**: Crear una interfaz completa para administrar equipos y ver las características de eneagrama de cada miembro
- **Valor**: Permite a los dueños organizar sus empleados, ver distribución de eneatipos y optimizar la colaboración

## Entradas
- Dueño crea un equipo con nombre y descripción
- Dueño agrega empleados al equipo
- Dueño ve características de cada miembro

## Salidas
- Lista visual de todos los equipos
- Vista detallada de cada equipo con sus miembros
- Distribución de eneatipos en el equipo
- Métricas de colaboración y compatibilidad

## Estructura de Datos

### Team
```typescript
interface Team {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt?: string;
}
```

### Employee (para referencia)
```typescript
interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  teamId?: string;
  enneagramType?: number; // 1-9
  role: 'employee';
}
```

## Lógica de Implementación

### 1. Utilidades de Datos (utils/teams.ts)

**Funciones básicas:**
- `getTeams(companyId: string): Team[]` - Obtener todos los equipos de la empresa
- `getTeam(teamId: string): Team | null` - Obtener un equipo específico
- `createTeam(team: Omit<Team, 'id' | 'createdAt'>): Team` - Crear nuevo equipo
- `updateTeam(teamId: string, updates: Partial<Team>): void` - Actualizar equipo
- `deleteTeam(teamId: string): void` - Eliminar equipo

**Funciones de miembros:**
- `addMemberToTeam(teamId: string, userId: string): void` - Agregar miembro
- `removeMemberFromTeam(teamId: string, userId: string): void` - Remover miembro
- `getTeamMembers(teamId: string): Employee[]` - Obtener miembros del equipo
- `getAvailableEmployees(companyId: string): Employee[]` - Empleados sin equipo

**Funciones de análisis:**
- `getTeamEnneagramDistribution(teamId: string): object` - Distribución de eneatipos
- `getTeamStats(teamId: string): object` - Estadísticas del equipo

### 2. Componente Principal - TeamManagement

**Secciones:**
1. **Header** con título y botón "Crear Equipo"
2. **Grid de tarjetas** de equipos con:
   - Nombre del equipo
   - Cantidad de miembros
   - Preview de eneatipos
   - Botones de acción (editar, eliminar, ver detalle)
3. **Estado vacío** cuando no hay equipos

### 3. Modal de Crear/Editar Equipo

**Campos:**
- Nombre del equipo (required)
- Descripción (optional)
- Botones: Guardar, Cancelar

**Validaciones:**
- Nombre no vacío
- Nombre único por empresa

### 4. Vista Detallada de Equipo

**Secciones:**
1. **Header** con nombre, descripción y botones de acción
2. **Lista de miembros** con:
   - Avatar/iniciales
   - Nombre
   - Email
   - Tipo de eneagrama (número y nombre)
   - Botón para remover
3. **Sección de agregar miembros**:
   - Dropdown con empleados disponibles
   - Botón "Agregar al equipo"
4. **Panel de análisis** con:
   - Gráfico de distribución de eneatipos
   - Score de compatibilidad
   - Recomendaciones

## Restricciones y Casos Borde

### Restricción 1: Un empleado, un equipo
Un empleado solo puede estar en UN equipo a la vez. Al agregarlo a un nuevo equipo, debe removerse del anterior.

### Restricción 2: No eliminar equipo con miembros
Mostrar confirmación si se intenta eliminar un equipo con miembros. Ofrecer:
- Opción A: Mover miembros a otro equipo
- Opción B: Remover miembros del equipo primero

### Restricción 3: Dueño no puede ser miembro
El dueño lidera todos los equipos pero no aparece como "miembro" de ninguno.

### Caso Borde 1: Empleados sin eneagrama
Si un empleado no completó el cuestionario, mostrar "Pendiente" en lugar del tipo.

### Caso Borde 2: Equipo vacío
Permitir equipos sin miembros (equipos en formación).

### Caso Borde 3: LocalStorage
Los datos se guardan en localStorage. Usar clave: `teams_${companyId}`.

## Diseño UI/UX

### Paleta de Colores
- **Primario**: Azul (#3b82f6) para acciones principales
- **Secundario**: Verde (#10b981) para estados positivos
- **Alerta**: Rojo (#ef4444) para eliminaciones
- **Neutral**: Gris slate para texto y bordes

### Componentes Visuales
1. **Tarjetas de equipo**: Fondo blanco, border, hover effect
2. **Badges de eneagrama**: Círculos de colores según tipo
3. **Iconos**: lucide-react (Users, Plus, Trash2, Edit, etc)
4. **Modals**: Overlay oscuro, contenedor centrado

### Responsive
- Desktop: Grid de 3 columnas
- Tablet: Grid de 2 columnas
- Mobile: 1 columna, stack vertical

## Verificación

1. **Crear equipo**:
   - Hacer clic en "Crear Equipo"
   - Llenar formulario
   - Guardar y verificar que aparece en la lista

2. **Agregar miembros**:
   - Abrir equipo
   - Seleccionar empleado disponible
   - Agregar y verificar que aparece en la lista

3. **Ver características**:
   - Verificar que se muestra el tipo de eneagrama
   - Verificar distribución en el panel de análisis

4. **Remover miembro**:
   - Click en botón de remover
   - Confirmar y verificar que desaparece

5. **Eliminar equipo**:
   - Crear equipo vacío
   - Eliminarlo y verificar que desaparece
   - Intentar eliminar equipo con miembros y verificar warning

## Notas Importantes
- Usar componentes de UI existentes (`Button`, modals)
- Mantener consistencia con el diseño del resto de la app
- Los datos de demo deben incluir al menos 1 equipo con miembros
- Implementar loading states y error handling
