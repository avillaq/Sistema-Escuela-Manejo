import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardBody,
  Chip,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MatriculaDeleteModal } from '@/pages/admin/MatriculaDeleteModal';
import { matriculasService } from '@/service/apiService';

export const Matriculas = () => {
  const navigate = useNavigate();

  // Modal para eliminar
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Estados para filtros
  const [selectedEstadoClases, setSelectedEstadoClases] = useState("todos");
  const [selectedEstadoPago, setSelectedEstadoPago] = useState("todos");
  const [selectedTipoContratacion, setSelectedTipoContratacion] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [matriculasData, setMatriculasData] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchMatriculas = async () => {
      try {
        const result = await matriculasService.getAll();
        if (result.success) {
          setMatriculasData(result.data);
          console.log("Matriculas cargadas:", result.data);

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
      }
    }
    fetchMatriculas();
  }, []);


  // Filtrar matriculas
  const filteredMatriculas = useMemo(() => {
    return matriculasData.filter(matricula => {
      // Filtro por estado de clases
      if (selectedEstadoClases !== "todos" && matricula.estado_clases !== selectedEstadoClases) {
        return false;
      }

      // Filtro por estado de pago
      if (selectedEstadoPago !== "todos" && matricula.estado_pago !== selectedEstadoPago) {
        return false;
      }

      // Filtro por tipo de contratación
      if (selectedTipoContratacion !== "todos" && matricula.tipo_contratacion !== selectedTipoContratacion) {
        return false;
      }

      // Filtro por busqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          matricula.alumno.nombre.toLowerCase().includes(query) ||
          matricula.alumno.apellidos.toLowerCase().includes(query) ||
          matricula.alumno.dni.toLowerCase().includes(query) ||
          (matricula.paquete && matricula.paquete.nombre.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [selectedEstadoClases, selectedEstadoPago, selectedTipoContratacion, searchQuery, matriculasData]);

  // Estadisticas
  const estadisticas = useMemo(() => {
    const total = matriculasData.length;
    const pendientes = matriculasData.filter(m => m.estado_clases === 'pendiente').length;
    const enProgreso = matriculasData.filter(m => m.estado_clases === 'en_progreso').length;
    const completadas = matriculasData.filter(m => m.estado_clases === 'completado').length;
    const ingresosTotales = matriculasData.reduce((sum, m) => sum + m.pagos_realizados, 0);
    const saldosPendientes = matriculasData.reduce((sum, m) => sum + m.saldo_pendiente, 0);

    return { total, pendientes, enProgreso, completadas, ingresosTotales, saldosPendientes };
  }, [matriculasData]);

  // Handle eliminar matrícula
  const handleDeleteMatricula = async (matriculaId) => {
    if (matriculaId) {
      const result = await matriculasService.delete(matriculaId);
      if (result.success) {
        const updatedMatriculas = matriculasData.filter(matricula => matricula.id !== matriculaId);
        const deletedMatricula = matriculasData.find(matricula => matricula.id === matriculaId);

        setMatriculasData(updatedMatriculas);

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
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => navigate(`/matriculas/${matricula.id}`)}
          >
            <Icon icon="lucide:eye" width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => navigate(`/matriculas/${matricula.id}/reservas`)}
          >
            <Icon icon="lucide:calendar" width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDeleteConfirm(matricula)}
          >
            <Icon icon="lucide:trash" width={16} height={16} />
          </Button>
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
          value={isLoading ? "..." : estadisticas.total}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:clock"
          title="En Progreso"
          value={isLoading ? "..." : estadisticas.enProgreso}
          color="warning"
          size="large"
        />
        <StatCard
          icon="lucide:check-circle"
          title="Completadas"
          value={isLoading ? "..." : estadisticas.completadas}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:dollar-sign"
          title="Ingresos Totales"
          value={isLoading ? "..." : `S/ ${estadisticas.ingresosTotales.toFixed(2)}`}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:alert-triangle"
          title="Saldos Pendientes"
          value= {isLoading ? "..." : `S/ ${estadisticas.saldosPendientes.toFixed(2)}`}
          color="danger"
          size="large"
        />
      </div>

      {/* Tabla de matriculas */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar matrícula..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="w-full md:w-1/4"
            />
            <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-3/4">
              <Select
                label="Estado Clases"
                placeholder="Todos"
                selectedKeys={[selectedEstadoClases]}
                className="w-full md:w-1/3"
                onChange={(e) => setSelectedEstadoClases(e.target.value)}
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
                selectedKeys={[selectedEstadoPago]}
                className="w-full md:w-1/3"
                onChange={(e) => setSelectedEstadoPago(e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="pendiente" value="pendiente">Pendiente</SelectItem>
                <SelectItem key="completo" value="completo">Completo</SelectItem>
              </Select>

              <Select
                label="Tipo"
                placeholder="Todos"
                selectedKeys={[selectedTipoContratacion]}
                className="w-full md:w-1/3"
                onChange={(e) => setSelectedTipoContratacion(e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="paquete" value="paquete">Paquete</SelectItem>
                <SelectItem key="por_hora" value="por_hora">Por Hora</SelectItem>
              </Select>
            </div>
          </div>

          {isLoading ?
            (<LoadingSpinner mensaje="Cargando matriculas..." />)
            :
            <Tabla
              title="Lista de Matrículas"
              columns={columns}
              data={filteredMatriculas}
              rowKey="id"
            />
          }

        </CardBody>
      </Card>

      {/* Modal eliminar matricula */}
      {selectedMatricula && (
        <MatriculaDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          matricula={selectedMatricula}
          onConfirmDelete={handleDeleteMatricula}
        />
      )}
    </div>
  );
};