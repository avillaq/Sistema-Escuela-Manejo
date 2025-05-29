import { useNavigate, useLocation, Navigate } from 'react-router';
import { Card, CardBody, CardHeader, Input, Button, Checkbox, Divider, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '../store/auth-store';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const history = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  // If already authenticated, Navigate to dashboard
  if (isAuthenticated) {
    return <Navigate to={from} />;
  }
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        history.replace(from);
      } else {
        setError('Invalid email or password. Try admin@example.com / password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="w-full" shadow="sm">
          <CardHeader className="flex flex-col gap-1 items-center pt-8 pb-0">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
              <Icon icon="lucide:layout-dashboard" className="text-white" width={24} height={24} />
            </div>
            <h1 className="text-2xl font-bold text-center">Dashboard Login</h1>
            <p className="text-default-500 text-center">Enter your credentials to access the dashboard</p>
          </CardHeader>
          
          <CardBody className="py-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-danger-100 text-danger-700 text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:mail" className="text-default-400" width={18} height={18} />
                }
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
                }
              />
              
              <div className="flex justify-between items-center">
                <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                  <span className="text-sm">Remember me</span>
                </Checkbox>
                <Link href="#" size="sm">Forgot password?</Link>
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="relative my-4">
                <Divider className="my-4" />
                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-content1 px-2 text-default-500 text-xs">
                  OR CONTINUE WITH
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="bordered" 
                  startContent={<Icon icon="logos:google-icon" width={18} height={18} />}
                  className="w-full"
                >
                  Google
                </Button>
                <Button 
                  variant="bordered" 
                  startContent={<Icon icon="logos:microsoft-icon" width={18} height={18} />}
                  className="w-full"
                >
                  Microsoft
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
        
        <p className="text-center mt-4 text-default-500 text-sm">
          Demo credentials: admin@example.com / password
        </p>
      </motion.div>
    </div>
  );
};