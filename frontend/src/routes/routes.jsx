import { Dashboard } from '../pages/admin/Dashboard';
import { Navigate } from 'react-router';
import { Analytics } from '../pages/admin/Analytics';
import { Customers } from '../pages/admin/Customers';
import { Products } from '../pages/admin/Products';
import { Settings } from '../pages/admin/Settings';
import { LoginPage } from '../pages/LoginPage';

const ToDashboard = () => { return <Navigate to="/dashboard" replace />; };

// Rutas publicas
export const publicRoutes = [
  {
    path: '/login',
    element: LoginPage,
  },
];

// Rutas protegidas
export const protectedRoutes = [
  {
    path: '/',
    element: ToDashboard,
  },
  {
    path: '/dashboard',
    element: Dashboard,
  },
  {
    path: '/analytics',
    element: Analytics,
  },
  {
    path: '/customers',
    element: Customers,
  },
  {
    path: '/products',
    element: Products,
  },
  {
    path: '/settings',
    element: Settings,
  },
  {
    path: '*',
    element: ToDashboard,
  },
];