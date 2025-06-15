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
import { Calendar } from '@/pages/Calendar';
import { matriculasService } from '@/service/apiService';

export const MatriculaReservas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [matricula, setMatricula] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Calcular estadísticas
  const getEstadoClasesColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_progreso': return 'primary';
      case 'completado': return 'success';
      case 'vencido': return 'danger';
      default: return 'default';
    }
  };

  const getProgreso = (horas_completadas, horas_total) => {
    if (!horas_total) return 0;
    return Math.round((horas_completadas / horas_total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando datos de la matrícula...</p>
        </div>
      </div>
    );
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

  const horas_restantes = horas_total - matricula.horas_completadas;

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Reservas de Clases</h1>
          <p className="text-default-500">
            {matricula.alumno.nombre} {matricula.alumno.apellidos} - Matrícula #{matricula.id}
          </p>
        </div>
      </div>

      {/* Información del Alumno y Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Información del Alumno */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:user" width={20} height={20} />
              <h3 className="text-lg font-semibold">Alumno</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-default-500">Nombre Completo</p>
              <p className="font-medium">{matricula.alumno.nombre} {matricula.alumno.apellidos}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">DNI</p>
              <p className="font-medium">{matricula.alumno.dni}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Categoría</p>
              <Chip color="primary" variant="flat" size="sm">{matricula.categoria}</Chip>
            </div>
          </CardBody>
        </Card>

        {/* Progreso de Clases */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:clock" width={20} height={20} />
              <h3 className="text-lg font-semibold">Progreso</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Horas Completadas</span>
                <span className="text-sm text-default-500">
                  {matricula.horas_completadas}/{horas_total}
                </span>
              </div>
              <Progress
                value={getProgreso(matricula.horas_completadas, horas_total)}
                color="primary"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-success-50 rounded-lg">
                <p className="text-2xl font-bold text-success-600">{horas_restantes}</p>
                <p className="text-xs text-success-600">Horas Restantes</p>
              </div>
              <div className="text-center p-2 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{getProgreso(matricula.horas_completadas, horas_total)}%</p>
                <p className="text-xs text-primary-600">Completado</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Estado de la Matrícula */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:info" width={20} height={20} />
              <h3 className="text-lg font-semibold">Estado</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-default-500 mb-1">Estado de Clases</p>
              <Chip
                color={getEstadoClasesColor(matricula.estado_clases)}
                variant="flat"
                size="sm"
              >
                {matricula.estado_clases.charAt(0).toUpperCase() + matricula.estado_clases.slice(1).replace('_', ' ')}
              </Chip>
            </div>
            <div>
              <p className="text-sm text-default-500 mb-1">Fecha Límite</p>
              <p className="font-medium text-sm">
                {matricula.fecha_limite ? new Date(matricula.fecha_limite).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500 mb-1">Tipo de Contratación</p>
              <p className="font-medium text-sm capitalize">
                {matricula.tipo_contratacion.replace('_', ' ')}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Información del Paquete/Contratación */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:package" width={20} height={20} />
              <h3 className="text-lg font-semibold">Detalles</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {matricula.tipo_contratacion === 'paquete' && matricula.paquete ? (
              <>
                <div>
                  <p className="text-sm text-default-500">Paquete</p>
                  <p className="font-medium text-sm">{matricula.paquete.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Tipo de Auto</p>
                  <p className="font-medium text-sm">{matricula.paquete.tipo_auto.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Costo Total</p>
                  <p className="font-medium text-sm">S/ {matricula.paquete.costo_total.toFixed(2)}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-default-500">Tarifa por Hora</p>
                  <p className="font-medium text-sm">S/ {matricula.tarifa_por_hora}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Costo Total</p>
                  <p className="font-medium text-sm">S/ {matricula.costo_total.toFixed(2)}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Mensaje de advertencia si no hay horas restantes */}
      {horas_restantes <= 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-triangle" className="text-warning-600" width={24} height={24} />
              <div>
                <h4 className="font-semibold text-warning-800">Sin horas disponibles</h4>
                <p className="text-sm text-warning-700">
                  El alumno ha completado todas sus horas contratadas. No puede realizar nuevas reservas.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Componente Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar" width={20} height={20} />
            <h3 className="text-lg font-semibold">Calendario de Reservas</h3>
          </div>
        </CardHeader>
        <CardBody>
          <Calendar
            userId={matricula.alumno.id}
            matriculaId={matricula.id}
            horasRestantes={horas_restantes}
            isAdminMode={true}
          />
        </CardBody>
      </Card>
    </div>
  );
};