import { NavLink, useLocation } from 'react-router';
import { Icon } from '@iconify/react';
import { Divider } from '@heroui/react';
import { ThemeSwitcher } from './theme-switcher';
import { useAuthStore } from '@/store/auth-store';

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "sidebar-link active" : "sidebar-link"
      }
    >
      <Icon icon={icon} width={20} height={20} />
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const rol = user?.rol || "admin";

  const renderNavItems = () => {
    if (rol === "admin") {
      return (
        <>
          <div className={`px-3 mb-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Principal
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} />
            {/* <NavItem to="/calendario" icon="lucide:calendar" label={isOpen ? 'Calendario' : ''} /> */}
            {/* <NavItem to="/reportes" icon="lucide:bar-chart" label={isOpen ? 'Reportes' : ''} /> */}
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Gestión de Usuarios
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/alumnos" icon="lucide:graduation-cap" label={isOpen ? 'Alumnos' : ''} />
            <NavItem to="/instructores" icon="lucide:user-check" label={isOpen ? 'Instructores' : ''} />
            <NavItem to="/administradores" icon="lucide:shield" label={isOpen ? 'Administradores' : ''} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Gestión Académica
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/matriculas" icon="lucide:file-text" label={isOpen ? 'Matrículas' : ''} />
            <NavItem to="/asistencias" icon="lucide:check-circle" label={isOpen ? 'Asistencias' : ''} />
            <NavItem to="/tickets" icon="lucide:ticket" label={isOpen ? 'Tickets' : ''} />
          </nav>
          <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
            Recursos
          </div>
          <nav className="space-y-1 px-2">
            <NavItem to="/autos" icon="lucide:car" label={isOpen ? 'Autos' : ''} />
            {/* <NavItem to="/bloques" icon="lucide:clock" label={isOpen ? 'Bloques' : ''} /> */}
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
            <NavItem to="/mi-dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} />
            <NavItem to="/mi-calendario" icon="lucide:calendar" label={isOpen ? 'Calendario' : ''} />
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
            <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} />
            <NavItem to="/tickets" icon="lucide:ticket" label={isOpen ? 'Tickets' : ''} />
          </nav>
        </>
      );
    }
    return null;
  }


  return (
    <aside
      className={`bg-content1 border-r border-divider transition-all duration-300 flex flex-col ${isOpen ? 'w-52' : 'w-0 md:w-16 overflow-hidden'
        }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${!isOpen && 'md:hidden'}`}>
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Icon icon="lucide:layout-dashboard" className="text-white" width={18} height={18} />
          </div>
          <h1 className={`font-semibold text-lg ${!isOpen && 'md:hidden'}`}>Dashboard</h1>
        </div>
        {!isOpen && (
          <div className="hidden md:flex items-center justify-center w-full">
            <Icon icon="lucide:layout-dashboard" className="text-primary" width={20} height={20} />
          </div>
        )}
      </div>

      <Divider />

      <div className="flex-1 py-4 flex flex-col">
        {renderNavItems()}

        <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
          Configuración
        </div>
        <nav className="space-y-1 px-2">
          <NavItem to="/settings" icon="lucide:settings" label={isOpen ? 'Settings' : ''} />
        </nav>
      </div>

      <div className="p-4 border-t border-divider">
        <div className={`flex items-center justify-center ${!isOpen && 'md:hidden'}`}>
          <ThemeSwitcher />
        </div>
        {!isOpen && (
          <div className="hidden md:flex items-center justify-center mt-2">
            <ThemeSwitcher />
          </div>
        )}
      </div>
    </aside>
  );
};