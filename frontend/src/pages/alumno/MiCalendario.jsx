import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const cargarMatriculaActiva = async () => {
      if (!id) return;

      try {
        const result = await matriculasService.getByAlumno(id);
        if (result.success && result.data.length > 0) {
          // Buscar matrícula activa (en progreso o pendiente)
          const activa = result.data.find(m => 
            m.estado_clases === 'en_progreso' || m.estado_clases === 'pendiente'
          );
          setMatriculaActiva(activa || null);
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

    cargarMatriculaActiva();
  }, [id]);

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
  
  const horas_restantes = horas_total - matriculaActiva.horas_completadas;

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
              />
            </div>
          </CardBody>
        </Card>

        {/* Horas Restantes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:clock" width={18} height={18} />
              <h3 className="text-base font-semibold">Disponibles</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-center">
              <p className={`text-3xl font-bold ${horas_restantes <= 0 ? "text-danger-600" : "text-success-600"}`}>
                {horas_restantes}
              </p>
              <p className="text-xs text-default-500">Horas restantes</p>
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

      {/* Mensaje de advertencia si no hay horas restantes */}
      {horas_restantes <= 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-triangle" className="text-warning-600" width={20} height={20} />
              <div>
                <h4 className="font-semibold text-warning-800">Sin horas disponibles</h4>
                <p className="text-xs text-warning-700">
                  Has completado todas tus horas contratadas. Contacta con la administración para renovar.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Calendario */}
      <CalendarioBase
        modo="alumno"
        userId={id}
        matriculaId={matriculaActiva.id}
        horasRestantes={horas_restantes}
      />
    </div>
  );
};