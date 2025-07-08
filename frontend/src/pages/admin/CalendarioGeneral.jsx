import { useState, useEffect } from 'react';
import {
  addToast
} from '@heroui/react';
import { CalendarioBase } from '@/components/calendario/CalendarioBase';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { reservasService } from '@/service/apiService';

export const CalendarioGeneral = () => {
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    totalReservas: 0,
    reservasAtendidas: 0,
    alumnosHoy: 0
  });

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
        <StatCard
          icon="lucide:calendar-days"
          title="Reservas Hoy"
          value={estadisticasHoy.totalReservas || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:check-circle"
          title="Atendidas"
          value={estadisticasHoy.reservasAtendidas || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:users"
          title="Alumnos Hoy"
          value={estadisticasHoy.alumnosHoy || 0}
          color="warning"
          size="large"
        />
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