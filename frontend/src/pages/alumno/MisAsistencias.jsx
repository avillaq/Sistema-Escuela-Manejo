import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip
} from '@heroui/react';
import { Tabla, PageHeader, LoadingSpinner, StatCard } from '@/components';
import { asistenciasService } from '@/service/apiService';

export const MisAsistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar asistencias
  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const result = await asistenciasService.getMisAsistencias();
        if (result.success) {
          setAsistencias(result.data);
        }
      } catch (error) {
        console.error("Error al cargar asistencias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsistencias();
  }, []);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const total = asistencias.length;
    const asistencias_positivas = asistencias.filter(a => a.asistio).length;
    const faltas = total - asistencias_positivas;

    return {
      total,
      asistencias_positivas,
      faltas
    };
  }, [asistencias]);

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString + (fechaString.includes('GMT') ? '' : ' GMT'));
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'GMT'
    });
  };

  const columns = [
    {
      key: "numero_clase",
      label: "N° CLASE",
      render: (asistencia) => (
        <div className="font-mono font-semibold text-primary-600">
          {asistencia.numero_clase_alumno
            ? `#${asistencia.numero_clase_alumno}`
            : '-'
          }
        </div>
      )
    },
    {
      key: "fecha",
      label: "FECHA",
      render: (asistencia) => (
        <div className="font-medium">
          {formatearFecha(asistencia.fecha_clase)}
        </div>
      )
    },
    {
      key: "hora",
      label: "HORA",
      render: (asistencia) => (
        <div className="text-sm">
          {asistencia.hora_inicio} - {asistencia.hora_fin}
        </div>
      )
    },
    {
      key: "estado",
      label: "ESTADO",
      render: (asistencia) => (
        <Chip
          size="sm"
          color={asistencia.asistio ? "success" : "danger"}
          variant="flat"
        >
          {asistencia.asistio ? "Asistió" : "Falta"}
        </Chip>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Asistencias"
        subtitle="Revisa tu historial de asistencias a clases."
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="lucide:list-checks"
          title="Total Registros"
          value={isLoading ? "..." : estadisticas.total}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:check-circle"
          title="Total Asistencias"
          value={isLoading ? "..." : estadisticas.asistencias_positivas}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:x-circle"
          title="Total Faltas"
          value={isLoading ? "..." : estadisticas.faltas}
          color="danger"
          size="large"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Historial de Asistencias</h3>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <LoadingSpinner mensaje="Cargando tus asistencias..." />
          ) : (
            <Tabla
              title="Mis Asistencias"
              columns={columns}
              data={asistencias}
              rowKey="id"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};