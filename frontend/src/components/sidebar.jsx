import { NavLink, useLocation } from 'react-router';
import { Icon } from '@iconify/react';
import { Divider } from '@heroui/react';
import { ThemeSwitcher } from './theme-switcher';
import { useAuthStore } from '../store/auth-store';

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
  
  return (
    <aside 
      className={`bg-content1 border-r border-divider transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
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
        <div className={`px-3 mb-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
          Principal
        </div>
        <nav className="space-y-1 px-2">
          <NavItem to="/dashboard" icon="lucide:home" label={isOpen ? 'Dashboard' : ''} />
          <NavItem to="/analytics" icon="lucide:bar-chart" label={isOpen ? 'Analytics' : ''} />
          <NavItem to="/customers" icon="lucide:users" label={isOpen ? 'Customers' : ''} />
          <NavItem to="/products" icon="lucide:package" label={isOpen ? 'Products' : ''} />
        </nav>
        
        <div className={`px-3 my-2 text-xs font-medium text-default-500 uppercase ${!isOpen && 'md:hidden'}`}>
          Configuración
        </div>
        <nav className="space-y-1 px-2">
          <NavItem to="/settings" icon="lucide:settings" label={isOpen ? 'Settings' : ''} />
        </nav>
      </div>
      
      <div className="p-4 border-t border-divider">
        <div className={`flex items-center justify-between ${!isOpen && 'md:hidden'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <Icon icon="lucide:user" width={16} height={16} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
              <p className="text-xs text-default-500">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
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