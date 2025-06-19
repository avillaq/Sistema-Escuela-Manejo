import { useAuthStore } from '@/store/auth-store';
import { Navigate } from 'react-router';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AlumnoDashboard } from '@/pages/alumno/AlumnoDashboard';
import { InstructorDashboard } from '@/pages/instructor/InstructorDashboard';

export const Dashboard = () => {
  const { rol } = useAuthStore();

  switch (rol) {
    case 'admin':
      return <AdminDashboard />;
    case 'alumno':
      return <AlumnoDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};