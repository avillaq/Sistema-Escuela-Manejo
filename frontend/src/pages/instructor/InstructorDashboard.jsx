import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  addToast,
  Divider,
  Avatar
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import { ticketsService, instructoresService } from '@/service/apiService';

export const InstructorDashboard = () => {
  const { id } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [instructorInfo, setInstructorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del instructor
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [ticketsResult, instructorResult] = await Promise.all([
          ticketsService.getByInstructor(id),
          instructoresService.getById(id)
        ]);

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

        if (instructorResult.success) {
          setInstructorInfo(instructorResult.data);
        } else {
          addToast({
            title: "Error al cargar información",
            description: instructorResult.error || "No se pudo cargar la información del instructor.",
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
    };

    cargarDatos();
  }, [id]);

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

  // Formatear fecha para mostrar
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            ¡Bienvenido, {instructorInfo?.nombre || 'Instructor'}! 👋
          </h1>
          <p className="text-default-500">
            Aquí tienes un resumen de tu actividad como instructor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar
                  size="lg"
                  name={instructorInfo ? `${instructorInfo.nombre} ${instructorInfo.apellidos}` : 'I'}
                  className="bg-primary-100 text-primary-700"
                />
                <div>
                  <h3 className="text-lg font-semibold">Mi Información</h3>
                  <p className="text-sm text-default-500">Datos personales</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {instructorInfo && (
                <>
                  <div>
                    <p className="text-sm text-default-500">Nombre Completo</p>
                    <p className="font-medium">
                      {instructorInfo.nombre} {instructorInfo.apellidos}
                    </p>
                  </div>

                  <Divider />

                  <div>
                    <p className="text-sm text-default-500">DNI</p>
                    <p className="font-medium">{instructorInfo.dni}</p>
                  </div>

                  <div>
                    <p className="text-sm text-default-500">Teléfono</p>
                    <p className="font-medium">{instructorInfo.telefono}</p>
                  </div>

                  {instructorInfo.email && (
                    <div>
                      <p className="text-sm text-default-500">Email</p>
                      <p className="font-medium text-sm">{instructorInfo.email}</p>
                    </div>
                  )}

                  <Divider />

                  <div>
                    <p className="text-sm text-default-500">Estado</p>
                    <Chip
                      size="sm"
                      color={instructorInfo.activo ? "success" : "danger"}
                      variant="flat"
                    >
                      {instructorInfo.activo ? "Activo" : "Inactivo"}
                    </Chip>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:bar-chart-3" width={20} height={20} />
                <h3 className="text-lg font-semibold">Resumen de Actividad</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
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
            </CardBody>
          </Card>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:clock" width={20} height={20} />
                  <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {estadisticas.ultimosTickets.length > 0 ? (
                <div className="space-y-4">
                  {estadisticas.ultimosTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-lg border ${index === 0 ? 'bg-primary-50 border-primary-200' : 'bg-default-50 border-default-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${index === 0 ? 'bg-primary-100' : 'bg-default-100'}`}>
                            <Icon
                              icon="lucide:ticket"
                              className={index === 0 ? 'text-primary-600' : 'text-default-600'}
                              width={16}
                              height={16}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{ticket.nombre_alumno}</p>
                            <p className="text-sm text-default-500">
                              Clase #{ticket.numero_clase_alumno} • {ticket.placa_auto}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">#{ticket.id}</p>
                          <p className="text-xs text-default-500">
                            {formatearFecha(ticket.fecha_asistencia)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="lucide:ticket" className="mx-auto mb-4 text-default-300" width={48} height={48} />
                  <p className="text-default-500">No hay tickets registrados aún.</p>
                  <p className="text-sm text-default-400">
                    Los tickets aparecerán aquí cuando se registren asistencias de tus clases.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};