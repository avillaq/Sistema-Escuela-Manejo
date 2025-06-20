import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/auth-store';

export const ProtectedRoute = ({ children, requiredRole = null}) => {
  const { isAuthenticated, rol } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && rol !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};