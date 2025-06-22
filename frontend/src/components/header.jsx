import { Icon } from '@iconify/react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/service/apiService';

export const Header = ({ toggleSidebar }) => {
  const { rol, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const result = await authService.logout();
      if (result.success) {
        logout();
      } else {
        console.error("Error al cerrar sesión:", result.error);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const mostrarNombre = (rol) => {
    switch(rol) {
      case 'admin': return 'Administrador';
      case 'alumno': return 'Alumno';
      case 'instructor': return 'Instructor';
      default: return 'Usuario';
    }
  };

  return (
    <header className="bg-content1 border-b border-divider h-16 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          aria-label="Toggle sidebar"
          onPress={toggleSidebar}
        >
          <Icon icon="lucide:menu" width={20} height={20} />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className="flex items-center gap-2"
              endContent={<Icon icon="lucide:chevron-down" width={16} height={16} />}
            >
              <Avatar
                size="sm"
                color="primary"
                icon={<Icon icon="lucide:user" width={20} height={20} />}
              />
              <span className="hidden md:inline">{mostrarNombre(rol)}</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem
              key="logout"
              startContent={<Icon icon="lucide:log-out" width={18} height={18} />}
              className="text-danger"
              color="danger"
              onPress={handleLogout}
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};