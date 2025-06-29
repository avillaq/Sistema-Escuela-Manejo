import { useNavigate, useLocation, Navigate } from "react-router";
import { Card, CardBody, CardHeader, Input, Button, Link, Form } from "@heroui/react";
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

  const handleDNIChange = (value) => {
    const nuevoValue = value.replace(/\D/g, "").slice(0, 8);
    setUserName(nuevoValue);
  }

  // prevenir el scroll wheel
  const preventWheel = (e) => {
    e.target.blur();
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (username.trim() === "" || password.trim() === "") {
      setError("Por favor, ingresa tu DNI en ambos campos.");
      setIsLoading(false);
      return;
    }

    // Validar formato de DNI (8 dígitos)
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(username.trim())) {
      setError("El DNI debe tener exactamente 8 dígitos.");
      setIsLoading(false);
      return;
    }

    if (!dniRegex.test(password.trim())) {
      setError("El DNI debe tener exactamente 8 dígitos.");
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
        setError("DNI no válido o no registrado en el sistema.");
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
            <h1 className="text-2xl font-bold text-center">Escuela de Manejo Jesús Nazareno</h1>
            <p className="text-default-500 text-center">Ingresa tu DNI para acceder al sistema</p>
          </CardHeader>
          
          <CardBody className="py-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-danger-100 text-danger-700 text-sm text-center">
                  {error}
                </div>
              )}
              
              <Input
                label="DNI (Usuario)"
                placeholder="Ingresa tu DNI"
                type="number"
                value={username}
                onValueChange={handleDNIChange}
                onWheel={preventWheel}
                variant="bordered"
                isRequired
                description="Tu número de DNI de 8 dígitos"
                startContent={
                  <Icon icon="lucide:id-card" className="text-default-400" width={18} height={18} />
                }
              />
              
              <Input
                label="DNI (Contraseña)"
                placeholder="Confirma tu DNI"
                type="password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                isRequired
                maxLength={8}
                description="Ingresa nuevamente tu DNI"
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
                }
              />
              
              <div className="flex justify-end items-center">
                <Link size="sm" onClick={() => alert("Si olvidaste tu DNI o tienes problemas para acceder, contacta al administrador de la escuela.")}>
                  ¿Problemas para acceder?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                color="primary" 
                fullWidth 
                isLoading={isLoading}
              >
                {isLoading ? "Verificando DNI..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};