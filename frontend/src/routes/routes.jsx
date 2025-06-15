import { Navigate } from 'react-router';

// Rutas publicas
import { LoginPage } from '@/pages/LoginPage';

// Rutas para el administrador
import { Dashboard } from '@/pages/admin/Dashboard';
import { Alumnos } from '@/pages/admin/Alumnos';
import { Instructores } from '@/pages/admin/Instructores';
import { Administradores } from '@/pages/admin/Administradores';
import { Matriculas } from '@/pages/admin/Matriculas';
import { MatriculaForm } from '@/pages/admin/MatriculaForm';
import { MatriculaDetalle } from '@/pages/admin/MatriculaDetalle';
import { MatriculaReservas } from '@/pages/admin/MatriculaReservas';
import { Asistencias } from '@/pages/admin/Asistencias';
import { Tickets } from '@/pages/admin/Tickets';
import { Autos } from '@/pages/admin/Autos';
import { Analytics } from '@/pages/admin/Analytics';
import { Customers } from '@/pages/admin/Customers';
import { Products } from '@/pages/admin/Products';
import { Settings } from '@/pages/admin/Settings';
import { Usuarios } from '@/pages/admin/Usuarios';

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
    path: '/alumnos',
    element: Alumnos,
  },
  {
    path: '/instructores',
    element: Instructores,
  }, 
  {
    path: '/administradores',
    element: Administradores,
  },
  {
    path: '/matriculas',
    element: Matriculas,
  },
  {
    path: '/matriculas/nueva',
    element: MatriculaForm,
  },
  {
    path: '/matriculas/:id',
    element: MatriculaDetalle,
  },
  {
    path: '/matriculas/:id/editar',
    element: MatriculaForm,
  },
  {
    path: '/matriculas/:id/reservas',
    element: MatriculaReservas,
  },
  {
    path: '/asistencias',
    element: Asistencias,
  },
  {
    path: '/tickets',
    element: Tickets,
  },
  {
    path: '/autos',
    element: Autos,
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
    path: '/users',
    element: Usuarios,
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