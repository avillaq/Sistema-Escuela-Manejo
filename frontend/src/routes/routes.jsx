import { Dashboard } from '@/pages/Dashboard';
import { Navigate } from 'react-router';
import { Analytics } from '@/pages/Analytics';
import { Customers } from '@/pages/Customers';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';

// Rutas publicas
export const publicRoutes = [
  {
    path: '/login',
    element: Login,
  },
];

// Rutas protegidas
export const protectedRoutes = [
  {
    path: '/',
    element: () => <Navigate to="/dashboard" replace />,
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
    path: '/reports',
    element: Reports,
  },
  {
    path: '/settings',
    element: Settings,
  },
  {
    path: '*',
    element: () => <Navigate to="/dashboard" replace />,
  },
];