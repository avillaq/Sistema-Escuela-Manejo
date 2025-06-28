import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  useDisclosure,
  Input,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla, TicketViewModal } from '@/components';
import { ticketsService } from '@/service/apiService';

export const TicketBase = ({ 
  id_instructor = null, 
  titulo = "Tickets de Clases",
  descripcion = "Registro de todas las clases completadas con éxito."
}) => {
  // Estados principales
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal para ver ticket
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  // Cargar tickets al montar el componente
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const result = id_instructor ? await ticketsService.getByInstructor(id_instructor) : await ticketsService.getAll();
        if (result.success) {
          setTickets(result.data);
          console.log("Tickets cargados:", result.data);
        } else {
          addToast({
            title: "Error al cargar tickets",
            description: result.error || "No se pudieron cargar los tickets.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar los tickets.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filtrar tickets por búsqueda
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;

    const query = searchQuery.toLowerCase();
    return tickets.filter(ticket =>
      ticket.nombre_alumno?.toLowerCase().includes(query) ||
      (!id_instructor && ticket.nombre_instructor?.toLowerCase().includes(query)) ||
      ticket.id.toString().includes(query)
    );
  }, [tickets, searchQuery, id_instructor]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = tickets.length;
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    const ticketsHoy = tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_asistencia);
      return fechaTicket >= inicioHoy;
    }).length;

    const ultimaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ticketsUltimaSemana = tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_asistencia);
      return fechaTicket >= ultimaSemana;
    }).length;

    return { total, hoy: ticketsHoy, ultimaSemana: ticketsUltimaSemana };
  }, [tickets]);

  // Formatear fecha y hora
  const formatearFechaHora = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString + (fechaString.includes('GMT') ? '' : ' GMT'));
    return fecha.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'GMT'
    });
  };

  // Handle ver ticket
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    onViewOpen();
  };

  // Columnas de la tabla (adaptadas según el usuario)
  const columns = [
    {
      key: "id",
      label: "TICKET #",
      render: (ticket) => (
        <div className="font-mono font-semibold text-primary-600">
          #{ticket.id}
        </div>
      )
    },
    {
      key: "alumno",
      label: "ALUMNO",
      render: (ticket) => (
        <div>
          <p className="font-medium">{ticket.nombre_alumno}</p>
          <p className="text-xs text-default-500">
            Clase #{ticket.numero_clase_alumno}
          </p>
        </div>
      )
    },
    // Solo mostrar instructor si no es un instructor viendo sus propios tickets
    ...(!id_instructor ? [{
      key: "instructor",
      label: "INSTRUCTOR",
      render: (ticket) => (
        <p className="font-medium">{ticket.nombre_instructor}</p>
      )
    }] : []),
    {
      key: "fecha_asistencia",
      label: "FECHA/HORA",
      render: (ticket) => (
        <div>
          <p className="font-medium">{formatearFechaHora(ticket.fecha_asistencia)}</p>
        </div>
      )
    },
    {
      key: "auto",
      label: "VEHÍCULO",
      render: (ticket) => (
        <div>
          {ticket.placa_auto ? (
            <>
              <p className="font-medium">{ticket.placa_auto}</p>
              <p className="text-xs text-default-500">
                {ticket.marca_auto} {ticket.modelo_auto}
              </p>
            </>
          ) : (
            <p className="text-xs text-default-400">No asignado</p>
          )}
        </div>
      )
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (ticket) => (
        <div className="flex gap-2 justify-end">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleViewTicket(ticket)}
          >
            <Icon icon="lucide:eye" width={16} height={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="text-default-500">{descripcion}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-500/20">
              <Icon icon="lucide:ticket" className="text-primary-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-primary-700">Total Tickets</p>
              <p className="text-2xl font-semibold text-primary-700">
                {isLoading ? "..." : estadisticas.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success-500/20">
              <Icon icon="lucide:calendar-check" className="text-success-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-success-700">Hoy</p>
              <p className="text-2xl font-semibold text-success-700">
                {isLoading ? "..." : estadisticas.hoy}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-warning-500/20">
              <Icon icon="lucide:trending-up" className="text-warning-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-warning-700">Última Semana</p>
              <p className="text-2xl font-semibold text-warning-700">
                {isLoading ? "..." : estadisticas.ultimaSemana}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de tickets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Lista de Tickets</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder={id_instructor 
                ? "Buscar por alumno o número de ticket..." 
                : "Buscar por alumno, instructor o número de ticket..."
              }
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="w-full"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-64">
              <div className="text-center">
                <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
                <p>Cargando tickets...</p>
              </div>
            </div>
          ) : (
            <Tabla
              title="Tickets de Clases"
              columns={columns}
              data={filteredTickets}
              rowKey="id"
            />
          )}
        </CardBody>
      </Card>

      {/* Modal ver ticket */}
      {selectedTicket && (
        <TicketViewModal
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};