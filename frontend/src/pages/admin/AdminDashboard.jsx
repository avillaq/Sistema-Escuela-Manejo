import { useState, useEffect, useMemo, useCallback } from 'react';
import { Divider, Chip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import { reportesService } from '@/service/apiService';
import { useAuthStore } from '@/store/auth-store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AreaChartCard } from '@/components/dashboard/area-chart';
import { BarChartCard } from '@/components/dashboard/bar-chart';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configuración de acciones rapidas
  const quickActions = useMemo(() => [
    {
      icon: "lucide:users",
      label: "Alumnos",
      color: "primary",
      onPress: () => navigate('/alumnos')
    },
    {
      icon: "lucide:file-text",
      label: "Matrículas",
      color: "success",
      onPress: () => navigate('/matriculas')
    },
    {
      icon: "lucide:calendar-check",
      label: "Asistencias",
      color: "warning",
      onPress: () => navigate('/asistencias')
    },
    {
      icon: "lucide:calendar",
      label: "Calendario",
      color: "secondary",
      onPress: () => navigate('/calendario')
    },
    {
      icon: "lucide:user-check",
      label: "Instructores",
      color: "danger",
      onPress: () => navigate('/instructores')
    },
    {
      icon: "lucide:car",
      label: "Autos",
      color: "default",
      onPress: () => navigate('/autos')
    }
  ], [navigate]);

  const cargarDatos = useCallback(async () => {
    try {
      const dashboardResult = await reportesService.getDashboardAdmin();

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
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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
    return <LoadingSpinner mensaje="Cargando dashboard..." />;
  }

  const stats = dashboardData?.estadisticas_generales || {};
  console.log(stats)

  return (
    <div className="space-y-6">
      <PageHeader
        title="¡Bienvenido,"
        userName={user?.nombre || 'Administrador'}
        subtitle="Aquí tienes el resumen general de la escuela de manejo."
      />

      {/* Estadísticas principales */}
      <div className="space-y-6">
        {/* Indicadores Principales */}
        <div>
          <SectionHeader
            icon="lucide:trending-up"
            title="Indicadores Principales"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              icon="lucide:users"
              title="Alumnos Activos"
              value={stats.alumnos_activos || 0}
              subtitle="con matrícula vigente"
              color="primary"
              size="large"
            />
            <StatCard
              icon="lucide:dollar-sign"
              title="Ingresos Mensuales"
              value={`S/ ${(stats.ingresos_mes || 0).toFixed(2)}`}
              subtitle="este mes"
              color="warning"
              size="large"
            />
          </div>
        </div>

        {/* Recursos Disponibles */}
        <div>
          <SectionHeader
            icon="lucide:settings"
            title="Recursos Disponibles"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon="lucide:user-check"
              title="Instructores Activos"
              value={stats.instructores_activos || 0}
              subtitle="disponibles"
              color="purple"
              size="large"
            />
            <StatCard
              icon="lucide:car"
              title="Autos Disponibles"
              value={stats.autos_activos || 0}
              subtitle="en servicio"
              color="orange"
              size="large"
            />
            <StatCard
              icon="lucide:users-round"
              title="Total Alumnos"
              value={stats.total_alumnos || 0}
              subtitle="registrados"
              color="green"
              size="large"
            />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div>
        <SectionHeader
          icon="lucide:bar-chart-3"
          title="Análisis de Tendencias"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChartCard
            title="Ingresos Mensuales (Últimos 6 meses)"
            data={chartData.ingresos}
            dataKey="ingresos"
            color="primary"
            xAxisKey="name"
          />
          <BarChartCard
            title="Nuevas Matrículas (Últimos 6 meses)"
            data={chartData.matriculas}
            dataKey="cantidad"
            color="success"
            xAxisKey="name"
          />
        </div>
      </div>

      {/* Actividad y alertas */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad de hoy */}
          <ActivityCard
            title="Clases de Hoy"
            headerIcon="lucide:calendar-check"
            actionLabel="Ver Todas"
            actionIcon="lucide:external-link"
            onAction={() => navigate('/asistencias')}
          >
            {dashboardData?.actividad_hoy?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.actividad_hoy.slice(0, 5).map((clase, index) => {
                  const estado = clase.asistio === true ? 'completada' :
                    clase.asistio === false ? 'falta' : 'pendiente';
                  const color = estado === 'completada' ? 'success' :
                    estado === 'falta' ? 'danger' : 'warning';

                  return (
                    <ActivityItem
                      key={index}
                      title={clase.alumno}
                      subtitle={clase.horario}
                      isHighlighted={estado !== 'pendiente'}
                      color={color}
                      rightContent={
                        <Chip
                          size="sm"
                          color={color}
                          variant="flat"
                        >
                          {estado === 'completada' ? 'Asistió' :
                            estado === 'falta' ? 'Faltó' : 'Pendiente'}
                        </Chip>
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="lucide:calendar-x"
                title="No hay clases programadas desde ahora"
              />
            )}
          </ActivityCard>

          {/* Clases de mañana */}
          <ActivityCard
            title="Mañana"
            headerIcon="lucide:calendar"
          >
            {dashboardData?.actividad_manana?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.actividad_manana.slice(0, 5).map((clase, index) => (
                  <ActivityItem
                    key={index}
                    title={clase.alumno}
                    subtitle={clase.horario}
                    rightContent={
                      <Icon icon="lucide:clock" className="text-default-400" width={16} height={16} />
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="lucide:calendar-check"
                title="No hay clases programadas para mañana"
              />
            )}
          </ActivityCard>

          {/* Alertas */}
          <ActivityCard
            title="Alertas"
            headerIcon="lucide:alert-triangle"
          >
            <div className="space-y-4">
              {/* Matrículas por vencer */}
              {dashboardData?.alertas?.matriculas_por_vencer?.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Icon icon="lucide:calendar-clock" width={14} height={14} />
                    Matrículas por Vencer
                  </h4>
                  <div className="space-y-2">
                    {dashboardData.alertas.matriculas_por_vencer.slice(0, 3).map((item, index) => (
                      <ActivityItem
                        key={index}
                        title={item.alumno}
                        subtitle={`Vence: ${item.vence} (${item.dias_restantes} días)`}
                        color="warning"
                        isHighlighted
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Separador solo si hay ambos tipos de alertas */}
              {dashboardData?.alertas?.matriculas_por_vencer?.length > 0 &&
                dashboardData?.alertas?.pagos_pendientes?.length > 0 && <Divider />}

              {/* Pagos pendientes */}
              {dashboardData?.alertas?.pagos_pendientes?.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Icon icon="lucide:credit-card" width={14} height={14} />
                    Pagos Pendientes
                  </h4>
                  <div className="space-y-2">
                    {dashboardData.alertas.pagos_pendientes.slice(0, 3).map((item, index) => (
                      <ActivityItem
                        key={index}
                        title={item.alumno}
                        subtitle={`Saldo: S/ ${item.saldo.toFixed(2)}`}
                        color="danger"
                        isHighlighted
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Si no hay alertas */}
              {(!dashboardData?.alertas?.matriculas_por_vencer?.length &&
                !dashboardData?.alertas?.pagos_pendientes?.length) && (
                  <EmptyState
                    icon="lucide:check-circle"
                    title="¡Todo está al día!"
                    description="No hay alertas pendientes"
                  />
                )}
            </div>
          </ActivityCard>
        </div>
      </div>

      {/* Acciones rápidas */}
      <QuickActions actions={quickActions} />
    </div>
  );
};