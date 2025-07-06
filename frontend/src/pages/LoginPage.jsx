import { useNavigate, useLocation, Navigate } from "react-router";
import { Card, CardBody, CardHeader, Input, Button, Link, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { authService } from "@/service/apiService";
import logoEscuela from "@/assets/logo.PNG";

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} />;
  }

  const handleChange = (field, value) => {
    if (field === 'username') {
      const nuevoValue = value.replace(/\D/g, "").slice(0, 8);
      setFormData({
        ...formData,
        [field]: nuevoValue
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }

    // Eliminar errores cuando se está editando
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validarForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El DNI es obligatorio';
    } else if (formData.username.length !== 8) {
      newErrors.username = 'El DNI debe tener exactamente 8 dígitos';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (formData.password.length > 12) {
      newErrors.password = 'La contraseña no puede tener más de 12 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // prevenir el scroll wheel
  const preventWheel = (e) => {
    e.target.blur();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validarForm()) {
      try {
        const result = await authService.login(formData.username, formData.password);
        if (result.success) {
          login(result.data);
          navigate(from, { replace: true });
          addToast({
            title: "Inicio de Sesión Exitoso",
            description: "Bienvenido a la Escuela de Manejo Jesús Nazareno.",
            severity: "success",
            color: "success",
          });
        } else {
          addToast({
            title: "Error de Acceso",
            description: result.error || "Usuario o contraseña incorrectos.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (err) {
        addToast({
          title: "Error de Conexión",
          description: "Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.",
          severity: "danger",
          color: "danger",
        });
      }
    }
    setIsLoading(false);
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
            <img
                src={logoEscuela}
                alt="Logo Escuela de Manejo Jesús Nazareno"
                className="w-36 h-36 object-contain mb-2 rounded-xl"
            />
            <h1 className="text-2xl font-bold text-blue-900 text-center">JESUS NAZARENO</h1>
            <h1 className="text-2xl font-bold text-red-600 text-center">Escuela De Manejo</h1>
            <p className="text-default-500 text-center">Accede con tu DNI y contraseña</p>
          </CardHeader>

          <CardBody className="py-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="DNI"
                placeholder="Ingresa tu DNI"
                type="number"
                value={formData.username}
                onValueChange={(value) => handleChange('username', value)}
                onWheel={preventWheel}
                variant="bordered"
                isRequired
                isInvalid={!!errors.username}
                errorMessage={errors.username}
                description="Tu número de DNI de 8 dígitos"
                startContent={
                  <Icon icon="lucide:id-card" className="text-default-400" width={18} height={18} />
                }
              />

              <Input
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                type="password"
                value={formData.password}
                onValueChange={(value) => handleChange('password', value)}
                variant="bordered"
                isRequired
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                description="Por defecto es tu DNI, pero puede haber sido cambiada"
                startContent={
                  <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
                }
              />

              <div className="flex justify-end items-center">
                <Link size="sm" onClick={() => {
                  addToast({
                    title: "Recuperación de Acceso",
                    description: "Si tienes problemas para acceder, contacta a tu administrador.",
                    severity: "warning",
                    color: "warning",
                  });
                }}>
                  ¿Problemas para acceder?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                fullWidth
                isLoading={isLoading}
              >
                {isLoading ? "Verificando..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};