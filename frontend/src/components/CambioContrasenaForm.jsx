import { useState } from 'react';
import { Input, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { authService } from '@/service/apiService';

export const CambioContrasenaForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return 'Todos los campos son requeridos.';
    }

    if (newPassword.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres.';
    }
    
    if (currentPassword.length > 12) {
      return 'La contraseña actual no puede tener más de 12 caracteres.';
    }

    if (newPassword !== confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    if (currentPassword === newPassword) {
      return 'La nueva contraseña debe ser diferente a la actual.';
    }

    return null;
  };

  const handleInputChange = (field, value) => {
    // Limpiar mensajes cuando el usuario empiece a escribir
    if (error) setError('');
    if (success) setSuccess('');

    switch (field) {
      case 'current':
        setCurrentPassword(value);
        break;
      case 'new':
        setNewPassword(value);
        break;
      case 'confirm':
        setConfirmPassword(value);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.cambioContrasena(currentPassword, newPassword);

      if (result.success) {
        setSuccess('Contraseña actualizada exitosamente.');
        // Limpiar el formulario
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast({
          title: "Contraseña Actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente.",
          severity: "success",
          color: "success",
        });
      } else {
        addToast({
          title: "Error al Cambiar Contraseña",
          description: result.error || "No se pudo cambiar la contraseña. Por favor, inténtalo de nuevo.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (err) {
      setError('Ha ocurrido un error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold">Cambiar Contraseña</h3>
        <p className="text-default-500 text-sm mt-1">
          Actualiza tu contraseña para mantener tu cuenta segura
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-danger-100 text-danger-700 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-success-100 text-success-700 text-sm text-center">
            {success}
          </div>
        )}

        <Input
          label="Contraseña Actual"
          placeholder="Ingresa tu contraseña actual"
          type="password"
          value={currentPassword}
          onValueChange={(value) => handleInputChange('current', value)}
          variant="bordered"
          isRequired
          startContent={
            <Icon icon="lucide:lock" className="text-default-400" width={18} height={18} />
          }
        />

        <Input
          label="Nueva Contraseña"
          placeholder="Ingresa tu nueva contraseña"
          type="password"
          value={newPassword}
          onValueChange={(value) => handleInputChange('new', value)}
          variant="bordered"
          isRequired
          description="Mínimo 8 caracteres"
          startContent={
            <Icon icon="lucide:key" className="text-default-400" width={18} height={18} />
          }
        />

        <Input
          label="Confirmar Nueva Contraseña"
          placeholder="Confirma tu nueva contraseña"
          type="password"
          value={confirmPassword}
          onValueChange={(value) => handleInputChange('confirm', value)}
          variant="bordered"
          isRequired
          description="Repite la nueva contraseña"
          startContent={
            <Icon icon="lucide:shield-check" className="text-default-400" width={18} height={18} />
          }
        />

        <div className="flex gap-3 pt-4">
          <Button
            variant="flat"
            onPress={handleCancel}
            isDisabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </div>
      </form>
    </div>
  );
};