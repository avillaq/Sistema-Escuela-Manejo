import { Navigate } from 'react-router';
import { ProtectedRoute, PublicRoute } from '@/routes/AccessRoute';

// Rutas publicas
import { LoginPage } from '@/pages/LoginPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

import { Dashboard } from '@/pages/Dashboard';

// Rutas para el administrador
import { Alumnos } from '@/pages/admin/Alumnos';
import { Instructores } from '@/pages/admin/Instructores';
import { Administradores } from '@/pages/admin/Administradores';
import { Matriculas } from '@/pages/admin/Matriculas';
import { MatriculaForm } from '@/pages/admin/MatriculaForm';
import { MatriculaDetalle } from '@/pages/admin/MatriculaDetalle';
import { CalendarioReserva } from '@/pages/admin/CalendarioReserva';
import { CalendarioGeneral } from '@/pages/admin/CalendarioGeneral';
import { Asistencias } from '@/pages/admin/Asistencias';
import { Tickets } from '@/pages/admin/Tickets';
import { Autos } from '@/pages/admin/Autos';
import { Paquetes } from '@/pages/admin/Paquetes';
import { Configuraciones } from '@/pages/Configuraciones';

// Rutas para el alumno
import { MiCalendario } from '@/pages/alumno/MiCalendario';
import { MisAsistencias } from '@/pages/alumno/MisAsistencias';

// Rutas para el instructor
import { MisTickets } from '@/pages/instructor/MisTickets';

const ToDashboard = () => {
  return <Navigate to="/dashboard" replace />;
};

// Rutas publicas
export const publicRoutes = [
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
];

// Rutas protegidas
export const protectedRoutes = [
  {
    path: '/',
    element: <ProtectedRoute><ToDashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/alumnos',
    element: <ProtectedRoute requiredRole="admin"><Alumnos /></ProtectedRoute>,

  },
  {
    path: '/instructores',
    element: <ProtectedRoute requiredRole="admin"><Instructores /></ProtectedRoute>,

  },
  {
    path: '/administradores',
    element: <ProtectedRoute requiredRole="admin"><Administradores /></ProtectedRoute>,

  },
  {
    path: '/calendario',
    element: <ProtectedRoute requiredRole="admin"><CalendarioGeneral /></ProtectedRoute>,
  },
  {
    path: '/matriculas',
    element: <ProtectedRoute requiredRole="admin"><Matriculas /></ProtectedRoute>,

  },
  {
    path: '/matriculas/nueva',
    element: <ProtectedRoute requiredRole="admin"><MatriculaForm /></ProtectedRoute>,

  },
  {
    path: '/matriculas/:id',
    element: <ProtectedRoute requiredRole="admin"><MatriculaDetalle /></ProtectedRoute>,
  },
  {
    path: '/matriculas/:id/reservas',
    element: <ProtectedRoute requiredRole="admin"><CalendarioReserva /></ProtectedRoute>,
  },
  {
    path: '/asistencias',
    element: <ProtectedRoute requiredRole="admin"><Asistencias /></ProtectedRoute>,

  },
  {
    path: '/tickets',
    element: <ProtectedRoute requiredRole="admin"><Tickets /></ProtectedRoute>,
  },
  {
    path: '/autos',
    element: <ProtectedRoute requiredRole="admin"><Autos /></ProtectedRoute>,
  },
  {
    path: '/paquetes',
    element: <ProtectedRoute requiredRole="admin"><Paquetes /></ProtectedRoute>,
  },
  {
    path: '/configuraciones',
    element: <ProtectedRoute><Configuraciones /></ProtectedRoute>,
  },
  {
    path: '/mi-calendario',
    element: <ProtectedRoute requiredRole="alumno"><MiCalendario /></ProtectedRoute>,
  },
  {
    path: '/mis-asistencias',
    element: <ProtectedRoute requiredRole="alumno"><MisAsistencias /></ProtectedRoute>,
  },
  {
    path: '/mis-tickets',
    element: <ProtectedRoute requiredRole="instructor"><MisTickets /></ProtectedRoute>,
  },
];