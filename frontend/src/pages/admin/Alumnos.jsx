import { useState, useEffect, useCallback } from 'react';
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

  // filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    page: 1,
    per_page: 20,
    busqueda: "",
    estado: "todos",
    tiene_matricula: "todos"
  });

  const [filtrosTemporales, setFiltrosTemporales] = useState({
    busqueda: "",
    estado: "todos",
    tiene_matricula: "todos",
    per_page: 20
  });

  // Estados para filtrar usuarios
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticasLoaded, setEstadisticasLoaded] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [isApplying, setIsApplying] = useState(false);


  // Cargar usuarios
  const fetchUsers = useCallback(async (filtrosParaUsar) => {
    setIsLoading(true);
    try {
      // Limpiar filtros vacíos
      const filtrosLimpios = Object.fromEntries(
        Object.entries(filtrosParaUsar).filter(([_, value]) =>
          value !== null && value !== undefined && value !== '' && value !== 'todos'
        )
      );
      const result = await alumnosService.getAll(filtrosLimpios);

      if (result.success) {
        setUserData(result.data.alumnos);
        setPagination(result.data.pagination);
      } else {
        addToast({
          title: "Error al cargar alumnos",
          description: result.error || "No se pudieron cargar los alumnos.",
          severity: "danger",
          color: "danger",
        });
      }

    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar los alumnos.",
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
      const result = await alumnosService.getEstadisticas();
      if (result.success) {
        setEstadisticas(result.data);
        setEstadisticasLoaded(true);
      } else {
        addToast({
          title: "Error al cargar estadísticas",
          description: result.error || "No se pudieron cargar las estadísticas de alumnos.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de alumnos.",
        severity: "danger",
        color: "danger",
      });
    }
  }, [estadisticasLoaded]);

  useEffect(() => {
    fetchUsers(filtrosAplicados);
    fetchEstadisticas();
  }, []);

  // Aplicar filtros
  const aplicarFiltros = () => {
    setIsApplying(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchUsers(nuevosFilterosAplicados);
  };
  // Buscar usuarios
  const buscar = () => {
    setIsSearching(true);
    const nuevosFilterosAplicados = {
      ...filtrosTemporales,
      page: 1
    };

    setFiltrosAplicados(nuevosFilterosAplicados);
    fetchUsers(nuevosFilterosAplicados);
  };

  const limpiarTodo = () => {
    const filtrosLimpios = {
      busqueda: "",
      estado: "todos",
      tiene_matricula: "todos",
      per_page: 20
    };

    const filtrosAplicadosLimpios = {
      ...filtrosLimpios,
      page: 1
    };

    setFiltrosTemporales(filtrosLimpios);
    setFiltrosAplicados(filtrosAplicadosLimpios);
    fetchUsers(filtrosAplicadosLimpios);
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
    fetchUsers(nuevosFiltros);
  };

  const hayCambiosPendientes =
    filtrosTemporales.busqueda !== filtrosAplicados.busqueda ||
    filtrosTemporales.estado !== filtrosAplicados.estado ||
    filtrosTemporales.tiene_matricula !== filtrosAplicados.tiene_matricula ||
    filtrosTemporales.per_page !== filtrosAplicados.per_page;

  const hayFiltrosActivos =
    filtrosAplicados.busqueda !== "" ||
    filtrosAplicados.estado !== "todos" ||
    filtrosAplicados.tiene_matricula !== "todos";

  // Handle añadir usuario
  const handleAddUser = (newUser) => {
    setUserData(prev => [newUser, ...prev]);

    setEstadisticas(prev => ({
      ...prev,
      total: prev.total + 1,
      activos: prev.activos + (newUser.activo ? 1 : 0),
      sin_matricula: prev.sin_matricula + 1
    }));

    addToast({
      title: `${tipo} añadido`,
      description: `${newUser.nombre} ${newUser.apellidos} ha sido añadido correctamente.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle editar usuario
  const handleUpdateUser = (updatedUser) => {
    setUserData(prev =>
      prev.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    addToast({
      title: `${tipo} actualizado`,
      description: `Los datos de ${updatedUser.nombre} ${updatedUser.apellidos} han sido actualizados.`,
      severity: "success",
      color: "success",
    });
  };

  // Handle eliminar usuario (aqui se solo se desactiva)
  const handleDeleteUser = (userId) => {
    const deletedUser = userData.find(user => user.id === userId);
    if (!deletedUser) return;
    setUserData(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, activo: false } : user
      )
    );

    setEstadisticas(prev => ({
      ...prev,
      activos: prev.activos - 1,
      inactivos: prev.inactivos + 1
    }));

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
          <Tooltip content="Ver">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleViewUser(user)}
            >
              <Icon icon="lucide:eye" width={16} height={16} />
            </Button>
          </Tooltip>
          <Tooltip content="Editar">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleEditUser(user)}
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
              onPress={() => handleDeleteConfirm(user)}
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
          value={estadisticas.total || 0}
          color="primary"
          size="large"
        />
        <StatCard
          icon="lucide:user-check"
          title="Activos"
          value={estadisticas.activos || 0}
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:user-x"
          title="Inactivos"
          value={estadisticas.inactivos || 0}
          color="danger"
          size="large"
        />
        <StatCard
          icon="lucide:graduation-cap"
          title="Con Matrícula"
          value={estadisticas.con_matricula || 0}
          color="warning"
          size="large"
        />
        <StatCard
          icon="lucide:user-plus"
          title="Sin Matrícula"
          value={estadisticas.sin_matricula || 0}
          color="secondary"
          size="large"
        />
      </div>

      <Card>
        <CardBody>
          <div className="space-y-4 mb-6">
            <SearchBar
              value={filtrosTemporales.busqueda}
              onChange={(value) => handleInputChange('busqueda', value)}
              onSearch={buscar}
              isSearching={isSearching}
              placeholder="Buscar por nombre, DNI o email..."
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                label="Estado"
                placeholder="Todos los estados"
                selectedKeys={[filtrosTemporales.estado]}
                className="w-full md:w-1/4"
                onChange={(e) => handleInputChange('estado', e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="activo" value="activo">Activos</SelectItem>
                <SelectItem key="inactivo" value="inactivo">Inactivos</SelectItem>
              </Select>

              <Select
                label="Matrícula"
                placeholder="Todos"
                selectedKeys={[filtrosTemporales.tiene_matricula]}
                className="w-full md:w-1/4"
                onChange={(e) => handleInputChange('tiene_matricula', e.target.value)}
              >
                <SelectItem key="todos" value="todos">Todos</SelectItem>
                <SelectItem key="si" value="si">Con Matrícula</SelectItem>
                <SelectItem key="no" value="no">Sin Matrícula</SelectItem>
              </Select>

              <Select
                label="Registros por página"
                placeholder="20"
                selectedKeys={[filtrosTemporales.per_page.toString()]}
                className="w-full md:w-1/4"
                onChange={(e) => handleInputChange('per_page', parseInt(e.target.value))}
              >
                <SelectItem key="10" value="10">10</SelectItem>
                <SelectItem key="20" value="20">20</SelectItem>
                <SelectItem key="50" value="50">50</SelectItem>
                <SelectItem key="100" value="100">100</SelectItem>
              </Select>

              {/* Botones de control */}
              <div className="flex gap-2 w-full md:w-1/4">
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
                  {filtrosAplicados.estado !== "todos" && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Estado: {filtrosAplicados.estado}
                    </Chip>
                  )}
                  {filtrosAplicados.tiene_matricula !== "todos" && (
                    <Chip size="sm" color="secondary" variant="flat">
                      Matrícula: {filtrosAplicados.tiene_matricula === "si" ? "Con matrícula" : "Sin matrícula"}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>

          <Tabla
            title="Lista de Alumnos"
            columns={columns}
            data={userData}
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