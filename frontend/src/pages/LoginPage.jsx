import { useNavigate, useLocation, Navigate } from "react-router";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { authService } from "@/service/apiService";

export const LoginPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const history = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  
  const from = location.state?.from?.pathname || "/dashboard";
  
  if (isAuthenticated) {
    return <Navigate to={from} />;
  }
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (username.trim() === "" || password.trim() === "") {
      setError("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        console.log(result)
        login(result.data);
        history.replace(from);
      } else {
        setError("Usuario or contraseña invalida");
      }
    } catch (err) {
      setError("Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
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
            <h1 className="text-2xl font-bold text-center">Escuela de Manejo Jesus Nazareno</h1>
            <p className="text-default-500 text-center">Ingresa tus credenciales para acceder al dashboard</p>
          </CardHeader>
          
          <CardBody className="py-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-danger-100 text-danger-700 text-sm text-center">
                  {error}
                </div>
              )}
              
              <Input
                label="Usuario"
                placeholder="Ingresa tu usuario"
                type="text"
                value={username}
                onValueChange={setUserName}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:user" className="text-default-400" width={18} height={18} />
                }
              />
              
              <Input
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                isRequired
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
                }
              />
              
              <div className="flex justify-end items-center">
                <Link size="sm" onClick={() => alert("Contactate con el administrador")}>¿Olvidaste tu contraseña?</Link>
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isLoading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};