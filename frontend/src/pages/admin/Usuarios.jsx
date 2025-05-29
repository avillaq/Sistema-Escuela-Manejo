import { useState, useMemo } from 'react';
import { 
  Card, 
  CardBody, 
  Chip, 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { DataTable } from '@/components/data-table';
import { users } from '@/data/users-data';
import { UserFormModal } from '@/pages/admin/UserFormModal';
import { UserViewModal } from '@/pages/admin/UserViewModal';
import { UserDeleteModal } from '@/pages/admin/UserDeleteModal';

export const Usuarios = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { 
    isOpen: isViewOpen, 
    onOpen: onViewOpen, 
    onOpenChange: onViewOpenChange 
  } = useDisclosure();
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onOpenChange: onEditOpenChange 
  } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onOpenChange: onDeleteOpenChange 
  } = useDisclosure();
  
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(users);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter users based on selected filters
  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      // Filter by department
      if (selectedDepartment !== "all" && user.departamento !== selectedDepartment) {
        return false;
      }
      
      // Filter by status
      if (selectedStatus === "active" && !user.activo) {
        return false;
      }
      if (selectedStatus === "inactive" && user.activo) {
        return false;
      }
      
      // Filter by search query
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
  }, [selectedDepartment, selectedStatus, searchQuery, userData]);

  // Get unique departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set(userData.map(user => user.departamento));
    return Array.from(depts);
  }, [userData]);

  // Handle adding a new user
  const handleAddUser = (newUser) => {
    const id = userData.length > 0 ? Math.max(...userData.map(u => u.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    const user = {
      ...newUser,
      id,
      fechaRegistro: today,
      email: `${newUser.nombre.toLowerCase()}.${newUser.apellidos.toLowerCase().split(' ')[0]}@example.com`
    };
    
    setUserData([...userData, user]);
    
    addToast({
      title: "Usuario añadido",
      description: `${user.nombre} ${user.apellidos} ha sido añadido correctamente.`,
      severity: "success",
    });
  };
  
  // Handle updating a user
  const handleUpdateUser = (updatedUser) => {
    const updatedUsers = userData.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setUserData(updatedUsers);
    
    addToast({
      title: "Usuario actualizado",
      description: `Los datos de ${updatedUser.nombre} ${updatedUser.apellidos} han sido actualizados.`,
      severity: "success",
    });
  };
  
  // Handle deleting a user
  const handleDeleteUser = (userId) => {
    const updatedUsers = userData.filter(user => user.id !== userId);
    const deletedUser = userData.find(user => user.id === userId);
    
    setUserData(updatedUsers);
    
    addToast({
      title: "Usuario eliminado",
      description: `${deletedUser?.nombre} ${deletedUser?.apellidos} ha sido eliminado correctamente.`,
      severity: "danger",
    });
  };
  
  // Handle view user
  const handleViewUser = (user) => {
    setSelectedUser(user);
    onViewOpen();
  };
  
  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    onEditOpen();
  };
  
  // Handle delete user
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
    { 
      key: "departamento", 
      label: "DEPARTAMENTO",
      render: (user) => (
        <Chip size="sm" variant="flat" color="primary">{user.departamento}</Chip>
      )
    },
    { 
      key: "genero", 
      label: "GÉNERO" 
    },
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
        const date = new Date(user.fechaRegistro);
        return date.toLocaleDateString();
      }
    },
    {
      key: "actions",
      label: "ACCIONES",
      render: (user) => (
        <div className="flex gap-2 justify-end">
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
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-default-500">Gestión de usuarios del sistema.</p>
        </div>
        <Button 
          color="primary" 
          startContent={<Icon icon="lucide:plus" width={16} height={16} />}
          onPress={onOpen}
        >
          Añadir Usuario
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary-500/20">
              <Icon icon="lucide:users" className="text-primary-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-primary-700">Total Usuarios</p>
              <p className="text-2xl font-semibold text-primary-700">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-success-500/20">
              <Icon icon="lucide:user-check" className="text-success-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-success-700">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-success-700">
                {users.filter(user => user.activo).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-danger-500/20">
              <Icon icon="lucide:user-x" className="text-danger-500" width={24} height={24} />
            </div>
            <div>
              <p className="text-sm text-danger-700">Usuarios Inactivos</p>
              <p className="text-2xl font-semibold text-danger-700">
                {users.filter(user => !user.activo).length}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar usuario..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" className="text-default-400" />}
              className="w-full md:w-1/3"
            />
            <div className="flex gap-2 w-full md:w-2/3">
              <Select
                label="Departamento"
                placeholder="Todos los departamentos"
                selectedKeys={[selectedDepartment]}
                className="w-full md:w-1/2"
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <SelectItem key="all" value="all">Todos los departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </Select>
              
              <Select
                label="Estado"
                placeholder="Todos los estados"
                selectedKeys={[selectedStatus]}
                className="w-full md:w-1/2"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <SelectItem key="all" value="all">Todos los estados</SelectItem>
                <SelectItem key="active" value="active">Activos</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactivos</SelectItem>
              </Select>
            </div>
          </div>
          
          <DataTable 
            title="Lista de Usuarios" 
            columns={columns} 
            data={filteredUsers} 
            rowKey="id" 
          />
        </CardBody>
      </Card>
      
      {/* Add User Modal */}
      <UserFormModal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        onAddUser={handleAddUser}
      />
      
      {/* View User Modal */}
      {selectedUser && (
        <UserViewModal
          isOpen={isViewOpen}
          onOpenChange={onViewOpenChange}
          user={selectedUser}
        />
      )}
      
      {/* Edit User Modal */}
      {selectedUser && (
        <UserFormModal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          onAddUser={handleUpdateUser}
          editMode={true}
          initialData={selectedUser}
        />
      )}
      
      {/* Delete User Modal */}
      {selectedUser && (
        <UserDeleteModal
          isOpen={isDeleteOpen}
          onOpenChange={onDeleteOpenChange}
          user={selectedUser}
          onConfirmDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};