import { useState, useEffect, useCallback } from 'react';
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

  const cargarMatricula = async () => {
    setIsLoading(true);
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

  // funcion para refrescar
  const handleReservasChange = useCallback((senal) => {
    if (senal === "refresh") {
      cargarMatricula();
    }
  }, []);

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
  const horas_disponibles = matricula.horas_disponibles_reserva || 0;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del Alumno + Progreso */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:user" width={18} height={18} />
              <h3 className="text-base font-semibold">Información del Alumno</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{matricula.alumno.nombre} {matricula.alumno.apellidos}</p>
                <p className="text-sm text-default-500">DNI: {matricula.alumno.dni}</p>
              </div>
              <Chip color="primary" variant="flat" size="sm">{matricula.categoria}</Chip>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso de clases</span>
                <span className="text-sm text-default-600">
                  {matricula.horas_completadas} de {horas_total}
                </span>
              </div>
              <Progress
                value={getProgreso(matricula.horas_completadas, horas_total)}
                color="success"
                size="md"
                className="w-full"
                aria-label="Progreso de clases"
              />
            </div>
          </CardBody>
        </Card>

        {/* Horas Disponibles para Reservar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:calendar-plus" width={18} height={18} />
              <h3 className="text-base font-semibold">Disponibles para Reservar</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-center">
              <p className={`text-4xl font-bold ${horas_disponibles <= 0 ? "text-danger-600" : "text-primary-600"}`}>
                {Math.max(0, horas_disponibles)}
              </p>
              <p className="text-sm text-default-500 mt-1">
                {horas_disponibles <= 0 ? "Sin horas disponibles" : "Horas para reservar"}
              </p>

              <div className="mt-3 pt-3 border-t border-default-200">
                <div className="flex justify-between text-xs text-default-500">
                  <span>Reservadas: {matricula.reservas_pendientes || 0}</span>
                  <span>Completadas: {matricula.horas_completadas}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {(matricula.estado_clases == "completado") && (
        <Card className="border-success-200 bg-success-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:check-circle" className="text-success-600" width={20} height={20} />
              <div>
                <h4 className="font-semibold text-success-800">Matrícula Completada</h4>
                <p className="text-sm text-success-700">
                  Esta matrícula ha sido completada. No se pueden realizar más reservas.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {(matricula.estado_clases == "vencido") && (
        <Card className="border-danger-200 bg-danger-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-circle" className="text-danger-600" width={20} height={20} />
              <div>
                <h4 className="font-semibold text-danger-800">Matrícula Vencida</h4>
                <p className="text-sm text-danger-700">
                  Esta matrícula ha vencido. No se pueden realizar más reservas.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <CalendarioBase
        modo="matricula"
        userId={matricula.alumno.id}
        matriculaId={matricula.id}
        horasRestantes={Math.max(0, horas_disponibles)}
        estadoClases={matricula.estado_clases}
        categoria={matricula.categoria}
        onReservasChange={handleReservasChange}
      />
    </div>
  );
};