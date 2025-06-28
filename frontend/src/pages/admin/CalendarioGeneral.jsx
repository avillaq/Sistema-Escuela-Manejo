import { useState, useEffect } from 'react';
import {
  Card,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { CalendarioBase, PageHeader } from '@/components';
import { reservasService } from '@/service/apiService';

export const CalendarioGeneral = () => {
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    totalReservas: 0,
    reservasAtendidas: 0,
    alumnosHoy: 0
  });
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = useState(true);

  // Cargar estadísticas del día
  useEffect(() => {
    const cargarEstadisticasHoy = async () => {
      try {
        const result = await reservasService.getHoy();
        if (result.success) {
          const reservas = result.data;
          const totalReservas = reservas.length;
          const reservasAtendidas = reservas.filter(r => r.asistencia).length;
          const alumnosUnicos = new Set(reservas.map(r => r.matricula.alumno.id)).size;

          setEstadisticasHoy({
            totalReservas,
            reservasAtendidas,
            alumnosHoy: alumnosUnicos
          });
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        addToast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas del día.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoadingEstadisticas(false);
      }
    };

    cargarEstadisticasHoy();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario General"
        subtitle="Vista global de reservas y horarios disponibles."
        emoji=""
      />

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-500/20">
              <Icon icon="lucide:calendar-days" className="text-primary-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-primary-700">Reservas Hoy</p>
              <p className="text-2xl font-semibold text-primary-700">
                {isLoadingEstadisticas ? "..." : estadisticasHoy.totalReservas}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success-500/20">
              <Icon icon="lucide:check-circle" className="text-success-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-success-700">Atendidas</p>
              <p className="text-2xl font-semibold text-success-700">
                {isLoadingEstadisticas ? "..." : estadisticasHoy.reservasAtendidas}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-warning-500/20">
              <Icon icon="lucide:users" className="text-warning-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-warning-700">Alumnos Hoy</p>
              <p className="text-2xl font-semibold text-warning-700">
                {isLoadingEstadisticas ? "..." : estadisticasHoy.alumnosHoy}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendario - Solo vista, sin filtros */}
      <CalendarioBase
        modo="global"
        userId={null}
        matriculaId={null}
        horasRestantes={0}
      />
    </div>
  );
};