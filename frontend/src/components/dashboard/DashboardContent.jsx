import { Chip } from '@heroui/react';
import { 
  ActivityCard, 
  ActivityItem, 
  EmptyState, 
  MatriculaCard, 
  FinancialCard, 
  InfoCard 
} from '@/components';

export const DashboardContent = ({ 
  user,
  matriculaActiva,
  estadisticas,
  proximasClases,
  formatearFechaClase,
  getEstadoClasesColor,
  getEstadoPagoColor,
  navigate
}) => {
  const userFields = [
    {
      label: "Nombre Completo",
      value: `${user.nombre} ${user.apellidos}`,
      dividerBefore: false
    },
    {
      label: "DNI",
      value: user.dni,
      dividerBefore: true
    },
    {
      label: "Teléfono",
      value: user.telefono
    },
    ...(user.email ? [{
      label: "Email",
      value: user.email,
      className: "text-sm"
    }] : [])
  ];

  const userChips = [{
    label: user.activo ? "Activo" : "Inactivo",
    color: user.activo ? "success" : "danger",
    size: "sm"
  }];

  const renderProximasClases = () => (
    <ActivityCard
      title="Próximas Clases"
      headerIcon="lucide:calendar-clock"
      actionLabel="Reservar"
      actionIcon="lucide:plus"
      onAction={() => navigate('/mi-calendario')}
    >
      {proximasClases.length > 0 ? (
        <div className="space-y-4">
          {proximasClases.map((reserva, index) => (
            <ActivityItem
              key={reserva.id}
              icon="lucide:calendar"
              title={formatearFechaClase(reserva.bloque.fecha, reserva.bloque.hora_inicio)}
              subtitle={`${reserva.bloque.hora_inicio} - ${reserva.bloque.hora_fin}`}
              isHighlighted={index === 0}
              color="primary"
              rightContent={index === 0 && (
                <Chip size="sm" color="primary" variant="flat">
                  Próxima
                </Chip>
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="lucide:calendar-x"
          title="No tienes clases programadas"
          description="Reserva tus clases para continuar con tu aprendizaje"
          size="large"
        />
      )}
    </ActivityCard>
  );

  return {
    InfoCard: (
      <InfoCard
        title="Mi Información"
        subtitle="Información del estudiante"
        avatarName={`${user.nombre} ${user.apellidos}`}
        fields={userFields}
        chips={userChips}
      />
    ),
    MatriculaCard: (
      <MatriculaCard
        matricula={matriculaActiva}
        estadisticas={estadisticas}
        getEstadoClasesColor={getEstadoClasesColor}
        getEstadoPagoColor={getEstadoPagoColor}
      />
    ),
    FinancialCard: (
      <FinancialCard
        matricula={matriculaActiva}
        estadisticas={estadisticas}
      />
    ),
    ProximasClases: renderProximasClases()
  };
};
