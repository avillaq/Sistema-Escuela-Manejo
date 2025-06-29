import { useState } from 'react';
import { Input, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { authService } from '@/service/apiService';

export const CambioContrasenaForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

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

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    } else if (formData.currentPassword.length > 12) {
      newErrors.currentPassword = 'La contraseña actual no puede tener más de 12 caracteres';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
    } else if (formData.newPassword.length > 12) {
      newErrors.newPassword = 'La nueva contraseña no puede tener más de 12 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmar contraseña es obligatorio';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validarForm()) {
      try {
        const result = await authService.cambioContrasena(formData.currentPassword, formData.newPassword);

        if (result.success) {
          // Limpiar el formulario
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({});
          
          // Toast de éxito
          addToast({
            title: "Contraseña Actualizada",
            description: "Tu contraseña ha sido cambiada exitosamente.",
            severity: "success",
            color: "success",
          });
        } else {
          // Toast de error
          addToast({
            title: "Error al Cambiar Contraseña",
            description: result.error || "No se pudo cambiar la contraseña. Por favor, inténtalo de nuevo.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (err) {
        // Toast de error para excepciones
        addToast({
          title: "Error Inesperado",
          description: "Ha ocurrido un error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.",
          severity: "danger",
          color: "danger",
        });
      }
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Contraseña Actual"
            placeholder="Ingrese su contraseña actual"
            type="password"
            value={formData.currentPassword}
            onValueChange={(value) => handleChange('currentPassword', value)}
            isRequired
            isInvalid={!!errors.currentPassword}
            errorMessage={errors.currentPassword}
            description="Máximo 12 caracteres"
            startContent={
              <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
            }
          />

          <Input
            label="Nueva Contraseña"
            placeholder="Ingrese su nueva contraseña"
            type="password"
            value={formData.newPassword}
            onValueChange={(value) => handleChange('newPassword', value)}
            isRequired
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword}
            description="Entre 8 y 12 caracteres"
            startContent={
              <Icon icon="lucide:key" className="text-default-400" width={18} height={18} />
            }
          />

          <Input
            label="Confirmar Nueva Contraseña"
            placeholder="Confirme su nueva contraseña"
            type="password"
            value={formData.confirmPassword}
            onValueChange={(value) => handleChange('confirmPassword', value)}
            isRequired
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            description="Repita la nueva contraseña"
            startContent={
              <Icon icon="lucide:shield-check" className="text-default-400" width={18} height={18} />
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="flat" 
            onPress={handleCancel}
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            color="primary"
            isLoading={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    </div>
  );
};