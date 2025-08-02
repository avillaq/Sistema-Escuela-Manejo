import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
} from '@heroui/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { asistenciasService } from '@/service/apiService';

export const MisAsistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  //Estados para filtros
  const [selectedEstado, setSelectedEstado] = useState("todos");

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

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter(asistencia => {
      // Filtro por estado
      if (selectedEstado === "asistio" && !asistencia.asistio) {
        return false;
      }
      if (selectedEstado === "falto" && asistencia.asistio) {
        return false;
      }

      return true;
    });
  }, [selectedEstado, asistencias]);

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
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:check-circle"
          title="Total Asistencias"
          value={estadisticas.asistencias_positivas || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:x-circle"
          title="Total Faltas"
          value={estadisticas.faltas || 0}
          color="danger"
          size="large"
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-1/3">
              <Select
                label="Estado"
                placeholder="Todos los estados"
                selectedKeys={[selectedEstado]}
                className="w-full"
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos los estados</SelectItem>
                <SelectItem key="asistio" value="asistio">Asistió</SelectItem>
                <SelectItem key="falto" value="falto">Falta</SelectItem>
              </Select>
            </div>
          </div>
          <Tabla
            title="Mis Asistencias"
            columns={columns}
            data={filteredAsistencias}
            rowKey="id"
            isloading={isLoading}
            loadingContent={<LoadingSpinner />}
          />
        </CardBody>
      </Card>
    </div>
  );
};