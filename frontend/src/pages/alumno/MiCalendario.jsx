import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { CalendarioBase } from '@/components/calendario/CalendarioBase';
import { matriculasService } from '@/service/apiService';
import { useAuthStore } from '@/store/auth-store';

export const MiCalendario = () => {
  const { id } = useAuthStore();
  const [matriculaActiva, setMatriculaActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const cargarMatriculaActiva = async () => {
    if (!id) return;

    try {
      const result = await matriculasService.getByAlumno(id);

      if (result.success) {
        console.log("Matrícula activa:", result.data);
        setMatriculaActiva(result.data);
      } else {
        addToast({
          title: "Error",
          description: "No se pudo encontrar tu matrícula.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "No se pudo cargar tu información de matrícula.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarMatriculaActiva();
  }, [id]);

  // refrescar reservas
  const handleReservasChange = useCallback((senal) => {
    if (senal === "refresh") {
      cargarMatriculaActiva();
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
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!matriculaActiva) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Calendario</h1>
          <p className="text-default-500">Gestiona tus reservaciones de clases.</p>
        </div>

        <Card className="border-warning-200 bg-warning-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-circle" className="text-warning-600" width={20} height={20} />
              <div>
                <h4 className="font-semibold text-warning-800">Sin matrícula activa</h4>
                <p className="text-sm text-warning-700">
                  No tienes una matrícula activa. Contacta con la administración para registrarte.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const horas_total = matriculaActiva.tipo_contratacion === 'paquete'
    ? matriculaActiva.paquete?.horas_total
    : matriculaActiva.horas_contratadas;

  const horas_disponibles = matriculaActiva.horas_disponibles_reserva || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Calendario</h1>
        <p className="text-default-500">Gestiona tus reservaciones de clases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progreso de Clases */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:target" width={18} height={18} />
              <h3 className="text-base font-semibold">Mi Progreso</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Completadas</span>
                <span className="text-xs text-default-500">
                  {matriculaActiva.horas_completadas}/{horas_total}
                </span>
              </div>
              <Progress
                value={getProgreso(matriculaActiva.horas_completadas, horas_total)}
                color="primary"
                size="sm"
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
              <Icon icon="lucide:clock" width={18} height={18} />
              <h3 className="text-base font-semibold">Disponibles</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-center">
              <p className={`text-3xl font-bold ${horas_disponibles <= 0 ? "text-danger-600" : "text-success-600"}`}>
                {Math.max(0, horas_disponibles)}
              </p>
              <p className="text-xs text-default-500">Para reservar</p>
            </div>
          </CardBody>
        </Card>

        {/* Información de Matrícula */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:graduation-cap" width={18} height={18} />
              <h3 className="text-base font-semibold">Mi Matrícula</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-default-500">Categoría:</span>
              <span className="text-xs font-medium">{matriculaActiva.categoria}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-default-500">Tipo:</span>
              <span className="text-xs font-medium capitalize">
                {matriculaActiva.tipo_contratacion.replace('_', ' ')}
              </span>
            </div>
            {matriculaActiva.tipo_contratacion === 'paquete' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-500">Paquete:</span>
                <span className="text-xs font-medium">{matriculaActiva.paquete?.nombre}</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {(matriculaActiva.estado_clases == "completado") && (
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

      {(matriculaActiva.estado_clases == "vencido") && (
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

      {/* Calendario */}
      <CalendarioBase
        modo='alumno'
        userId={id}
        matriculaId={matriculaActiva?.id}
        horasRestantes={Math.max(0, horas_disponibles)}
        estadoClases={matriculaActiva?.estado_clases}
        categoria={matriculaActiva?.categoria}
        onReservasChange={handleReservasChange}
      />
    </div>
  );
};