import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  useDisclosure,
  Input,
  addToast,
  Tooltip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PaqueteFormModal } from './PaqueteFormModal';
import { PaqueteViewModal } from './PaqueteViewModal';
import { PaqueteDeleteModal } from './PaqueteDeleteModal';
import { paquetesService } from '@/service/apiService';

export const Paquetes = () => {
  const { isOpen, onOpenChange } = useDisclosure();
  const tipo = "Paquete";
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [paquetes, setPaquetes] = useState([]);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        const result = await paquetesService.getAll();
        if (result.success) {
          setPaquetes(result.data);
        } else {
          addToast({
            title: "Error al cargar paquetes",
            description: result.error || "No se pudieron cargar los paquetes.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error al cargar paquetes",
          description: "No se pudieron cargar los paquetes.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaquetes();
  }, []);

  const filteredPaquetes = useMemo(() => {
    return paquetes.filter(paquete => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return paquete.nombre.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, paquetes]);

  const estadisticas = useMemo(() => {
    const total = paquetes.length;
    const activos = paquetes.filter(p => p.activo).length;
    const inactivos = paquetes.filter(p => !p.activo).length;
    return { total, activos, inactivos };
  }, [paquetes]);

  const handleAdd = (nuevo) => {
    setPaquetes([...paquetes, nuevo]);
    addToast({
      title: "Paquete añadido",
      description: `${nuevo.nombre} ha sido añadido correctamente.`,
      severity: "success",
      color: "success",
    });
  };

  const handleUpdate = (actualizado) => {
    const nuevos = paquetes.map(p => p.id === actualizado.id ? actualizado : p);
    setPaquetes(nuevos);
    addToast({
      title: "Paquete actualizado",
      description: `${actualizado.nombre} ha sido actualizado correctamente.`,
      severity: "success",
      color: "success",
    });
  };

  const handleDelete = (id) => {
    const actualizado = paquetes.map(p =>
      p.id === id ? { ...p, activo: false } : p
    );
    setPaquetes(actualizado);
    const eliminado = paquetes.find(p => p.id === id);
    addToast({
      title: "Paquete eliminado",
      description: `${eliminado.nombre} ha sido marcado como inactivo.`,
      severity: "danger",
      color: "danger",
    });
  };

  const columns = [
    {
      key: "nombre",
      label: "NOMBRE",
      render: (p) => <span className="font-medium">{p.nombre}</span>
    },
    {
      key: "tipo_auto",
      label: "TIPO DE AUTO",
      render: (p) => p.tipo_auto?.tipo || '---'
    },
    {
      key: "horas_total",
      label: "HORAS",
      render: (p) => `${p.horas_total}h`
    },
    {
      key: "costo_total",
      label: "COSTO (S/)",
      render: (p) => `S/ ${p.costo_total.toFixed(2)}`
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (p) => (
        <div className="flex gap-2 justify-start">
          <Tooltip content="Ver">
            <Button isIconOnly size="sm" variant="light" onPress={() => { setSelectedPaquete(p); onViewOpen(); }}>
              <Icon icon="lucide:eye" width={16} height={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Editar">
            <Button isIconOnly size="sm" variant="light" onPress={() => { setSelectedPaquete(p); onEditOpen(); }}>
              <Icon icon="lucide:edit" width={16} height={16} />
            </Button>
          </Tooltip>
          {/* <Tooltip content="Eliminar">
            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => { setSelectedPaquete(p); onDeleteOpen(); }}>
              <Icon icon="lucide:trash" width={16} height={16} />
            </Button>
          </Tooltip> */}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paquetes"
        subtitle="Gestión de paquetes disponibles."
        emoji=""
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="lucide:box"
          title="Total Paquetes"
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar paquetes"
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="w-full md:w-1/3"
            />
          </div>

          <Tabla
            title="Lista de Paquetes"
            columns={columns}
            data={filteredPaquetes}
            rowKey="id"
            isloading={isLoading}
            loadingContent={<LoadingSpinner />}
          />

        </CardBody>
      </Card>

      {/* <PaqueteFormModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAdd={handleAdd}
        service={paquetesService}
        tipo={tipo}
      /> */}

      {selectedPaquete && (
        <PaqueteViewModal
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
          paquete={selectedPaquete}
          tipo={tipo}
        />
      )}

      {selectedPaquete && (
        <PaqueteFormModal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          onAdd={handleUpdate}
          editMode={true}
          dataInicial={selectedPaquete}
          service={paquetesService}
          tipo={tipo}
        />
      )}

      {/* {selectedPaquete && (
        <PaqueteDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          paquete={selectedPaquete}
          onConfirmDelete={() => handleDelete(selectedPaquete.id)}
          service={paquetesService}
          tipo={tipo}
        />
      )} */}
    </div>
  );
};
