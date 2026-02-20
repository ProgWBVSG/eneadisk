# Directiva: Sesión de Prueba - SOP

## Objetivo
Implementar una funcionalidad de "Sesión de prueba" en la página de inicio que permita a los usuarios probar tanto el rol de dueño como de empleado sin necesidad de registrarse. El empleado de prueba debe estar preintegrado al equipo que crea el dueño de prueba.

## Contexto
- **Problema**: Actualmente hay que ingresar emails y datos cada vez que se quiere probar la aplicación
- **Solución**: Agregar usuarios predefinidos (dueño y empleado) que ya tienen datos de prueba precargados
- **Conexión crítica**: El empleado de prueba debe aparecer automáticamente en el equipo del dueño de prueba

## Entradas
- Usuario hace clic en "Sesión de prueba" desde la landing page
- Usuario selecciona el rol (Dueño o Empleado)

## Salidas
- Usuario autenticado con datos de prueba
- Redirección al dashboard correspondiente
- Datos de ejemplo visibles (equipo, tareas, check-ins, etc.)
- El empleado de prueba debe estar en el equipo del dueño de prueba

## Lógica de Implementación

### 1. Datos de Prueba (utils/demoData.ts)
Crear usuarios predefinidos:
- **Dueño de prueba**:
  - id: "demo-owner-001"
  - role: "company_admin"
  - companyId: "demo-company-001"
  - name: "María González (Demo)"
  - email: "demo-owner@eneadisc.com"
  
- **Empleado de prueba**:
  - id: "demo-employee-001"
  - role: "employee"
  - companyId: "demo-company-001" (MISMO que el dueño)
  - name: "Juan Pérez (Demo)"
  - email: "demo-employee@eneadisc.com"
  - teamId: "demo-team-marketing"

### 2. Estructura de Datos de Prueba
- **Empresa**: demo-company-001 (nombre: "Empresa Demo Marketing")
- **Equipo**: demo-team-marketing (nombre: "Equipo Marketing", owner: demo-owner-001)
- **Miembros del equipo**: [demo-employee-001]
- **Check-ins**: 5-7 check-ins de ejemplo para el empleado
- **Tareas**: 3-5 tareas de ejemplo con diferentes estados
- **Colaboración**: 2-3 interacciones de equipo

### 3. UI en LandingSplit.tsx
Agregar un tercer botón DEBAJO de los botones existentes:
- Texto: "Sesión de prueba"
- Variante: outline con estilo diferenciado
- Al hacer clic: Mostrar modal/selector de rol

### 4. Modal de Selector de Rol
Componente nuevo: `DemoLoginModal.tsx`
- Dos opciones visuales: "Probar como Dueño" y "Probar como Empleado"
- Al seleccionar: llamar a función de login con usuario correspondiente
- Cerrar modal y redirigir

### 5. Función de Login de Prueba
En `AuthContext.tsx` o nuevo utils/demoAuth.ts:
```
loginAsDemo(role: 'owner' | 'employee')
  - Cargar usuario predefinido según rol
  - Llamar a login() existente
  - Redirigir a dashboard correspondiente
```

### 6. Persistencia de Datos de Prueba
- Los datos de prueba deben ser de solo lectura O permitir modificaciones que NO persistan
- Al hacer logout, limpiar cualquier modificación temporal
- Al volver a hacer login de prueba, restaurar datos originales

## Restricciones y Casos Borde

### Restricción 1: IDs Consistentes
CRÍTICO: El `companyId` del empleado DEBE ser igual al `companyId` del dueño para que estén conectados.

### Restricción 2: No Persistencia Real
Los datos de prueba NO deben guardarse en localStorage permanentemente. Solo deben persistir durante la sesión.

### Restricción 3: Indicador Visual
Los usuarios de prueba deben tener algún indicador visual (ej: "(Demo)" en el nombre) para que sea claro que es una sesión de prueba.

### Restricción 4: Logout Limpio
Al hacer logout de una sesión de prueba, asegurar que se limpien TODOS los datos temporales.

### Caso Borde 1: Múltiples Equipos
Por ahora, el dueño de prueba solo tiene UN equipo. Más adelante se pueden agregar más equipos de ejemplo.

### Caso Borde 2: Datos Incompletos
Si algún dato de prueba falta, mostrar estados vacíos elegantes en lugar de errores.

## Verificación
1. **Prueba Manual - Dueño**:
   - Hacer clic en "Sesión de prueba" → Seleccionar "Dueño"
   - Verificar redirección a `/dashboard/company`
   - Verificar que aparece el equipo "Equipo Marketing"
   - Verificar que el empleado "Juan Pérez (Demo)" aparece en el equipo

2. **Prueba Manual - Empleado**:
   - Hacer clic en "Sesión de prueba" → Seleccionar "Empleado"
   - Verificar redirección a `/dashboard/employee`
   - Verificar que aparecen check-ins de ejemplo
   - Verificar que aparece el equipo "Equipo Marketing"
   - Verificar que puede ver al dueño "María González (Demo)"

3. **Prueba de Conexión**:
   - Login como dueño → Ver equipo → Confirmar que Juan está en la lista
   - Logout → Login como empleado → Ver equipo → Confirmar que María es el líder

4. **Prueba de Logout**:
   - Login de prueba → Realizar algún cambio → Logout → Login de prueba nuevamente
   - Verificar que NO persisten los cambios

## Dependencias
- AuthContext.tsx (función login existente)
- LandingSplit.tsx (agregar botón)
- Estructura de datos de equipos y empresas

## Notas Importantes
- Esta funcionalidad es SOLO para ambiente de desarrollo/demostración
- NO implementar en producción sin autenticación real
- Los datos de prueba deben ser realistas pero obviamente ficticios
