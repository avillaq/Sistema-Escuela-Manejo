# Componentes Dashboard Reutilizables

Esta documentación describe los componentes reutilizables creados para los dashboards del sistema de escuela de manejo.

## Componentes Creados

### 1. LoadingSpinner
**Ubicación**: `src/components/LoadingSpinner.jsx`

Spinner de carga uniforme para todos los dashboards.

```jsx
<LoadingSpinner message="Cargando dashboard..." />
```

**Props:**
- `message` (string, opcional): Mensaje a mostrar. Default: "Cargando..."

---

### 2. PageHeader
**Ubicación**: `src/components/PageHeader.jsx`

Header personalizable para dashboards con título, nombre de usuario y subtítulo.

```jsx
<PageHeader
  title="¡Bienvenido,"
  userName="Juan Pérez"
  subtitle="Aquí tienes el resumen de tu actividad."
  emoji="👋"
/>
```

**Props:**
- `title` (string): Título principal
- `subtitle` (string): Texto descriptivo
- `userName` (string, opcional): Nombre del usuario
- `emoji` (string, opcional): Emoji a mostrar. Default: "👋"

---

### 3. StatCard
**Ubicación**: `src/components/StatCard.jsx`

Tarjeta de estadísticas con icono, valor y colores personalizables.

```jsx
<StatCard
  icon="lucide:users"
  title="Alumnos Activos"
  value={25}
  subtitle="con matrícula vigente"
  color="primary"
  size="large"
/>
```

**Props:**
- `icon` (string): Icono de Lucide
- `title` (string): Título de la estadística
- `value` (string|number): Valor principal
- `subtitle` (string, opcional): Texto descriptivo
- `color` (string, opcional): Color del tema. Opciones: primary, success, warning, danger, purple, orange, green
- `size` (string, opcional): Tamaño. Opciones: default, large

---

### 4. EmptyState
**Ubicación**: `src/components/EmptyState.jsx`

Estado vacío reutilizable con icono, título y acción opcional.

```jsx
<EmptyState
  icon="lucide:calendar-x"
  title="No hay clases programadas"
  description="Reserva tus clases para continuar"
  actionLabel="Reservar Clase"
  onAction={() => navigate('/reservar')}
  size="large"
/>
```

**Props:**
- `icon` (string): Icono de Lucide
- `title` (string): Título del estado vacío
- `description` (string, opcional): Descripción adicional
- `actionLabel` (string, opcional): Texto del botón de acción
- `onAction` (function, opcional): Función a ejecutar al hacer clic
- `size` (string, opcional): Tamaño. Opciones: default, large

---

### 5. ActivityCard y ActivityItem
**Ubicación**: `src/components/ActivityCard.jsx`

Componentes para mostrar listas de actividad con header personalizable.

```jsx
<ActivityCard
  title="Próximas Clases"
  headerIcon="lucide:calendar-clock"
  actionLabel="Ver Todas"
  actionIcon="lucide:external-link"
  onAction={() => navigate('/clases')}
>
  <ActivityItem
    icon="lucide:calendar"
    title="Clase de Manejo"
    subtitle="Hoy 14:00 - 15:00"
    isHighlighted={true}
    color="primary"
    rightContent={<Chip color="primary">Próxima</Chip>}
  />
</ActivityCard>
```

**ActivityCard Props:**
- `title` (string): Título de la tarjeta
- `children` (ReactNode): Contenido de la tarjeta
- `actionLabel` (string, opcional): Texto del botón de acción
- `onAction` (function, opcional): Función del botón
- `actionIcon` (string, opcional): Icono del botón
- `headerIcon` (string, opcional): Icono del header

**ActivityItem Props:**
- `icon` (string, opcional): Icono del elemento
- `title` (string): Título principal
- `subtitle` (string, opcional): Subtítulo
- `rightContent` (ReactNode, opcional): Contenido del lado derecho
- `isHighlighted` (boolean, opcional): Si debe destacarse
- `color` (string, opcional): Color del tema cuando está destacado

---

### 6. InfoCard
**Ubicación**: `src/components/InfoCard.jsx`

Tarjeta de información personal con avatar y campos configurables.

```jsx
<InfoCard
  title="Mi Información"
  subtitle="Datos personales"
  avatarName="Juan Pérez"
  fields={[
    { label: "Nombre", value: "Juan Pérez" },
    { label: "DNI", value: "12345678", dividerBefore: true },
    { label: "Teléfono", value: "987654321" }
  ]}
  chips={[
    { label: "Activo", color: "success", size: "sm" }
  ]}
/>
```

**Props:**
- `title` (string): Título de la tarjeta
- `subtitle` (string): Subtítulo
- `avatarName` (string): Nombre para el avatar
- `fields` (array): Array de objetos con label, value, className, dividerBefore, dividerAfter
- `chips` (array): Array de chips con label, color, size, variant

---

### 7. SectionHeader
**Ubicación**: `src/components/SectionHeader.jsx`

Encabezado de sección con icono opcional.

```jsx
<SectionHeader
  icon="lucide:trending-up"
  title="Indicadores Principales"
/>
```

**Props:**
- `icon` (string, opcional): Icono de Lucide
- `title` (string): Título de la sección
- `className` (string, opcional): Clases CSS adicionales

---

### 8. QuickActions
**Ubicación**: `src/components/QuickActions.jsx`

Grid de botones de acciones rápidas.

```jsx
<QuickActions
  title="Acciones Rápidas"
  actions={[
    {
      icon: "lucide:users",
      label: "Alumnos",
      color: "primary",
      onPress: () => navigate('/alumnos')
    },
    {
      icon: "lucide:calendar",
      label: "Calendario",
      color: "secondary",
      onPress: () => navigate('/calendario')
    }
  ]}
/>
```

**Props:**
- `actions` (array): Array de objetos con icon, label, color, variant, onPress
- `title` (string, opcional): Título de la sección

---

### 9. MatriculaCard
**Ubicación**: `src/components/MatriculaCard.jsx`

Componente específico para mostrar información de matrícula de estudiantes.

```jsx
<MatriculaCard
  matricula={matriculaData}
  estadisticas={estadisticasData}
  getEstadoClasesColor={getEstadoClasesColor}
  getEstadoPagoColor={getEstadoPagoColor}
/>
```

---

### 10. FinancialCard
**Ubicación**: `src/components/FinancialCard.jsx`

Componente específico para mostrar estado financiero de estudiantes.

```jsx
<FinancialCard
  matricula={matriculaData}
  estadisticas={estadisticasData}
/>
```

## Uso

Para usar estos componentes, impórtalos desde el archivo de índice:

```jsx
import {
  LoadingSpinner,
  PageHeader,
  StatCard,
  EmptyState,
  ActivityCard,
  ActivityItem,
  InfoCard,
  SectionHeader,
  QuickActions,
  MatriculaCard,
  FinancialCard
} from '@/components';
```

## Beneficios

✅ **Consistencia visual** - Todos los dashboards usan los mismos estilos
✅ **Mantenibilidad** - Cambios en un componente se reflejan en todos los dashboards
✅ **Reutilización** - Menos código duplicado
✅ **Flexibilidad** - Componentes configurables con props
✅ **Escalabilidad** - Fácil agregar nuevos dashboards

## Dashboards Refactorizados

1. **AdminDashboard** - Completamente refactorizado
2. **AlumnoDashboard** - Completamente refactorizado  
3. **InstructorDashboard** - Completamente refactorizado

Cada dashboard ahora utiliza los componentes reutilizables reduciendo significativamente la duplicación de código y mejorando la mantenibilidad del sistema.
