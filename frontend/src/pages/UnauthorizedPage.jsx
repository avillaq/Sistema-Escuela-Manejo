import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/auth-store';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardBody className="py-8">
          <div className="mb-6">
            <Icon 
              icon="lucide:shield-x" 
              className="text-danger-500 mx-auto mb-4" 
              width={64} 
              height={64} 
            />
            <h1 className="text-2xl text-center font-bold text-danger-600 mb-2">
              Acceso Denegado
            </h1>
            <p className="text-default-600 text-center">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              color="primary" 
              variant="flat" 
              fullWidth
              onPress={handleGoBack}
              startContent={<Icon icon="lucide:arrow-left" width={16} height={16} />}
            >
              Volver
            </Button>
            
            <Button 
              color="danger" 
              variant="light" 
              fullWidth
              onPress={handleLogout}
              startContent={<Icon icon="lucide:log-out" width={16} height={16} />}
            >
              Cerrar Sesión
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};