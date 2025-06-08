import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
} from '@heroui/react';
import { alumnosService } from '@/service/apiService';


export const UserFormModal = ({ isOpen, onOpenChange, onAddUser, editMode = false, dataInicial, tipo = "Usuario" }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    email: '',
    activo: true,
  });

  const [errors, setErrors] = useState({});

  // Se inicializa el formulario con datos por defecto
  useEffect(() => {
    if (editMode && dataInicial) {
      setFormData({
        nombre: dataInicial.nombre,
        apellidos: dataInicial.apellidos,
        dni: dataInicial.dni,
        telefono: dataInicial.telefono,
        email: dataInicial.email,
        activo: dataInicial.activo,
      });
    } else {
      resetForm();
    }
  }, [editMode, dataInicial, isOpen]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

    // Eliminar errores cuando se esta editando
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validarForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 números';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 9 números';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email debe ser válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validarForm()) {
      if (editMode && dataInicial) {
        // Actualizar usuario existente
        const result = await alumnosService.update(dataInicial.id, formData);
        if (result.success) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...result.data,
          }));
        } else {
          alert(result.message || 'Error al actualizar el usuario');
          return;
        }

        const updatedUser = {
          ...dataInicial,
          ...formData,
        };
        onAddUser(updatedUser);
      } else {
        // Añadir nuevo usuario - crear objeto sin 'activo'
        const { activo, ...formDataEnviar } = formData;
        const result = await alumnosService.create(formDataEnviar);
        if (result.success) {
          onAddUser(formData);
          onOpenChange(false);
        } else {
          alert(result.message || 'Error al añadir el usuario');
          return;
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      dni: '',
      telefono: '',
      email: '',
      activo: true,
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen && !editMode) {
      resetForm();
    }
  }, [isOpen, editMode]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {editMode ? `Editar ${tipo}` : `Añadir Nuevo ${tipo}`}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onValueChange={(value) => handleChange('nombre', value)}
                  isRequired
                  isInvalid={!!errors.nombre}
                  errorMessage={errors.nombre}
                />

                <Input
                  label="Apellidos"
                  placeholder="Ingrese los apellidos"
                  value={formData.apellidos}
                  onValueChange={(value) => handleChange('apellidos', value)}
                  isRequired
                  isInvalid={!!errors.apellidos}
                  errorMessage={errors.apellidos}
                />

                <Input
                  label="DNI"
                  placeholder="Formato: 12345678"
                  value={formData.dni}
                  onValueChange={(value) => handleChange('dni', value)}
                  isRequired
                  isInvalid={!!errors.dni}
                  errorMessage={errors.dni}
                />
                <Input
                  label="Teléfono"
                  placeholder="Formato: 987654321"
                  value={formData.telefono}
                  onValueChange={(value) => handleChange('telefono', value)}
                  isRequired
                  isInvalid={!!errors.telefono}
                  errorMessage={errors.telefono}
                />
                <Input
                  label="Email"
                  placeholder="Ingrese el email"
                  value={formData.email}
                  onValueChange={(value) => handleChange('email', value)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                />
                <div className="md:col-span-2">
                  <Checkbox
                    isSelected={formData.activo}
                    onValueChange={(value) => handleChange('activo', value)}
                    isDisabled={!editMode}
                  >
                    {`${tipo} Activo`}
                  </Checkbox>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                {editMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};