import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  Divider,
  addToast,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { PagoModal } from '@/pages/admin/PagoModal';
import { matriculasService } from '@/service/apiService';
import { PageHeader, LoadingSpinner } from '@/components';

export const MatriculaDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [matricula, setMatricula] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de pagos
  const { isOpen: isPagoModalOpen, onOpen: onPagoModalOpen, onOpenChange: onPagoModalOpenChange } = useDisclosure();


  useEffect(() => {
    const loadMatricula = async () => {
      try {
        const result = await matriculasService.getById(id);
        if (result.success) {
          setMatricula(result.data);
        } else {
          addToast({
            title: "Error",
            description: "No se pudo encontrar la matrícula solicitada.",
            severity: "danger",
            color: "danger",
          });
          navigate('/matriculas');
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar los datos.",
          severity: "danger",
          color: "danger",
        });
        navigate('/matriculas');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadMatricula();
    }
  }, [id, navigate]);

  // Manejar cuando se registra un nuevo pago
  const handlePagoRegistrado = (nuevoPago) => {
    // Actualizar la matrícula con el nuevo pago
    const nuevosPagosRealizados = matricula.pagos_realizados + nuevoPago.monto;
    const nuevoSaldoPendiente = matricula.costo_total - nuevosPagosRealizados;
    const nuevoEstadoPago = nuevoSaldoPendiente <= 0 ? 'completo' : 'pendiente';

    const matriculaActualizada = {
      ...matricula,
      pagos_realizados: nuevosPagosRealizados,
      saldo_pendiente: nuevoSaldoPendiente,
      estado_pago: nuevoEstadoPago
    };

    setMatricula(matriculaActualizada);

    // Mostrar notificación de éxito
    addToast({
      title: "Pago registrado",
      description: `Se ha registrado el pago de S/ ${nuevoPago.monto.toFixed(2)} correctamente.`,
      severity: "success",
      color: "success",
    });
  };

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

  const getProgreso = (horas_completadas, horas_total) => {
    if (!horas_total) return 0;
    return Math.round((horas_completadas / horas_total) * 100);
  };

  const getPorcentajePagado = (pagado, total) => {
    if (!total) return 0;
    return Math.round((pagado / total) * 100);
  };

  if (isLoading) {
    return (<LoadingSpinner mensaje="Cargando datos de la matricula..." />);
  }

  if (!matricula) {
    return (
      <div className="text-center">
        <p>No se pudo cargar la matrícula.</p>
        <Button onPress={() => navigate('/matriculas')} className="mt-4">
          Volver a Matrículas
        </Button>
      </div>
    );
  }

  const horas_total = matricula.tipo_contratacion === 'paquete'
    ? matricula.paquete?.horas_total
    : matricula.horas_contratadas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/matriculas')}
        >
          <Icon icon="lucide:arrow-left" width={20} height={20} />
        </Button>
        <PageHeader
          title={`Detalles de Matrícula #${matricula.id}`}
          subtitle={`${matricula.alumno.nombre} ${matricula.alumno.apellidos} - ${matricula.categoria}`}
          emoji=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del alumno */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:user" width={20} height={20} />
                <h3 className="text-lg font-semibold">Información del Alumno</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-default-500 mb-1">Nombre Completo</p>
                  <p className="font-medium">{matricula.alumno.nombre} {matricula.alumno.apellidos}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">DNI</p>
                  <p className="font-medium">{matricula.alumno.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Email</p>
                  <p className="font-medium">{matricula.alumno.email}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Teléfono</p>
                  <p className="font-medium">{matricula.alumno.telefono}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Información de la matrícula */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:graduation-cap" width={20} height={20} />
                <h3 className="text-lg font-semibold">Información de la Matrícula</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-default-500 mb-1">Categoría</p>
                  <Chip color="primary" variant="flat">{matricula.categoria}</Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Fecha de Matrícula</p>
                  <p className="font-medium">{new Date(matricula.fecha_matricula).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Estado de Clases</p>
                  <Chip
                    color={getEstadoClasesColor(matricula.estado_clases)}
                    variant="flat"
                  >
                    {matricula.estado_clases.charAt(0).toUpperCase() + matricula.estado_clases.slice(1).replace('_', ' ')}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500 mb-1">Estado de Pago</p>
                  <Chip
                    color={getEstadoPagoColor(matricula.estado_pago)}
                    variant="flat"
                  >
                    {matricula.estado_pago.charAt(0).toUpperCase() + matricula.estado_pago.slice(1)}
                  </Chip>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Detalles del paquete o contratación por horas */}
              {matricula.tipo_contratacion === 'paquete' && matricula.paquete ? (
                <div>
                  <h4 className="font-semibold mb-3">Paquete Contratado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-default-50 rounded-lg">
                    <div>
                      <p className="text-sm text-default-500">Paquete</p>
                      <p className="font-medium">{matricula.paquete.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Tipo de Auto</p>
                      <p className="font-medium">{matricula.paquete.tipo_auto.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Horas Totales</p>
                      <p className="font-medium">{matricula.paquete.horas_total} horas</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-3">Contratación por Horas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
                    <div>
                      <p className="text-sm text-default-500">Horas Contratadas</p>
                      <p className="font-medium">{matricula.horas_contratadas} horas</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Tarifa por Hora</p>
                      <p className="font-medium">S/ {matricula.tarifa_por_hora}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progreso de clases */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Progreso de Clases</span>
                  <span className="text-sm text-default-500">
                    {matricula.horas_completadas}/{horas_total} horas ({getProgreso(matricula.horas_completadas, horas_total)}%)
                  </span>
                </div>
                <Progress
                  value={getProgreso(matricula.horas_completadas, horas_total)}
                  color="primary"
                  className="w-full"
                  aria-label="Progreso de Clases"
                />
              </div>
            </CardBody>
          </Card>

          {/* Historial de pagos */}
          {matricula.pagos && matricula.pagos.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:history" width={20} height={20} />
                  <h3 className="text-lg font-semibold">Historial de Pagos</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {matricula.pagos.map((pago) => (
                    <div key={pago.id} className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                      <div>
                        <p className="font-medium">Pago</p>
                        <p className="text-sm text-default-500">
                          {new Date(pago.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success-600">S/ {pago.monto.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Resumen financiero */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:credit-card" width={20} height={20} />
                <h3 className="text-lg font-semibold">Resumen Financiero</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-default-500 mb-1">Costo Total</p>
                <p className="text-2xl font-bold">{matricula.costo_total.toFixed(2)}</p>
              </div>

              <Divider />

              <div>
                <p className="text-sm text-default-500 mb-1">Monto Pagado</p>
                <p className="text-lg font-semibold text-success-600">S/ {matricula.pagos_realizados.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-default-500 mb-1">Saldo Pendiente</p>
                <p className="text-lg font-semibold text-danger-600">S/ {matricula.saldo_pendiente.toFixed(2)}</p>
              </div>

              {/* Progreso de pagos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progreso de Pagos</span>
                  <span className="text-sm text-default-500">
                    {getPorcentajePagado(matricula.pagos_realizados, matricula.costo_total)}%
                  </span>
                </div>
                <Progress
                  value={getPorcentajePagado(matricula.pagos_realizados, matricula.costo_total)}
                  color="success"
                  className="w-full"
                  aria-label="Progreso de Pagos"
                />
              </div>

              <Divider />

              {matricula.saldo_pendiente > 0 && (
                <Button
                  color="success"
                  className="w-full"
                  startContent={<Icon icon="lucide:credit-card" width={16} height={16} />}
                  onPress={onPagoModalOpen}
                >
                  Registrar Pago
                </Button>
              )}
              <Button
                color="primary"
                variant="flat"
                className="w-full"
                startContent={<Icon icon="lucide:calendar" width={16} height={16} />}
                onPress={() => navigate(`/matriculas/${matricula.id}/reservas`)}
              >
                Gestionar Reservas
              </Button>

              <Button
                color="primary"
                variant="flat"
                className="w-full"
                startContent={<Icon icon="lucide:edit" width={16} height={16} />}
                onPress={() => navigate(`/matriculas/${matricula.id}/editar`)}
              >
                Editar Matrícula
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal de registro de pagos */}
      <PagoModal
        isOpen={isPagoModalOpen}
        onOpenChange={onPagoModalOpenChange}
        matricula={matricula}
        onPagoRegistrado={handlePagoRegistrado}
      />
    </div>
  );
};