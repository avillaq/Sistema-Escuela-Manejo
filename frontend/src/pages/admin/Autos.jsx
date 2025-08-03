// Autos.jsx
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  addToast,
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AutoFormModal } from '@/pages/admin/AutoFormModal';
import { AutoViewModal } from '@/pages/admin/AutoViewModal';
import { AutoDeleteModal } from '@/pages/admin/AutoDeleteModal';
import { autosService } from '@/service/apiService';

export const Autos = () => {
  const tipo = "Auto";

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Modales para ver, editar y eliminar autos
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Estados para filtrar autos
  const [selectedEstado, setSelectedEstado] = useState("activo");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoData, setAutoData] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar autos al montar el componente
  useEffect(() => {
    const fetchAutos = async () => {
      try {
        const result = await autosService.getAll();
        if (result.success) {
          setAutoData(result.data);
        } else {
          addToast({
            title: "Error al cargar autos",
            description: result.error || "No se pudieron cargar los autos.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los autos.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchAutos();
  }, []);

  // Filtrar autos según estado y búsqueda
  const filteredAutos = useMemo(() => {
    return autoData.filter(auto => {
      // por estado
      if (selectedEstado === "activo" && !auto.activo) {
        return false;
      }
      if (selectedEstado === "inactivo" && auto.activo) {
        return false;
      }

      // por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          auto.placa.toLowerCase().includes(query) ||
          auto.marca.toLowerCase().includes(query) ||
          auto.modelo.toLowerCase().includes(query) ||
          auto.color.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [selectedEstado, searchQuery, autoData]);

  const estadisticas = useMemo(() => {
    const total = autoData.length;
    const activos = autoData.filter(auto => auto.activo).length;
    const inactivos = autoData.filter(auto => !auto.activo).length;

    return { total, activos, inactivos };
  }, [autoData]);

  // Handle añadir auto
  const handleAddAuto = (newAuto) => {
    const id = autoData.length > 0 ? Math.max(...autoData.map(a => a.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];

    const auto = {
      ...newAuto,
      id,
      fecha_creado: today,
    };

    setAutoData([...autoData, auto]);

    addToast({
      title: `${tipo} añadido`,
      description: `Auto con placa ${auto.placa} ha sido añadido correctamente.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle editar auto
  const handleUpdateAuto = (updatedAuto) => {
    const updatedAutos = autoData.map(auto =>
      auto.id === updatedAuto.id ? updatedAuto : auto
    );

    setAutoData(updatedAutos);

    addToast({
      title: `${tipo} actualizado`,
      description: `Los datos del auto con placa ${updatedAuto.placa} han sido actualizados.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle eliminar auto
  const handleDeleteAuto = (autoId) => {
    const deletedAuto = autoData.find(auto => auto.id === autoId);
    if (!deletedAuto) return;
    const updatedAutos = autoData.map(auto =>
      auto.id === autoId ? { ...auto, activo: false } : auto
    );

    setAutoData(updatedAutos);

    addToast({
      title: `${tipo} eliminado`,
      description: `Auto con placa ${deletedAuto?.placa} ha sido eliminado correctamente.`,
      severity: "danger",
      color: "success",
    });
  };

  // Handle modal ver
  const handleViewAuto = (auto) => {
    setSelectedAuto(auto);
    onViewOpen();
  };

  // Handle modal editar
  const handleEditAuto = (auto) => {
    setSelectedAuto(auto);
    onEditOpen();
  };

  // Handle modal eliminar
  const handleDeleteConfirm = (auto) => {
    setSelectedAuto(auto);
    onDeleteOpen();
  };

  const columns = [
    { key: "placa", label: "PLACA" },
    { key: "marca", label: "MARCA" },
    { key: "modelo", label: "MODELO" },
    { key: "color", label: "COLOR" },
    {
      key: "tipo_auto",
      label: "TIPO",
      render: (auto) => auto.tipo_auto?.tipo || 'No especificado'
    },
    {
      key: "activo",
      label: "ESTADO",
      render: (auto) => (
        <Chip
          color={auto.activo ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {auto.activo ? "Activo" : "Inactivo"}
        </Chip>
      )
    },
    {
      key: "fechaRegistro",
      label: "FECHA REGISTRO",
      render: (auto) => {
        const date = new Date(auto.fecha_creado);
        return date.toLocaleDateString();
      }
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (auto) => (
        <div className="flex gap-2 justify-start">
          <Tooltip content="Ver">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleViewAuto(auto)}
            >
              <Icon icon="lucide:eye" width={16} height={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Editar">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleEditAuto(auto)}
            >
              <Icon icon="lucide:edit" width={16} height={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Eliminar">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => handleDeleteConfirm(auto)}
            >
              <Icon icon="lucide:trash" width={16} height={16} />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Autos"
          subtitle="Gestión de Autos del sistema."
          emoji=""
        />
        <Button
          color="primary"
          startContent={<Icon icon="lucide:plus" width={16} height={16} />}
          onPress={onOpen}
        >
          {`Añadir ${tipo}`}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="lucide:car"
          title={`Total ${tipo}s`}
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:car-front"
          title={`Activos`}
          value={estadisticas.activos || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:car-taxi-front"
          title={`Inactivos`}
          value={estadisticas.inactivos || 0}
          color="danger"
          size="large"
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder={`Buscar ${tipo}`}
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="w-full md:w-1/3"
            />
            <div className="flex gap-2 w-full md:w-2/3">
              <Select
                label="Estado"
                placeholder="Todos los estados"
                selectedKeys={[selectedEstado]}
                className="w-full md:w-1/2"
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos los estados</SelectItem>
                <SelectItem key="activo" value="activo">Activos</SelectItem>
                <SelectItem key="inactivo" value="inactivo">Inactivos</SelectItem>
              </Select>
            </div>
          </div>

          <Tabla
            title="Lista de Autos"
            columns={columns}
            data={filteredAutos}
            rowKey="id"
            isloading={isLoading}
            loadingContent={<LoadingSpinner />}
          />
        </CardBody>
      </Card>

      {/* Modal añadir auto */}
      <AutoFormModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAddAuto={handleAddAuto}
        tipo={tipo}
        service={autosService}
      />

      {/* Modal ver auto */}
      {selectedAuto && (
        <AutoViewModal
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
          auto={selectedAuto}
          tipo={tipo}
        />
      )}

      {/* Modal editar auto */}
      {selectedAuto && (
        <AutoFormModal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          onAddAuto={handleUpdateAuto}
          editMode={true}
          dataInicial={selectedAuto}
          tipo={tipo}
          service={autosService}
        />
      )}

      {/* Modal eliminar auto */}
      {selectedAuto && (
        <AutoDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          auto={selectedAuto}
          onConfirmDelete={handleDeleteAuto}
          tipo={tipo}
          service={autosService}
        />
      )}
    </div>
  );
};