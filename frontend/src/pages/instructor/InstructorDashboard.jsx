import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  addToast,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import { ticketsService } from '@/service/apiService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { InfoCard } from '@/components/dashboard/InfoCard';

export const InstructorDashboard = () => {
  const { id, user } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del instructor
  const cargarDatos = useCallback(async () => {
    try {
      const ticketsResult = await ticketsService.getByInstructor(id);

      if (ticketsResult.success) {
        setTickets(ticketsResult.data);
      } else {
        addToast({
          title: "Error al cargar tickets",
          description: ticketsResult.error || "No se pudieron cargar los tickets.",
          severity: "danger",
          color: "danger",
        });
      }

      if (!user) {
        addToast({
          title: "Error al cargar información",
          description: "No se pudo cargar la información del instructor.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al cargar los datos.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Formatear fecha para mostrar
  const formatearFecha = useCallback((fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioDeSemana = new Date(hoy);
    inicioDeSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes de esta semana
    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ticketsHoy = tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_asistencia);
      return fechaTicket >= inicioHoy;
    });

    const ticketsSemana = tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_asistencia);
      return fechaTicket >= inicioDeSemana;
    });

    const ticketsMes = tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_asistencia);
      return fechaTicket >= inicioDelMes;
    });

    // Últimos tickets para mostrar
    const ultimosTickets = [...tickets]
      .sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia))
      .slice(0, 5);

    return {
      total: tickets.length,
      hoy: ticketsHoy.length,
      semana: ticketsSemana.length,
      mes: ticketsMes.length,
      ultimosTickets
    };
  }, [tickets]);

  if (isLoading) {
    return <LoadingSpinner mensaje="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <PageHeader
        title="¡Bienvenido,"
        userName={user?.nombre || 'Instructor'}
        subtitle="Aquí tienes un resumen de tu actividad como instructor."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          <InfoCard
            title="Mi Información"
            subtitle="Datos personales del instructor"
            avatarName={user ? `${user.nombre} ${user.apellidos}` : 'I'}
            fields={user ? [
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
            ] : []}
            chips={user ? [{
              label: user.activo ? "Activo" : "Inactivo",
              color: user.activo ? "success" : "danger",
              size: "sm"
            }] : []}
          />

          {/* Estadísticas Rápidas */}
          <ActivityCard
            title="Resumen de Actividad"
            headerIcon="lucide:bar-chart-3"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-default-500">Total de Clases</p>
                  <p className="text-2xl font-bold text-primary-600">{estadisticas.total}</p>
                </div>
                <Icon icon="lucide:graduation-cap" className="text-primary-500" width={24} height={24} />
              </div>

              <Divider />

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-sm text-default-500">Hoy</p>
                  <p className="text-xl font-semibold text-success-600">{estadisticas.hoy}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Semana</p>
                  <p className="text-xl font-semibold text-warning-600">{estadisticas.semana}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Mes</p>
                  <p className="text-xl font-semibold text-primary-600">{estadisticas.mes}</p>
                </div>
              </div>
            </div>
          </ActivityCard>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <ActivityCard
            title="Actividad Reciente"
            headerIcon="lucide:clock"
          >
            {estadisticas.ultimosTickets.length > 0 ? (
              <div className="space-y-4">
                {estadisticas.ultimosTickets.map((ticket, index) => (
                  <ActivityItem
                    key={ticket.id}
                    icon="lucide:ticket"
                    title={ticket.nombre_alumno}
                    subtitle={`Clase #${ticket.numero_clase_alumno} • ${ticket.placa_auto}`}
                    isHighlighted={index === 0}
                    color="primary"
                    rightContent={
                      <div className="text-right">
                        <p className="text-sm font-medium">#{ticket.id}</p>
                        <p className="text-xs text-default-500">
                          {formatearFecha(ticket.fecha_asistencia)}
                        </p>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="lucide:ticket"
                title="No hay tickets registrados aún."
                description="Los tickets aparecerán aquí cuando se registren asistencias de tus clases."
                size="large"
              />
            )}
          </ActivityCard>
        </div>
      </div>
    </div>
  );
};