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
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Tabla } from '@/components/Tabla';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UserFormModal } from '@/pages/admin/UserFormModal';
import { UserViewModal } from '@/pages/admin/UserViewModal';
import { UserDeleteModal } from '@/pages/admin/UserDeleteModal';
import { alumnosService } from '@/service/apiService';

export const Alumnos = () => {
  const tipo = "Alumno";

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Modales para ver, editar y eliminar usuarios
  const { isOpen: isViewOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

  // Estados para filtrar usuarios
  const [selectedEstado, setSelectedEstado] = useState("activo");
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await alumnosService.getAll();
        if (result.success) {
          setUserData(result.data);
        } else {
          addToast({
            title: "Error al cargar usuarios",
            description: result.error || "No se pudieron cargar los usuarios.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudieron cargar los usuarios.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filtrar usuarios según estado y búsqueda
  const filteredUsers = useMemo(() => {
    return userData.filter(user => {

      // por estado
      if (selectedEstado === "activo" && !user.activo) {
        return false;
      }
      if (selectedEstado === "inactivo" && user.activo) {
        return false;
      }

      // por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.nombre.toLowerCase().includes(query) ||
          user.apellidos.toLowerCase().includes(query) ||
          user.dni.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [selectedEstado, searchQuery, userData]);

  const estadisticas = useMemo(() => {
    const total = userData.length;
    const activos = userData.filter(user => user.activo).length;
    const inactivos = userData.filter(user => !user.activo).length;

    return { total, activos, inactivos };
  }, [userData]);

  // Handle añadir usuario
  const handleAddUser = (newUser) => {
    const id = userData.length > 0 ? Math.max(...userData.map(u => u.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];

    const user = {
      ...newUser,
      id,
      fecha_creado: today,
    };

    setUserData([...userData, user]);

    addToast({
      title: `${tipo} añadido`,
      description: `${user.nombre} ${user.apellidos} ha sido añadido correctamente.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle editar usuario
  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = userData.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );

    setUserData(updatedUsers);

    addToast({
      title: `${tipo} actualizado`,
      description: `Los datos de ${updatedUser.nombre} ${updatedUser.apellidos} han sido actualizados.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle eliminar usuario (aqui se solo se desactiva) // TODO : revisar si se debe eliminar o desactivar
  const handleDeleteUser = (userId) => {
    const deletedUser = userData.find(user => user.id === userId);
    if (!deletedUser) return;
    const updatedUsers = userData.map(user =>
      user.id === userId ? { ...user, activo: false } : user
    );

    setUserData(updatedUsers);

    addToast({
      title: `${tipo} eliminado`,
      description: `${deletedUser?.nombre} ${deletedUser?.apellidos} ha sido eliminado correctamente.`,
      severity: "danger",
      color: "success",
    });
  };

  // Handle modal ver
  const handleViewUser = (user) => {
    setSelectedUser(user);
    onViewOpen();
  };

  // Handle modal editar
  const handleEditUser = (user) => {
    setSelectedUser(user);
    onEditOpen();
  };

  // Handle modal eliminar
  const handleDeleteConfirm = (user) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const columns = [
    {
      key: "nombre",
      label: "NOMBRE COMPLETO",
      render: (user) => (
        <div>
          <p className="font-medium">{user.nombre} {user.apellidos}</p>
          <p className="text-xs text-default-500">{user.email}</p>
        </div>
      )
    },
    { key: "dni", label: "DNI" },
    { key: "telefono", label: "TELÉFONO" },
    {
      key: "activo",
      label: "ESTADO",
      render: (user) => (
        <Chip
          color={user.activo ? "success" : "danger"}
          size="sm"
          variant="flat"
        >
          {user.activo ? "Activo" : "Inactivo"}
        </Chip>
      )
    },
    {
      key: "fechaRegistro",
      label: "FECHA REGISTRO",
      render: (user) => {
        const date = new Date(user.fecha_creado);
        return date.toLocaleDateString();
      }
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (user) => (
        <div className="flex gap-2 justify-start">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleViewUser(user)}
          >
            <Icon icon="lucide:eye" width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleEditUser(user)}
          >
            <Icon icon="lucide:edit" width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDeleteConfirm(user)}
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
          title="Alumnos"
          subtitle="Gestión de Alumnos del sistema."
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
          icon="lucide:users"
          title={`Total ${tipo}s`}
          value={isLoading ? ".." : estadisticas.total}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:user-check"
          title={`${tipo}s Activos`}
          value={isLoading ? ".." : estadisticas.activos}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:user-x"
          title={`${tipo}s Inactivos`}
          value={isLoading ? ".." : estadisticas.inactivos}
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

          {isLoading ?
            (<LoadingSpinner mensaje="Cargando usuarios..." />)
            :
            <Tabla
              title="Lista de Alumnos"
              columns={columns}
              data={filteredUsers}
              rowKey="id"
            />
          }

        </CardBody>
      </Card>

      {/* Modal añadir usuario */}
      <UserFormModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onAddUser={handleAddUser}
        tipo={tipo}
        service={alumnosService}
      />

      {/* Modal ver usuario */}
      {selectedUser && (
        <UserViewModal
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
          user={selectedUser}
          tipo={tipo}
        />
      )}

      {/* Modal editar usuario */}
      {selectedUser && (
        <UserFormModal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          onAddUser={handleUpdateUser}
          editMode={true}
          dataInicial={selectedUser}
          tipo={tipo}
          service={alumnosService}
        />
      )}

      {/* Modal eliminar usuario */}
      {selectedUser && (
        <UserDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          user={selectedUser}
          onConfirmDelete={handleDeleteUser}
          tipo={tipo}
          service={alumnosService}
        />
      )}
    </div>
  );
};