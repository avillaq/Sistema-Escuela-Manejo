import { NavLink } from 'react-router';
import { Icon } from '@iconify/react';
import { Divider } from '@heroui/react';
import { TemaSwitcher } from '@/components';
import { useAuthStore } from '@/store/auth-store';

const NavItem = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "sidebar-link active" : "sidebar-link"
      }
      onClick={onClick}
    >
      <Icon icon={icon} width={20} height={20} />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { rol } = useAuthStore();

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const renderNavItems = () => {
    if (rol === "admin") {
      return (
        <>
          <div className={`px-3 mb-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Principal
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Gestión de Usuarios
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/alumnos" icon="lucide:graduation-cap" label={isOpen ? 'Alumnos' : ''} onClick={handleNavClick} />
            <NavItem to="/instructores" icon="lucide:user-check" label={isOpen ? 'Instructores' : ''} onClick={handleNavClick} />
            <NavItem to="/administradores" icon="lucide:shield" label={isOpen ? 'Administradores' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Gestión Académica
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/calendario" icon="lucide:calendar" label={isOpen ? 'Calendario' : ''} onClick={handleNavClick} />
            <NavItem to="/matriculas" icon="lucide:file-text" label={isOpen ? 'Matrículas' : ''} onClick={handleNavClick} />
            <NavItem to="/asistencias" icon="lucide:check-circle" label={isOpen ? 'Asistencias' : ''} onClick={handleNavClick} />
            <NavItem to="/tickets" icon="lucide:ticket" label={isOpen ? 'Tickets' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Recursos
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/autos" icon="lucide:car" label={isOpen ? 'Autos' : ''} onClick={handleNavClick} />
            <NavItem to="/paquetes" icon="lucide:boxes" label={isOpen ? 'Paquetes' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Configuración
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/configuraciones" icon="lucide:settings" label={isOpen ? 'Configuración' : ''} onClick={handleNavClick} />
          </nav>
        </>
      );
    }
    if (rol === "alumno") {
      return (
        <>
          <div className={`px-3 mb-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Principal
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} onClick={handleNavClick} />
            <NavItem to="/mi-calendario" icon="lucide:calendar" label={isOpen ? 'Mi Calendario' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Configuración
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/configuraciones" icon="lucide:settings" label={isOpen ? 'Configuración' : ''} onClick={handleNavClick} />
          </nav>
        </>
      );
    }
    if (rol === "instructor") {
      return (
        <>
          <div className={`px-3 mb-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Principal
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} onClick={handleNavClick} />
            <NavItem to="/mis-tickets" icon="lucide:ticket" label={isOpen ? 'Mis Tickets' : ''} onClick={handleNavClick} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Configuración
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/configuraciones" icon="lucide:settings" label={isOpen ? 'Configuración' : ''} onClick={handleNavClick} />
          </nav>
        </>
      );
    }
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          bg-content1 border-r border-divider transition-all duration-300 flex flex-col z-50
          md:relative md:translate-x-0
          ${isOpen
            ? 'fixed left-0 top-0 h-full w-64 translate-x-0 md:w-52'
            : 'fixed -translate-x-full md:translate-x-0 w-64 md:w-16 md:overflow-hidden'
          }
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isOpen && 'md:hidden'}`}>
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Icon icon="lucide:layout-dashboard" className="text-white" width={18} height={18} />
            </div>
            <h1 className={`font-semibold text-base ${!isOpen && 'md:hidden'}`}>Dashboard</h1>
          </div>
          {!isOpen && (
            <div className="hidden md:flex items-center justify-center w-full">
              <Icon icon="lucide:layout-dashboard" className="text-primary" width={20} height={20} />
            </div>
          )}
          {isOpen && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md hover:bg-default-100"
            >
              <Icon icon="lucide:x" width={20} height={20} />
            </button>
          )}
        </div>

        <Divider />

        <div className="flex-1 py-4 flex flex-col overflow-y-auto">
          {renderNavItems()}
        </div>

        <div className="p-4 border-t border-divider">
          <div className={`flex items-center justify-center ${!isOpen && 'md:hidden'}`}>
            <TemaSwitcher />
          </div>
          {!isOpen && (
            <div className="hidden md:flex items-center justify-center mt-2">
              <TemaSwitcher />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};