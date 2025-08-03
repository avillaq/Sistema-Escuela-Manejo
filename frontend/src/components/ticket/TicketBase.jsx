import { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  addToast,
  DatePicker,
  Chip,
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { TicketViewModal } from '@/components/ticket/TicketViewModal';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { parseDate } from '@internationalized/date';
import { ticketsService } from '@/service/apiService';

export const TicketBase = ({
  id_instructor = null,
  titulo = "Tickets de Clases",
  descripcion = "Registro de todas las clases completadas."
}) => {

  // Modal para ver ticket
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();

  // Estados de filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    page: 1,
    per_page: 20,
    busqueda: "",
    fecha_inicio: "",
    fecha_fin: "",
    ...(id_instructor && { id_instructor })
  });

  const [filtrosTemporales, setFiltrosTemporales] = useState({
    busqueda: "",
    fecha_inicio: "",
    fecha_fin: "",
    per_page: 20
  });

  // Estados principales
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticasLoaded, setEstadisticasLoaded] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fetchTickets = useCallback(async (filtrosParaUsar) => {
    setIsLoading(true);
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtrosParaUsar).filter(([_, value]) =>
          value !== null && value !== undefined && value !== ''
        )
      );

      const result = id_instructor
        ? await ticketsService.getByInstructor(id_instructor, filtrosLimpios)
        : await ticketsService.getAll(filtrosLimpios);

      if (result.success) {
        setTickets(result.data.tickets);
        setPagination(result.data.pagination);
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
      setIsSearching(false);
      setIsApplying(false);
    }
  }, [id_instructor]);

  const fetchEstadisticas = useCallback(async () => {
    if (estadisticasLoaded) return;

    try {
      const result = await ticketsService.getEstadisticas(id_instructor);
      if (result.success) {
        setEstadisticas(result.data);
        setEstadisticasLoaded(true);
      } else {
        addToast({
          title: "Error al cargar estadísticas",
          description: result.error || "No se pudieron cargar las estadísticas de tickets.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al cargar las estadísticas de tickets.",
        severity: "danger",
        color: "danger",
      });
    }
  }, [estadisticasLoaded, id_instructor]);

  // Cargar tickets
  useEffect(() => {
    fetchTickets(filtrosAplicados);
    fetchEstadisticas();
  }, []);

  const aplicarFiltros = () => {
    setIsApplying(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1,
      ...(id_instructor && { id_instructor })
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchTickets(nuevosFilterosAplicados);
  };

  const buscar = () => {
    setIsSearching(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1,
      ...(id_instructor && { id_instructor })
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchTickets(nuevosFilterosAplicados);
  };

  const limpiarTodo = () => {
    const filtrosLimpios = {
      busqueda: "",
      fecha_inicio: "",
      fecha_fin: "",
      per_page: 20
    };

    const filtrosAplicadosLimpios = {
      ...filtrosLimpios,
      page: 1,
      ...(id_instructor && { id_instructor })
    };

    setFiltrosTemporales(filtrosLimpios);
    setFiltrosAplicados(filtrosAplicadosLimpios);
    fetchTickets(filtrosAplicadosLimpios);
  };

  const handleInputChange = (key, value) => {
    setFiltrosTemporales(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const cambiarPagina = (nuevaPagina) => {
    const nuevosFiltros = { ...filtrosAplicados, page: nuevaPagina };
    setFiltrosAplicados(nuevosFiltros);
    fetchTickets(nuevosFiltros);
  };

  const hayCambiosPendientes =
    filtrosTemporales.busqueda !== filtrosAplicados.busqueda ||
    filtrosTemporales.fecha_inicio !== filtrosAplicados.fecha_inicio ||
    filtrosTemporales.fecha_fin !== filtrosAplicados.fecha_fin ||
    filtrosTemporales.per_page !== filtrosAplicados.per_page;

  const hayFiltrosActivos =
    filtrosAplicados.busqueda !== "" ||
    filtrosAplicados.fecha_inicio !== "" ||
    filtrosAplicados.fecha_fin !== "";

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

  const stringToCalendarDate = (dateString) => {
    if (!dateString) return null;
    try {
      return parseDate(dateString);
    } catch (error) {
      return null;
    }
  };

  const calendarDateToString = (date) => {
    if (!date) return '';
    return date.toString();
  };

  // Handle ver ticket
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    onViewOpen();
  };

  // Columnas de la tabla segun el usuario
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
        <div className="flex gap-2 justify-start">
          <Tooltip content="Ver">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleViewTicket(ticket)}
            >
              <Icon icon="lucide:eye" width={16} height={16} />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={titulo}
        subtitle={descripcion}
        emoji=""
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="lucide:ticket"
          title="Total Tickets"
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:calendar-check"
          title="Tickets Hoy"
          value={estadisticas.hoy || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:trending-up"
          title="Ultima Semana"
          value={estadisticas.semana || 0}
          color="warning"
          size="large"
        />
      </div>

      {/* Tabla de tickets */}
      <Card>
        <CardBody>
          <div className="space-y-4 mb-6">
            <SearchBar
              value={filtrosTemporales.busqueda}
              onChange={(value) => handleInputChange('busqueda', value)}
              onSearch={buscar}
              isSearching={isSearching}
              placeholder={id_instructor
                ? "Buscar por alumno o número de ticket..."
                : "Buscar por alumno, instructor o número de ticket..."
              }
            />
            {/* Filtros específicos */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-4 w-full md:w-2/3">
                <DatePicker
                  label="Fecha Inicio"
                  value={stringToCalendarDate(filtrosTemporales.fecha_inicio)}
                  onChange={(date) => handleInputChange('fecha_inicio', calendarDateToString(date))}
                  className="flex-1"
                  showMonthAndYearPickers
                />

                <DatePicker
                  label="Fecha Fin"
                  value={stringToCalendarDate(filtrosTemporales.fecha_fin)}
                  onChange={(date) => handleInputChange('fecha_fin', calendarDateToString(date))}
                  className="flex-1"
                  showMonthAndYearPickers
                />
              </div>

              <Select
                label="Registros por página"
                placeholder="20"
                selectedKeys={[filtrosTemporales.per_page.toString()]}
                className="w-full md:w-1/6"
                onChange={(e) => handleInputChange('per_page', parseInt(e.target.value))}
              >
                <SelectItem key="10" value="10">10</SelectItem>
                <SelectItem key="20" value="20">20</SelectItem>
                <SelectItem key="50" value="50">50</SelectItem>
                <SelectItem key="100" value="100">100</SelectItem>
              </Select>

              {/* Botones de control */}
              <div className="flex gap-2 w-full md:w-1/6">
                <Button
                  color="primary"
                  variant="solid"
                  onPress={aplicarFiltros}
                  isLoading={isApplying}
                  startContent={!isApplying && <Icon icon="lucide:filter" width={16} height={16} />}
                  className="flex-1"
                  isDisabled={!hayCambiosPendientes}
                >
                  {isApplying ? "Aplicando..." : "Aplicar"}
                </Button>

                <Button
                  color="secondary"
                  variant="flat"
                  onPress={limpiarTodo}
                  startContent={<Icon icon="lucide:x" width={16} height={16} />}
                  className="flex-1"
                  isDisabled={!hayFiltrosActivos}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Indicadores de estado */}
            <div className="flex flex-wrap gap-2 items-center">
              {hayFiltrosActivos && (
                <div className="flex items-center gap-2">
                  {filtrosAplicados.busqueda && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Búsqueda: "{filtrosAplicados.busqueda}"
                    </Chip>
                  )}
                  {filtrosAplicados.fecha_inicio && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Desde: {filtrosAplicados.fecha_inicio}
                    </Chip>
                  )}
                  {filtrosAplicados.fecha_fin && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Hasta: {filtrosAplicados.fecha_fin}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>

          <Tabla
            title="Tickets de Clases"
            columns={columns}
            data={tickets}
            rowKey="id"
            showPagination={false}
            isloading={isLoading}
            loadingContent={<LoadingSpinner />}
            customPagination={{
              page: pagination.page,
              total: pagination.pages,
              onChange: cambiarPagina,
              show: pagination.pages > 1
            }}
          />
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