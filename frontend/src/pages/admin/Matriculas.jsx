import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardBody,
  Chip,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  addToast,
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MatriculaDeleteModal } from '@/pages/admin/MatriculaDeleteModal';
import { matriculasService } from '@/service/apiService';

export const Matriculas = () => {
  const navigate = useNavigate();

  // Modal para eliminar
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  //Estados de filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    page: 1,
    per_page: 20,
    busqueda: "",
    estado_clases: "todos",
    estado_pago: "todos",
    tipo_contratacion: "todos"
  });

  const [filtrosTemporales, setFiltrosTemporales] = useState({
    busqueda: "",
    estado_clases: "todos",
    estado_pago: "todos",
    tipo_contratacion: "todos",
    per_page: 20
  });

  // Estados principales
  const [matriculasData, setMatriculasData] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticasLoaded, setEstadisticasLoaded] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fetchMatriculas = useCallback(async (filtrosParaUsar) => {
    setIsLoading(true);
    try {
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtrosParaUsar).filter(([_, value]) =>
          value !== null && value !== undefined && value !== '' && value !== 'todos'
        )
      );

      const result = await matriculasService.getAll(filtrosLimpios);
      if (result.success) {
        setMatriculasData(result.data.matriculas);
        setPagination(result.data.pagination);
      } else {
        addToast({
          title: "Error al cargar  las matrículas",
          description: result.error || "No se pudieron cargar las matrículas.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al cargar las matriculas.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsApplying(false);
    }
  }, []);

  const fetchEstadisticas = useCallback(async () => {
    if (estadisticasLoaded) return;

    try {
      const result = await matriculasService.getEstadisticas();
      if (result.success) {
        setEstadisticas(result.data);
        setEstadisticasLoaded(true);
      } else {
        addToast({
          title: "Error al cargar estadísticas",
          description: result.error || "No se pudieron cargar las estadísticas de matrículas.",
          severity: "danger",
          color: "danger",
        });
      }

    } catch (error) {
      console.error("Error al calcular estadísticas:", error);
    }
  }, [estadisticasLoaded]);

  useEffect(() => {
    fetchMatriculas(filtrosAplicados);
    fetchEstadisticas();
  }, []);

  const aplicarFiltros = () => {
    setIsApplying(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchMatriculas(nuevosFilterosAplicados);
  };

  const buscar = () => {
    setIsSearching(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchMatriculas(nuevosFilterosAplicados);
  };

  const limpiarTodo = () => {
    const filtrosLimpios = {
      busqueda: "",
      estado_clases: "todos",
      estado_pago: "todos",
      tipo_contratacion: "todos",
      per_page: 20
    };

    const filtrosAplicadosLimpios = {
      ...filtrosLimpios,
      page: 1
    };

    setFiltrosTemporales(filtrosLimpios);
    setFiltrosAplicados(filtrosAplicadosLimpios);
    fetchMatriculas(filtrosAplicadosLimpios);
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
    fetchMatriculas(nuevosFiltros);
  };

  const hayCambiosPendientes =
    filtrosTemporales.busqueda !== filtrosAplicados.busqueda ||
    filtrosTemporales.estado_clases !== filtrosAplicados.estado_clases ||
    filtrosTemporales.estado_pago !== filtrosAplicados.estado_pago ||
    filtrosTemporales.tipo_contratacion !== filtrosAplicados.tipo_contratacion ||
    filtrosTemporales.per_page !== filtrosAplicados.per_page;

  const hayFiltrosActivos =
    filtrosAplicados.busqueda !== "" ||
    filtrosAplicados.estado_clases !== "todos" ||
    filtrosAplicados.estado_pago !== "todos" ||
    filtrosAplicados.tipo_contratacion !== "todos";

  // Handle eliminar matrícula
  const handleDeleteMatricula = async (matriculaId) => {
    if (matriculaId) {
      const result = await matriculasService.delete(matriculaId);
      if (result.success) {
        const deletedMatricula = matriculasData.find(matricula => matricula.id === matriculaId);

        fetchMatriculas(filtrosAplicados);
        setEstadisticasLoaded(false);
        fetchEstadisticas();

        addToast({
          title: "Matrícula eliminada",
          description: `La matrícula de ${deletedMatricula?.alumno.nombre} ${deletedMatricula?.alumno.apellidos} ha sido eliminada.`,
          severity: "danger",
          color: "success",
        });
      } else {
        addToast({
          title: "Error al eliminar matrícula",
          description: result.error || "No se pudo eliminar la matrícula.",
          severity: "danger",
          color: "danger",
        });
        return;
      }
    } else {
      addToast({
        title: "Error",
        description: "ID de matrícula no válido.",
        severity: "danger",
        color: "danger",
      });
      return;
    }
  };

  // Handle modales
  const handleDeleteConfirm = (matricula) => {
    setSelectedMatricula(matricula);
    onDeleteOpen();
  };

  // obtener color del estado de clases
  const getEstadoClasesColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_progreso': return 'primary';
      case 'completado': return 'success';
      case 'vencido': return 'danger';
      default: return 'default';
    }
  };

  // obtener color del estado de pago
  const getEstadoPagoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'danger';
      case 'completo': return 'success';
      default: return 'default';
    }
  };

  // calcular progreso
  const getProgreso = (horas_completadas, horas_total) => {
    if (!horas_total) return 0;
    return Math.round((horas_completadas / horas_total) * 100);
  };

  const columns = [
    {
      key: "alumno",
      label: "ALUMNO",
      render: (matricula) => (
        <div>
          <p className="font-medium">{matricula.alumno.nombre} {matricula.alumno.apellidos}</p>
          <p className="text-xs text-default-500">DNI: {matricula.alumno.dni}</p>
          <Chip size="sm" variant="flat" color="primary" className="mt-1">
            {matricula.categoria}
          </Chip>
        </div>
      )
    },
    {
      key: "contratacion",
      label: "CONTRATACIÓN",
      render: (matricula) => (
        <div>
          <p className="font-medium capitalize">{matricula.tipo_contratacion.replace('_', ' ')}</p>
          {matricula.tipo_contratacion === 'paquete' ? (
            <p className="text-xs text-default-500">
              {matricula.paquete.nombre} - {matricula.paquete.tipo_auto.tipo}
            </p>
          ) : (
            <p className="text-xs text-default-500">
              {matricula.horas_contratadas}h × S/ {matricula.tarifa_por_hora}
            </p>
          )}
        </div>
      )
    },
    {
      key: "progreso",
      label: "PROGRESO",
      render: (matricula) => {
        const horas_total = matricula.tipo_contratacion === 'paquete'
          ? matricula.paquete.horas_total
          : matricula.horas_contratadas;
        const progreso = getProgreso(matricula.horas_completadas, horas_total);

        return (
          <div>
            <p className="text-sm font-medium">{matricula.horas_completadas}/{horas_total} horas</p>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-default-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>
              <span className="text-xs text-default-500">{progreso}%</span>
            </div>
          </div>
        );
      }
    },
    {
      key: "estado_clases",
      label: "ESTADO CLASES",
      render: (matricula) => (
        <Chip
          color={getEstadoClasesColor(matricula.estado_clases)}
          size="sm"
          variant="flat"
        >
          {matricula.estado_clases.charAt(0).toUpperCase() + matricula.estado_clases.slice(1).replace('_', ' ')}
        </Chip>
      )
    },
    {
      key: "estado_pago",
      label: "ESTADO PAGO",
      render: (matricula) => (
        <div>
          <Chip
            color={getEstadoPagoColor(matricula.estado_pago)}
            size="sm"
            variant="flat"
            className="mb-1"
          >
            {matricula.estado_pago.charAt(0).toUpperCase() + matricula.estado_pago.slice(1)}
          </Chip>
          <div>
            <p className="text-xs text-success-600">Pagado: S/ {matricula.pagos_realizados.toFixed(2)}</p>
            {matricula.saldo_pendiente > 0 && (
              <p className="text-xs text-danger-500">Debe: S/ {matricula.saldo_pendiente.toFixed(2)}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: "fecha_matricula",
      label: "FECHA MATRÍCULA",
      render: (matricula) => {
        const date = new Date(matricula.fecha_matricula);
        return date.toLocaleDateString();
      }
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (matricula) => (
        <div className="flex gap-2 justify-start">
          <Tooltip content="Ver Detalles">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => navigate(`/matriculas/${matricula.id}`)}
            >
              <Icon icon="lucide:eye" width={16} height={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Ver Reservas">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => navigate(`/matriculas/${matricula.id}/reservas`)}
            >
              <Icon icon="lucide:calendar" width={16} height={16} />
            </Button>
          </Tooltip>
          {/* <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDeleteConfirm(matricula)}
          >
            <Icon icon="lucide:trash" width={16} height={16} />
          </Button> */}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Matrículas"
          subtitle="Gestión de matrículas y seguimiento académico."
          emoji=""
        />
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" width={16} height={16} />}
          onPress={() => navigate('/matriculas/nueva')}
        >
          Nueva Matrícula
        </Button>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon="lucide:graduation-cap"
          title="Total Matrículas"
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:clock"
          title="En Progreso"
          value={estadisticas.enProgreso || 0}
          color="warning"
          size="large"
        />
        <StatCard
          icon="lucide:check-circle"
          title="Completadas"
          value={estadisticas.completadas || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:dollar-sign"
          title="Ingresos Totales"
          value={`S/ ${(estadisticas.ingresos_totales || 0).toFixed(2)}`}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:alert-triangle"
          title="Saldos Pendientes"
          value={`S/ ${(estadisticas.saldo_pendiente_total || 0).toFixed(2)}`}
          color="danger"
          size="large"
        />
      </div>

      {/* Tabla de matriculas */}
      <Card>
        <CardBody>
          <div className="space-y-4 mb-6">
            <SearchBar
              value={filtrosTemporales.busqueda}
              onChange={(value) => handleInputChange('busqueda', value)}
              onSearch={buscar}
              isSearching={isSearching}
              placeholder="Buscar por nombre o DNI..."
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                label="Estado Clases"
                placeholder="Todos"
                selectedKeys={[filtrosTemporales.estado_clases]}
                className="w-full md:w-1/5"
                onChange={(e) => handleInputChange('estado_clases', e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="pendiente" value="pendiente">Pendiente</SelectItem>
                <SelectItem key="en_progreso" value="en_progreso">En Progreso</SelectItem>
                <SelectItem key="completado" value="completado">Completado</SelectItem>
                <SelectItem key="vencido" value="vencido">Vencido</SelectItem>
              </Select>

              <Select
                label="Estado Pago"
                placeholder="Todos"
                selectedKeys={[filtrosTemporales.estado_pago]}
                className="w-full md:w-1/5"
                onChange={(e) => handleInputChange('estado_pago', e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="pendiente" value="pendiente">Pendiente</SelectItem>
                <SelectItem key="completo" value="completo">Completo</SelectItem>
              </Select>

              <Select
                label="Tipo Contratación"
                placeholder="Todos"
                selectedKeys={[filtrosTemporales.tipo_contratacion]}
                className="w-full md:w-1/5"
                onChange={(e) => handleInputChange('tipo_contratacion', e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="paquete" value="paquete">Paquete</SelectItem>
                <SelectItem key="por_hora" value="por_hora">Por Hora</SelectItem>
              </Select>
              <Select
                label="Registros por página"
                placeholder="20"
                selectedKeys={[filtrosTemporales.per_page.toString()]}
                className="w-full md:w-1/5"
                onChange={(e) => handleInputChange('per_page', parseInt(e.target.value))}
              >
                <SelectItem key="10" value="10">10</SelectItem>
                <SelectItem key="20" value="20">20</SelectItem>
                <SelectItem key="50" value="50">50</SelectItem>
                <SelectItem key="100" value="100">100</SelectItem>
              </Select>

              {/* Botones de control */}
              <div className="flex gap-2 w-full md:w-1/5">
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
                  {filtrosAplicados.estado_clases !== "todos" && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Estado clases: {filtrosAplicados.estado_clases}
                    </Chip>
                  )}
                  {filtrosAplicados.estado_pago !== "todos" && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Estado pago: {filtrosAplicados.estado_pago}
                    </Chip>
                  )}
                  {filtrosAplicados.tipo_contratacion !== "todos" && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Tipo: {filtrosAplicados.tipo_contratacion === "por_hora" ? "Por hora" : "Paquete"}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>

          <Tabla
            title="Lista de Matrículas"
            columns={columns}
            data={matriculasData}
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

      {/* Modal eliminar matricula */}
      {/* {selectedMatricula && (
        <MatriculaDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          matricula={selectedMatricula}
          onConfirmDelete={handleDeleteMatricula}
        />
      )} */}
    </div>
  );
};