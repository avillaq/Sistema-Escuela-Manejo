import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Chip,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import { matriculasService, reservasService } from '@/service/apiService';
import { useNavigate } from 'react-router';
import {
  LoadingSpinner,
  PageHeader,
  StatCard,
  ActivityCard,
  ActivityItem,
  EmptyState,
  MatriculaCard,
  FinancialCard,
  InfoCard
} from '@/components';

export const AlumnoDashboard = () => {
  const navigate = useNavigate();
  const { id, user } = useAuthStore();
  const [matriculaActiva, setMatriculaActiva] = useState(null);
  const [proximasClases, setProximasClases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del alumno
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [matriculaResult, reservasResult] = await Promise.all([
          matriculasService.getByAlumno(id),
          reservasService.getByAlumno(id)
        ]);

        if (matriculaResult.success) {
          setMatriculaActiva(matriculaResult.data);
        } else if (matriculaResult.error !== "No se encontró matrícula activa") {
          addToast({
            title: "Error al cargar matrícula",
            description: matriculaResult.error || "No se pudo cargar tu información de matrícula.",
            severity: "danger",
            color: "danger",
          });
        }

        if (reservasResult.success) {
          // Filtrar y ordenar próximas clases (futuras)
          const ahora = new Date();
          const reservasFuturas = reservasResult.data
            .filter(reserva => {
              const fechaClase = new Date(`${reserva.bloque.fecha}T${reserva.bloque.hora_inicio}`);
              return fechaClase > ahora && !reserva.asistencia;
            })
            .sort((a, b) => {
              const fechaA = new Date(`${a.bloque.fecha}T${a.bloque.hora_inicio}`);
              const fechaB = new Date(`${b.bloque.fecha}T${b.bloque.hora_inicio}`);
              return fechaA - fechaB;
            })
            .slice(0, 3); // Solo las próximas 3

          setProximasClases(reservasFuturas);
        } else {
          addToast({
            title: "Error al cargar reservas",
            description: reservasResult.error || "No se pudieron cargar tus reservas.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar tus datos.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    if (!matriculaActiva) return null;

    const horas_total = matriculaActiva.tipo_contratacion === 'paquete'
      ? matriculaActiva.paquete?.horas_total
      : matriculaActiva.horas_contratadas;

    const progreso = horas_total ? Math.round((matriculaActiva.horas_completadas / horas_total) * 100) : 0;
    const progresoPago = matriculaActiva.costo_total ? Math.round((matriculaActiva.pagos_realizados / matriculaActiva.costo_total) * 100) : 0;
    const horas_restantes = horas_total - matriculaActiva.horas_completadas;
    const horas_disponibles = matriculaActiva.horas_disponibles_reserva || 0;

    return {
      horas_total,
      horas_completadas: matriculaActiva.horas_completadas,
      horas_restantes,
      horas_disponibles,
      progreso,
      progresoPago,
      reservas_pendientes: matriculaActiva.reservas_pendientes || 0
    };
  }, [matriculaActiva]);

  // Formatear fecha para mostrar
  const formatearFechaClase = (fecha, hora) => {
    const fechaCompleta = new Date(`${fecha}T${hora}`);
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    if (fechaCompleta.toDateString() === hoy.toDateString()) {
      return `Hoy ${fechaCompleta.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (fechaCompleta.toDateString() === mañana.toDateString()) {
      return `Mañana ${fechaCompleta.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return fechaCompleta.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Estados de la matrícula
  const getEstadoClasesColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_progreso': return 'primary';
      case 'completado': return 'success';
      case 'vencido': return 'danger';
      default: return 'default';
    }
  };

  const getEstadoPagoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'danger';
      case 'completo': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando tu información..." />;
  }

  // Si no hay matrícula activa
  if (!matriculaActiva) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="¡Bienvenido!"
          subtitle="Tu panel de control personal."
        />

        <Card className="border-warning-200 bg-warning-50">
          <CardBody>
            <EmptyState
              icon="lucide:graduation-cap"
              title="No tienes una matrícula activa"
              description="Contacta con la administración para registrar tu matrícula y comenzar tus clases de manejo."
              size="large"
            />
            <div className="flex items-center justify-center gap-2 text-sm text-warning-600 mt-4">
              <Icon icon="lucide:phone" width={16} height={16} />
              <span>Contacta al administrador para más información</span>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <PageHeader
        title="¡Bienvenido,"
        userName={matriculaActiva.alumno.nombre}
        subtitle="Aquí tienes el resumen de tu progreso y próximas clases."
      />

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="lucide:book-open"
          title="Clases Completadas"
          value={estadisticas.horas_completadas}
          subtitle={`de ${estadisticas.horas_total}`}
          color="primary"
          size="large"
        />

        <StatCard
          icon="lucide:clock"
          title="Clases Disponibles"
          value={estadisticas.horas_disponibles}
          subtitle="para reservar"
          color="success"
          size="large"
        />

        <StatCard
          icon="lucide:calendar-check"
          title="Reservas Pendientes"
          value={estadisticas.reservas_pendientes}
          subtitle="programadas"
          color="warning"
          size="large"
        />

        <StatCard
          icon="lucide:target"
          title="Progreso Total"
          value={`${estadisticas.progreso}%`}
          subtitle="completado"
          color="purple"
          size="large"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la matrícula */}
        <div className="lg:col-span-2 space-y-6">
          <MatriculaCard
            matricula={matriculaActiva}
            estadisticas={estadisticas}
            getEstadoClasesColor={getEstadoClasesColor}
            getEstadoPagoColor={getEstadoPagoColor}
          />

          {/* Próximas clases */}
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
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <InfoCard
            title="Mi Información"
            subtitle="Información del estudiante"
            avatarName={`${user.nombre} ${user.apellidos}`}
            fields={[
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
            ]}
            chips={[{
              label: user.activo ? "Activo" : "Inactivo",
              color: user.activo ? "success" : "danger",
              size: "sm"
            }]}
          />

          {/* Resumen financiero */}
          <FinancialCard
            matricula={matriculaActiva}
            estadisticas={estadisticas}
          />
        </div>
      </div>
    </div>
  );
};