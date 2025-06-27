import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Button,
  Divider,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import { matriculasService, reservasService } from '@/service/apiService';
import { useNavigate } from 'react-router';

export const AlumnoDashboard = () => {
  const navigate = useNavigate();
  const { id } = useAuthStore();
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando tu información...</p>
        </div>
      </div>
    );
  }

  // Si no hay matrícula activa
  if (!matriculaActiva) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            ¡Bienvenido, {matriculaActiva.alumno.nombre}! 👋
          </h1>
          <p className="text-default-500">
            Tu panel de control personal.
          </p>
        </div>

        <Card className="border-warning-200 bg-warning-50">
          <CardBody className="text-center py-12">
            <Icon icon="lucide:graduation-cap" className="mx-auto mb-4 text-warning-500" width={48} height={48} />
            <h3 className="text-lg font-semibold text-warning-700 mb-2">
              No tienes una matrícula activa
            </h3>
            <p className="text-warning-600 mb-4">
              Contacta con la administración para registrar tu matrícula y comenzar tus clases de manejo.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-warning-600">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            ¡Bienvenido, {matriculaActiva.alumno.nombre}! 👋
          </h1>
          <p className="text-default-500">
            Aquí tienes el resumen de tu progreso y próximas clases.
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-500/20">
              <Icon icon="lucide:book-open" className="text-primary-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-primary-700">Clases Completadas</p>
              <p className="text-2xl font-semibold text-primary-700">
                {estadisticas.horas_completadas}
              </p>
              <p className="text-xs text-primary-600">de {estadisticas.horas_total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success-500/20">
              <Icon icon="lucide:clock" className="text-success-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-success-700">Clases Disponibles</p>
              <p className="text-2xl font-semibold text-success-700">
                {estadisticas.horas_disponibles}
              </p>
              <p className="text-xs text-success-600">para reservar</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-warning-500/20">
              <Icon icon="lucide:calendar-check" className="text-warning-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-warning-700">Reservas Pendientes</p>
              <p className="text-2xl font-semibold text-warning-700">
                {estadisticas.reservas_pendientes}
              </p>
              <p className="text-xs text-warning-600">programadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Icon icon="lucide:target" className="text-purple-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-purple-700">Progreso Total</p>
              <p className="text-2xl font-semibold text-purple-700">
                {estadisticas.progreso}%
              </p>
              <p className="text-xs text-purple-600">completado</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la matrícula */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:graduation-cap" width={20} height={20} />
                <h3 className="text-lg font-semibold">Mi Matrícula</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500">Categoría</p>
                  <Chip color="primary" variant="flat">{matriculaActiva.categoria}</Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500">Fecha de Matrícula</p>
                  <p className="font-medium">
                    {new Date(matriculaActiva.fecha_matricula).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Estado de Clases</p>
                  <Chip
                    color={getEstadoClasesColor(matriculaActiva.estado_clases)}
                    variant="flat"
                  >
                    {matriculaActiva.estado_clases.charAt(0).toUpperCase() + 
                     matriculaActiva.estado_clases.slice(1).replace('_', ' ')}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500">Estado de Pago</p>
                  <Chip
                    color={getEstadoPagoColor(matriculaActiva.estado_pago)}
                    variant="flat"
                  >
                    {matriculaActiva.estado_pago.charAt(0).toUpperCase() + 
                     matriculaActiva.estado_pago.slice(1)}
                  </Chip>
                </div>
              </div>

              <Divider />

              {/* Información del paquete */}
              {matriculaActiva.tipo_contratacion === 'paquete' && matriculaActiva.paquete ? (
                <div>
                  <h4 className="font-semibold mb-3">Tu Paquete</h4>
                  <div className="p-4 bg-default-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Paquete</p>
                        <p className="font-medium">{matriculaActiva.paquete.nombre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Tipo de Auto</p>
                        <p className="font-medium">{matriculaActiva.paquete.tipo_auto?.tipo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-3">Contratación por Horas</h4>
                  <div className="p-4 bg-default-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Horas Contratadas</p>
                        <p className="font-medium">{matriculaActiva.horas_contratadas} horas</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Tarifa por Hora</p>
                        <p className="font-medium">S/ {matriculaActiva.tarifa_por_hora}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progreso de clases */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Progreso de Clases</span>
                  <span className="text-sm text-default-500">
                    {estadisticas.horas_completadas}/{estadisticas.horas_total} horas ({estadisticas.progreso}%)
                  </span>
                </div>
                <Progress
                  value={estadisticas.progreso}
                  color="primary"
                  className="w-full"
                  aria-label="Progreso de Clases"
                />
              </div>
            </CardBody>
          </Card>

          {/* Próximas clases */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:calendar-clock" width={20} height={20} />
                  <h3 className="text-lg font-semibold">Próximas Clases</h3>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Icon icon="lucide:plus" width={14} height={14} />}
                  onPress={() => navigate('/mi-calendario')}
                >
                  Reservar
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {proximasClases.length > 0 ? (
                <div className="space-y-4">
                  {proximasClases.map((reserva, index) => (
                    <div
                      key={reserva.id}
                      className={`p-4 rounded-lg border ${
                        index === 0 ? 'bg-primary-50 border-primary-200' : 'bg-default-50 border-default-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            index === 0 ? 'bg-primary-100' : 'bg-default-100'
                          }`}>
                            <Icon 
                              icon="lucide:calendar" 
                              className={index === 0 ? 'text-primary-600' : 'text-default-600'} 
                              width={16} 
                              height={16} 
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatearFechaClase(reserva.bloque.fecha, reserva.bloque.hora_inicio)}
                            </p>
                            <p className="text-sm text-default-500">
                              {reserva.bloque.hora_inicio} - {reserva.bloque.hora_fin}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <Chip size="sm" color="primary" variant="flat">
                            Próxima
                          </Chip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="lucide:calendar-x" className="mx-auto mb-4 text-default-300" width={48} height={48} />
                  <p className="text-default-500 mb-2">No tienes clases programadas</p>
                  <p className="text-sm text-default-400 mb-4">
                    Reserva tus clases para continuar con tu aprendizaje
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Resumen financiero */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:credit-card" width={20} height={20} />
                <h3 className="text-lg font-semibold">Estado de Pagos</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-default-500 mb-1">Costo Total</p>
                <p className="text-2xl font-bold">S/ {matriculaActiva.costo_total.toFixed(2)}</p>
              </div>

              <Divider />

              <div>
                <p className="text-sm text-default-500 mb-1">Monto Pagado</p>
                <p className="text-lg font-semibold text-success-600">
                  S/ {matriculaActiva.pagos_realizados.toFixed(2)}
                </p>
              </div>

              {matriculaActiva.saldo_pendiente > 0 && (
                <div>
                  <p className="text-sm text-default-500 mb-1">Saldo Pendiente</p>
                  <p className="text-lg font-semibold text-danger-600">
                    S/ {matriculaActiva.saldo_pendiente.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Progreso de pagos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progreso de Pagos</span>
                  <span className="text-sm text-default-500">
                    {estadisticas.progresoPago}%
                  </span>
                </div>
                <Progress
                  value={estadisticas.progresoPago}
                  color="success"
                  className="w-full"
                  aria-label="Progreso de Pagos"
                />
              </div>

              {matriculaActiva.saldo_pendiente > 0 && (
                <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-center gap-2 text-warning-700">
                    <Icon icon="lucide:alert-triangle" width={16} height={16} />
                    <p className="text-sm font-medium">Pago Pendiente</p>
                  </div>
                  <p className="text-xs text-warning-600 mt-1">
                    Contacta con administración para completar tu pago
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