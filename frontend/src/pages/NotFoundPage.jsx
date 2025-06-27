import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/auth-store';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getButtonText = () => {
    if (!isAuthenticated) return 'Ir al Login';
    return 'Ir al Dashboard';
  };

  const getButtonIcon = () => {
    if (!isAuthenticated) return 'lucide:log-in';
    return 'lucide:home';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardBody className="py-12 px-8">
          <div className="mb-6">
            <div className="relative">
              <div className="text-8xl font-bold text-primary-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon 
                  icon="lucide:search-x" 
                  className="text-primary-400" 
                  width={48} 
                  height={48} 
                />
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Página no encontrada
            </h1>
            <p className="text-default-600 leading-relaxed">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              color="primary" 
              fullWidth
              size="lg"
              onPress={handleGoHome}
              startContent={<Icon icon={getButtonIcon()} width={18} height={18} />}
            >
              {getButtonText()}
            </Button>
            
            <Button 
              color="default" 
              variant="light" 
              fullWidth
              onPress={handleGoBack}
              startContent={<Icon icon="lucide:arrow-left" width={18} height={18} />}
            >
              Volver atrás
            </Button>
          </div>

        </CardBody>
      </Card>
    </div>
  );
};
