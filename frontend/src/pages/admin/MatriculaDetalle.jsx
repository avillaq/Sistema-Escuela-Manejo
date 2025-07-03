import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  CardBody,
  Button,
  addToast,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { PagoModal } from '@/pages/admin/PagoModal';
import { matriculasService } from '@/service/apiService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { MatriculaCard } from '@/components/dashboard/MatriculaCard';
import { FinancialCard } from '@/components/dashboard/FinancialCard';
import { InfoCard } from '@/components/dashboard/InfoCard';

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
          <InfoCard
            title="Información del Alumno"
            subtitle="Datos personales del estudiante"
            avatarName={`${matricula.alumno.nombre} ${matricula.alumno.apellidos}`}
            fields={[
              {
                label: "Nombre Completo",
                value: `${matricula.alumno.nombre} ${matricula.alumno.apellidos}`,
                dividerBefore: false
              },
              {
                label: "DNI",
                value: matricula.alumno.dni,
                dividerBefore: true
              },
              {
                label: "Email",
                value: matricula.alumno.email
              },
              {
                label: "Teléfono",
                value: matricula.alumno.telefono
              }
            ]}
            chips={[{
              label: matricula.alumno.activo ? "Activo" : "Inactivo",
              color: matricula.alumno.activo ? "success" : "danger",
              size: "sm"
            }]}
          />

          {/* Información de la matrícula */}
          <MatriculaCard
            matricula={matricula}
            estadisticas={{
              horas_total,
              horas_completadas: matricula.horas_completadas,
              progreso: getProgreso(matricula.horas_completadas, horas_total)
            }}
            getEstadoClasesColor={getEstadoClasesColor}
            getEstadoPagoColor={getEstadoPagoColor}
          />

          {/* Historial de pagos */}
          {matricula.pagos && matricula.pagos.length > 0 && (
            <ActivityCard
              title="Historial de Pagos"
              headerIcon="lucide:history"
            >
              <div className="space-y-3">
                {matricula.pagos.map((pago) => (
                  <ActivityItem
                    key={pago.id}
                    icon="lucide:credit-card"
                    title={`Pago del ${new Date(pago.fecha).toLocaleDateString('es-PE')}`}
                    subtitle={`Monto: S/ ${pago.monto.toFixed(2)}`}
                    color="success"
                    rightContent={
                      <div className="text-right">
                        <p className="font-semibold text-success-600">S/ {pago.monto.toFixed(2)}</p>
                      </div>
                    }
                  />
                ))}
              </div>
            </ActivityCard>
          )}
        </div>

        {/* Resumen financiero */}
        <div>
          <div className="sticky top-4 space-y-4">
            <FinancialCard
              matricula={matricula}
              estadisticas={{
                progresoPago: getPorcentajePagado(matricula.pagos_realizados, matricula.costo_total)
              }}
            />
            
            {/* Botones de acción */}
            <Card>
              <CardBody className="space-y-3">
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
              </CardBody>
            </Card>
          </div>
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