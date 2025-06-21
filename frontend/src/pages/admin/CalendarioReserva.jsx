import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  addToast,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { CalendarioBase } from '@/components/calendario/CalendarioBase';
import { matriculasService } from '@/service/apiService';

export const CalendarioReserva = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [matricula, setMatricula] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [horasRestantesActuales, setHorasRestantesActuales] = useState(0);

  const cargarMatricula = async () => {
    setIsLoading(true);
    try {
      const result = await matriculasService.getById(id);
      if (result.success) {
        setMatricula(result.data);

        const horas_total = result.data.tipo_contratacion === "paquete"
          ? result.data.paquete?.horas_total
          : result.data.horas_contratadas;

        const horas_restantes = horas_total - result.data.horas_completadas;
        setHorasRestantesActuales(horas_restantes);
      } else {
        addToast({
          title: "Error",
          description: "No se pudo encontrar la matrícula solicitada.",
          severity: "danger",
          color: "danger",
        });
        navigate("/matriculas");
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al cargar los datos.",
        severity: "danger",
        color: "danger",
      });
      navigate("/matriculas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarMatricula();
    }
  }, [id, navigate]);

  // actualizar horas cuando se seleccionen/deseleccionen reservas
  const handleReservasChange = (reservasSeleccionadas, tipoAccion) => {
    const horas_total = matricula.tipo_contratacion === "paquete"
      ? matricula.paquete?.horas_total
      : matricula.horas_contratadas;

    const horas_base = horas_total - matricula.horas_completadas;

    if (tipoAccion === "reservar") {
      // Restar las horas seleccionadas temporalmente
      setHorasRestantesActuales(horas_base - reservasSeleccionadas);
    } else if (tipoAccion === "cancelar") {
      // Sumar las horas que se van a liberar temporalmente
      setHorasRestantesActuales(horas_base + reservasSeleccionadas);
    } else {
      // Resetear a las horas originales
      setHorasRestantesActuales(horas_base);
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
        <Button onPress={() => navigate("/matriculas")} className="mt-4">
          Volver a Matrículas
        </Button>
      </div>
    );
  }

  const horas_total = matricula.tipo_contratacion === "paquete"
    ? matricula.paquete?.horas_total
    : matricula.horas_contratadas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/matriculas")}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Información del Alumno */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:user" width={18} height={18} />
              <h3 className="text-base font-semibold">Alumno</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{matricula.alumno.nombre} {matricula.alumno.apellidos}</p>
                <p className="text-xs text-default-500">DNI: {matricula.alumno.dni}</p>
              </div>
              <Chip color="primary" variant="flat" size="sm">{matricula.categoria}</Chip>
            </div>
          </CardBody>
        </Card>

        {/* Progreso de Clases */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:clock" width={18} height={18} />
              <h3 className="text-base font-semibold">Progreso</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Completadas</span>
                <span className="text-xs text-default-500">
                  {matricula.horas_completadas}/{horas_total}
                </span>
              </div>
              <Progress
                value={getProgreso(matricula.horas_completadas, horas_total)}
                color="primary"
                size="sm"
                className="w-full"
                aria-label="Clases completadas"
              />
            </div>
          </CardBody>
        </Card>

        {/* Horas Restantes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:timer" width={18} height={18} />
              <h3 className="text-base font-semibold">Disponibles</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-center">
              <p className={`text-3xl font-bold ${horasRestantesActuales <= 0 ? "text-danger-600" : "text-success-600"}`}>
                {horasRestantesActuales}
              </p>
              <p className="text-xs text-default-500">Horas restantes</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Mensaje de advertencia si no hay horas restantes */}
      {horasRestantesActuales <= 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-triangle" className="text-warning-600" width={20} height={20} />
              <div>
                <h4 className="font-semibold text-warning-800 text-sm">Sin horas disponibles</h4>
                <p className="text-xs text-warning-700">
                  {horasRestantesActuales < 0
                    ? "No puedes reservar más horas de las disponibles."
                    : "El alumno ha completado todas sus horas contratadas."
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Componente Calendario */}
      <CalendarioBase
        modo="matricula"
        userId={matricula.alumno.id}
        matriculaId={matricula.id}
        horasRestantes={horas_total - matricula.horas_completadas}
        onReservasChange={handleReservasChange}
      />
    </div>
  );
};