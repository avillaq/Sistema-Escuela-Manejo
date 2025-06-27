import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Button,
  addToast,
  Avatar
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import { StatsCard } from '@/components/stats-card';
import { AreaChartCard } from '@/components/area-chart';
import { BarChartCard } from '@/components/bar-chart';
import { reportesService } from '@/service/apiService';
import { useAuthStore } from '@/store/auth-store';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dashboardResult, adminResult] = await Promise.all([
          reportesService.getDashboardAdmin(),
          reportesService.getAdminInfo()
        ]);

        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          addToast({
            title: "Error al cargar dashboard",
            description: dashboardResult.error || "No se pudieron cargar los datos del dashboard.",
            severity: "danger",
            color: "danger",
          });
        }

        if (adminResult.success) {
          setAdminInfo(adminResult.data);
        } else {
          addToast({
            title: "Error al cargar información",
            description: adminResult.error || "No se pudo cargar la información del administrador.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar los datos.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Formatear datos para gráficos
  const chartData = useMemo(() => {
    if (!dashboardData) return { matriculas: [], ingresos: [] };

    const matriculasChart = dashboardData.matriculas_por_mes.map(item => ({
      name: item.mes,
      cantidad: item.cantidad
    }));

    const ingresosChart = dashboardData.ingresos_por_mes.map(item => ({
      name: item.mes,
      ingresos: item.total
    }));

    return { matriculas: matriculasChart, ingresos: ingresosChart };
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.estadisticas_generales || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <p className="text-default-500">
            Bienvenido, {user?.username || 'Administrador'}. Aquí tienes el resumen de la escuela.
          </p>
        </div>
        {adminInfo && (
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <Avatar
                size="sm"
                name={user?.username || 'A'}
                className="bg-primary-100 text-primary-700"
              />
              <div>
                <p className="text-sm font-medium">{adminInfo.username}</p>
                <p className="text-xs text-default-500">
                  Último acceso: {adminInfo.ultimo_acceso}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Alumnos Activos"
          value={stats.alumnos_activos || 0}
          icon="lucide:users"
          color="primary"
        />
        <StatsCard
          title="Clases Este Mes"
          value={stats.clases_mes || 0}
          icon="lucide:graduation-cap"
          color="success"
        />
        <StatsCard
          title="Ingresos Mensuales"
          value={`S/ ${(stats.ingresos_mes || 0).toFixed(0)}`}
          icon="lucide:dollar-sign"
          color="warning"
        />
        <StatsCard
          title="Matrículas Activas"
          value={stats.matriculas_activas || 0}
          icon="lucide:file-text"
          color="secondary"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Ingresos Mensuales"
          data={chartData.ingresos}
          dataKey="ingresos"
          color="primary"
          xAxisKey="name"
        />
        <BarChartCard
          title="Nuevas Matrículas"
          data={chartData.matriculas}
          dataKey="cantidad"
          color="success"
          xAxisKey="name"
        />
      </div>

      {/* Actividad y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad de hoy */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:calendar-check" width={20} height={20} />
                <h3 className="text-lg font-semibold">Clases de Hoy</h3>
              </div>
              <Button
                size="sm"
                variant="flat"
                onPress={() => navigate('/asistencias')}
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {dashboardData?.actividad_hoy?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.actividad_hoy.slice(0, 5).map((clase, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{clase.alumno}</p>
                      <p className="text-xs text-default-500">{clase.horario}</p>
                    </div>
                    <Chip
                      size="sm"
                      color={
                        clase.estado === 'completada' ? 'success' :
                        clase.estado === 'falta' ? 'danger' : 'warning'
                      }
                      variant="flat"
                    >
                      {clase.estado === 'completada' ? 'Asistió' :
                       clase.estado === 'falta' ? 'Faltó' : 'Pendiente'}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="lucide:calendar-x" className="mx-auto mb-2 text-default-300" width={32} height={32} />
                <p className="text-sm text-default-500">No hay clases programadas desde ahora</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Clases de mañana */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:calendar" width={20} height={20} />
              <h3 className="text-lg font-semibold">Mañana</h3>
            </div>
          </CardHeader>
          <CardBody>
            {dashboardData?.actividad_manana?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.actividad_manana.slice(0, 5).map((clase, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{clase.alumno}</p>
                      <p className="text-xs text-default-500">{clase.horario}</p>
                    </div>
                    <Icon icon="lucide:clock" className="text-default-400" width={16} height={16} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="lucide:calendar-check" className="mx-auto mb-2 text-default-300" width={32} height={32} />
                <p className="text-sm text-default-500">No hay clases programadas para mañana</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="lucide:alert-triangle" width={20} height={20} />
              <h3 className="text-lg font-semibold">Alertas</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Matrículas por vencer */}
            {dashboardData?.alertas?.matriculas_por_vencer?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Icon icon="lucide:calendar-clock" width={14} height={14} />
                  Matrículas por Vencer
                </h4>
                <div className="space-y-2">
                  {dashboardData.alertas.matriculas_por_vencer.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-2 bg-warning-50 border border-warning-200 rounded-lg">
                      <p className="text-xs font-medium text-warning-700">{item.alumno}</p>
                      <p className="text-xs text-warning-600">
                        Vence: {item.vence} ({item.dias_restantes} días)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagos pendientes */}
            {dashboardData?.alertas?.pagos_pendientes?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Icon icon="lucide:credit-card" width={14} height={14} />
                  Pagos Pendientes
                </h4>
                <div className="space-y-2">
                  {dashboardData.alertas.pagos_pendientes.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-2 bg-danger-50 border border-danger-200 rounded-lg">
                      <p className="text-xs font-medium text-danger-700">{item.alumno}</p>
                      <p className="text-xs text-danger-600">
                        Saldo: S/ {item.saldo.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Si no hay alertas */}
            {(!dashboardData?.alertas?.matriculas_por_vencer?.length && 
              !dashboardData?.alertas?.pagos_pendientes?.length) && (
              <div className="text-center py-4">
                <Icon icon="lucide:check-circle" className="mx-auto mb-2 text-success-500" width={32} height={32} />
                <p className="text-sm text-success-600">Todo está al día</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recursos disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Icon icon="lucide:users" className="text-purple-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-purple-700">Instructores Activos</p>
              <p className="text-2xl font-semibold text-purple-700">
                {stats.instructores_activos || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-500/20">
              <Icon icon="lucide:car" className="text-orange-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-orange-700">Autos Disponibles</p>
              <p className="text-2xl font-semibold text-orange-700">
                {stats.autos_activos || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Icon icon="lucide:trending-up" className="text-blue-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-blue-700">Clases Esta Semana</p>
              <p className="text-2xl font-semibold text-blue-700">
                {stats.clases_semana || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Icon icon="lucide:percent" className="text-green-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-green-700">Total Alumnos</p>
              <p className="text-2xl font-semibold text-green-700">
                {stats.total_alumnos || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};